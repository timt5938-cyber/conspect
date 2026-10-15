import type { Env, StoredGlyph } from "../types";
import { HttpError, json, rateLimit, requireUser } from "../http";
import { GRID_VERSION, buildGrid, isDescender, isXHeightOnly } from "../calibration";
import { saveUserFont, uploadAsset } from "../supabase";

const MAX_GLYPHS = 200;
const MAX_GLYPH_BYTES = 160_000; // ~120 KB PNG after base64
const MAX_GLYPH_DIM = 512;

interface IncomingGlyph {
  char: string;
  png: string;
  /** Ink bottom as a fraction of the cell height (0 = cell top, 1 = cell bottom). */
  bottom: number;
  /** Ink top as a fraction of the cell height. */
  top: number;
  /** Ink box as fractions of the cell box, so aspect can be reconstructed. */
  widthFrac: number;
  heightFrac: number;
  cellAspect?: number;
}

function assertPng(dataUrl: string, char: string): void {
  if (!/^data:image\/png;base64,/.test(dataUrl)) {
    throw new HttpError(400, `Глиф "${char}" должен быть PNG data URL`);
  }
  const b64 = dataUrl.slice("data:image/png;base64,".length);
  if (b64.length > MAX_GLYPH_BYTES) {
    throw new HttpError(413, `Глиф "${char}" слишком большой (${Math.round(b64.length / 1024)} КБ)`);
  }
  if (b64.length < 40) {
    throw new HttpError(400, `Глиф "${char}" пустой`);
  }
}

/**
 * Receives glyphs the client already cropped from each calibration cell.
 *
 * Cropping and trimming happen in the browser on a canvas: it is free, instant,
 * and keeps the worker well inside the free-tier CPU budget. The worker's job is
 * validation, baseline reconstruction and persistence.
 */
export async function handleCalibrate(
  request: Request,
  env: Env,
  body: any,
): Promise<Response> {
  await rateLimit(request, env, "calibrate", 10);
  const user = await requireUser(request, env, body);

  if (user.anonymous) {
    throw new HttpError(
      401,
      "Калибровка почерка требует входа в аккаунт — иначе шрифт некуда сохранить.",
    );
  }

  const incoming: IncomingGlyph[] = Array.isArray(body.glyphs) ? body.glyphs : [];
  if (incoming.length === 0) {
    throw new HttpError(400, "Не получено ни одного глифа");
  }
  if (incoming.length > MAX_GLYPHS) {
    throw new HttpError(413, `Слишком много глифов (${incoming.length}, максимум ${MAX_GLYPHS})`);
  }

  const valid = buildGrid().cells.map((c) => c.char);
  const warnings: string[] = [];

  for (const g of incoming) {
    if (typeof g?.char !== "string" || !valid.includes(g.char)) {
      throw new HttpError(400, `Неизвестный символ в наборе глифов: ${JSON.stringify(g?.char)}`);
    }
    assertPng(g.png, g.char);
    if (!Number.isFinite(g.bottom) || g.bottom < -0.5 || g.bottom > 1.5) {
      throw new HttpError(400, `Некорректная позиция baseline для "${g.char}"`);
    }
  }

  // --- Reconstruct a shared baseline -----------------------------------------
  // Cropped glyphs lose their offset from the writing line. Characters that sit
  // flat on the baseline (а, о, е, digits, no descenders) tell us where that line
  // is: the median of their ink bottoms. Everything else is stored relative to it.
  const flatBottoms = incoming
    .filter((g) => !isDescender(g.char))
    .map((g) => g.bottom)
    .sort((a, b) => a - b);

  if (flatBottoms.length === 0) {
    throw new HttpError(
      400,
      "Не найдено ни одного символа на базовой линии — проверьте, что буквы написаны внутри ячеек.",
    );
  }
  const baseline = flatBottoms[Math.floor(flatBottoms.length / 2)];

  const glyphs: Record<string, StoredGlyph> = {};
  for (const g of incoming) {
    const cellAspect = Number(g.cellAspect) > 0 ? Number(g.cellAspect) : 0.8;
    // Width and height are fractions of the cell; cell is `cellAspect` wide per unit height.
    const h = Math.max(0.02, Number(g.heightFrac) || 0.2);
    const w = Math.max(0.015, Number(g.widthFrac) || 0.1);
    const aspect = (w * cellAspect) / h;

    glyphs[g.char] = {
      png: g.png,
      // Positive => ink bottom sits below the shared baseline (real descenders).
      baseline: Number((g.bottom - baseline).toFixed(4)),
      xheight: isXHeightOnly(g.char) ? 1 : undefined,
      aspect: Number(aspect.toFixed(4)),
    };
  }

  const extractedCount = Object.keys(glyphs).length;
  const totalChars = valid.length;
  if (extractedCount < totalChars * 0.6) {
    warnings.push(
      `Распознано ${extractedCount} из ${totalChars} символов. Проверьте, что каждая буква написана внутри своей ячейки и не выходит за её границы.`,
    );
  }

  // --- Persist: glyph JSON in the table, page preview in storage -------------
  const glyphData = {
    grid_version: GRID_VERSION,
    baseline,
    extracted_count: extractedCount,
    total_chars: totalChars,
    glyphs,
  };

  let storagePath: string | null = null;
  if (typeof body.preview_png === "string" && body.preview_png.startsWith("data:image/png;base64,")) {
    try {
      const b64 = body.preview_png.slice("data:image/png;base64,".length);
      const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      storagePath = `users/${user.id}/calibration_${Date.now()}.png`;
      await uploadAsset(env, bin.buffer as ArrayBuffer, storagePath, "image/png");
    } catch (e: any) {
      storagePath = null;
      warnings.push(`Превью калибровки не сохранено: ${e?.message ?? e}`);
    }
  }

  const { id, warning } = await saveUserFont(env, {
    user_id: user.id,
    font_name: typeof body.font_name === "string" && body.font_name.trim()
      ? body.font_name.trim().slice(0, 60)
      : "Мой почерк",
    is_active: true,
    glyph_data: glyphData,
    storage_path: storagePath,
    extracted_count: extractedCount,
    total_chars: totalChars,
  });
  if (warning) warnings.push(warning);

  return json(
    {
      success: true,
      font_id: id,
      extracted_count: extractedCount,
      total_chars: totalChars,
      baseline,
      missing: valid.filter((c) => !(c in glyphs)),
      warnings,
      message: `Сохранено ${extractedCount} из ${totalChars} символов вашего почерка.`,
    },
    { request, env },
  );
}
