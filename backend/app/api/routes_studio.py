import base64
import cv2
import numpy as np
import logging
from io import BytesIO
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ..gemini.client import gemini_service
from ..rendering.handwriting_engine import handwriting_engine
from ..rendering.pdf_builder import pdf_builder
from ..rendering.paper_canvas import paper_canvas
from ..cv.sheet_detector import sheet_detector
from ..cv.glyph_extractor import glyph_extractor
from ..storage.supabase_client import supabase_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["studio"])

class PreviewRequest(BaseModel):
    text: str
    paper_style: str = "squared_5mm"
    has_margins: bool = True
    pen_color: str = "blue_ballpoint"
    font_preset: str = "marck_script"
    jitter: float = 1.0
    slant: float = 1.0
    humanize: bool = True

class GenerateRequest(BaseModel):
    user_id: Optional[str] = None
    text: Optional[str] = None
    mode: str = "smart"  # "smart" or "verbatim"
    paper_style: str = "squared_5mm"
    has_margins: bool = True
    pen_color: str = "blue_ballpoint"
    font_preset: str = "marck_script"
    jitter: float = 1.0
    slant: float = 1.0
    humanize: bool = True
    custom_gemini_key: Optional[str] = None

@router.get("/presets")
async def get_presets():
    return {
        "presets": [
            {"id": "marck_script", "name": "Курсивный студенческий", "desc": "Живой беглый русский рукописный почерк"},
            {"id": "bad_script", "name": "Небрежный конспект", "desc": "Свободный студенческий почерк шариковой ручкой"},
            {"id": "caveat", "name": "Полупечатный аккуратный", "desc": "Четкий разборчивый почерк для конспектов"},
            {"id": "segoe_print", "name": "Печатный конспект", "desc": "Прямые четкие буквы с легким наклоном"}
        ],
        "paper_styles": [
            {"id": "squared_5mm", "name": "Клетка 5 мм (Студенческая с полями)"},
            {"id": "ruled", "name": "Линейка"},
            {"id": "blank", "name": "Белый чистый лист"}
        ],
        "pen_colors": [
            {"id": "blue_ballpoint", "name": "Синяя шариковая", "hex": "#1e40af"},
            {"id": "black_gel", "name": "Черная гелевая", "hex": "#0f172a"},
            {"id": "purple_ink", "name": "Фиолетовые чернила", "hex": "#581c87"},
            {"id": "red_pen", "name": "Красная ручка", "hex": "#991b1b"},
            {"id": "pencil", "name": "Карандаш HB", "hex": "#475569"}
        ]
    }

@router.post("/preview")
async def preview_page(req: PreviewRequest):
    """Returns a base64 JPEG image of the first rendered handwritten page for instant preview."""
    try:
        pages = handwriting_engine.render_conspectus(
            text=req.text,
            paper_style=req.paper_style,
            has_margins=req.has_margins,
            pen_color=req.pen_color,
            font_preset=req.font_preset,
            jitter=req.jitter,
            slant=req.slant,
            humanize=req.humanize
        )
        if not pages:
            raise HTTPException(status_code=400, detail="Failed to render page")

        buf = BytesIO()
        pages[0].convert("RGB").save(buf, format="JPEG", quality=85)
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return {
            "page_preview_base64": f"data:image/jpeg;base64,{b64}",
            "total_pages": len(pages)
        }
    except Exception as e:
        logger.error("Preview render error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_conspectus(req: GenerateRequest):
    """Synthesizes text through Gemini, renders multi-page notebook sheets, and builds PDF."""
    try:
        # 1. Structure raw text with Gemini
        formatted_text = await gemini_service.generate_conspectus_text(
            raw_text=req.text or "Лекция без текста",
            mode=req.mode,
            custom_key=req.custom_gemini_key
        )

        # 2. Render all handwritten pages
        pages = handwriting_engine.render_conspectus(
            text=formatted_text,
            paper_style=req.paper_style,
            has_margins=req.has_margins,
            pen_color=req.pen_color,
            font_preset=req.font_preset,
            jitter=req.jitter,
            slant=req.slant,
            humanize=req.humanize
        )

        # 3. Build PDF bytes
        pdf_bytes = pdf_builder.build_pdf_from_images(pages)

        # 4. First page preview JPEG
        pbuf = BytesIO()
        pages[0].convert("RGB").save(pbuf, format="JPEG", quality=85)
        preview_bytes = pbuf.getvalue()
        preview_b64 = base64.b64encode(preview_bytes).decode("utf-8")

        # Extract title for doc
        title = "Конспект"
        for line in formatted_text.splitlines():
            if line.startswith("Тема:"):
                title = line.replace("Тема:", "").strip()
                break

        pdf_url = None
        preview_url = None

        # 5. If user is authenticated, upload to Supabase storage & DB
        if req.user_id:
            safe_title = "".join(c for c in title if c.isalnum() or c in (" ", "-", "_"))[:20]
            pdf_url = await supabase_service.upload_asset(
                file_bytes=pdf_bytes,
                remote_filename=f"users/{req.user_id}/conspectus_{safe_title}.pdf",
                content_type="application/pdf"
            )
            preview_url = await supabase_service.upload_asset(
                file_bytes=preview_bytes,
                remote_filename=f"users/{req.user_id}/preview_{safe_title}.jpg",
                content_type="image/jpeg"
            )

            await supabase_service.log_conspectus(
                user_id=req.user_id,
                title=title,
                mode=req.mode,
                page_count=len(pages),
                pdf_url=pdf_url,
                preview_url=preview_url
            )

        pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

        return {
            "success": True,
            "title": title,
            "page_count": len(pages),
            "pdf_url": pdf_url,
            "pdf_base64": f"data:application/pdf;base64,{pdf_b64}",
            "preview_base64": f"data:image/jpeg;base64,{preview_b64}",
            "formatted_text": formatted_text
        }

    except Exception as e:
        logger.error("Generation error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calibrate")
async def process_calibration_upload(
    user_id: str = Form(...),
    photo: UploadFile = File(...)
):
    """Processes uploaded plain A4 photo, extracts glyphs and saves to Supabase."""
    try:
        contents = await photo.read()
        nparr = np.frombuffer(contents, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # 1. Warp perspective
        warped = sheet_detector.warp_sheet(img_bgr)

        # 2. Extract glyphs from plain A4 (Uppercase, Lowercase, Digits)
        res = glyph_extractor.extract_from_freeform_a4(warped)

        # 3. Save to Supabase
        font_id = await supabase_service.save_user_font(
            user_id=user_id,
            font_name="Мой личный почерк",
            glyph_data=res,
            storage_path=f"users/{user_id}/font.json"
        )

        return {
            "success": True,
            "font_id": font_id,
            "extracted_count": res["extracted_count"],
            "total_chars": res["total_chars"],
            "message": f"Успешно извлечено {res['extracted_count']} из {res['total_chars']} символов вашего почерка!"
        }
    except Exception as e:
        logger.error("Calibration error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-conspectuses/{user_id}")
async def get_user_conspectuses(user_id: str):
    """Returns list of conspectuses created by the user."""
    items = await supabase_service.get_user_conspectuses(user_id)
    return {"conspectuses": items}
