import type { ConspectResult, Env } from "../types";
import { HttpError, json, rateLimit, requireUser } from "../http";
import { callGemini, type GeminiPart } from "../gemini";
import { HANDWRITING_TRANSCRIBE_PROMPT } from "../prompts";
import { conspectToPlainText } from "../schema";
import { logConspectus } from "../supabase";

const MAX_PAGES = 6;
const ALLOWED_MIME = /^image\/(png|jpeg|jpg|webp|heic|heif)$/i;

/**
 * Reads a photograph of a handwritten page and turns it into a structured
 * conspectus. Combined with the user's own glyph library this is the
 * "conspectus from your handwriting" mode: the model reads what is written,
 * the client re-renders it in the user's own hand.
 */
export async function handleFromHandwriting(
  request: Request,
  env: Env,
  body: any,
  _ctx: ExecutionContext,
): Promise<Response> {
  await rateLimit(request, env, "from-handwriting", 10);
  const user = await requireUser(request, env, body);

  const pages: any[] = Array.isArray(body.images) ? body.images : [];
  if (pages.length === 0) {
    throw new HttpError(400, "Загрузите хотя бы одну фотографию рукописной страницы");
  }

  const parts: GeminiPart[] = [];
  const warnings: string[] = [];

  for (const [i, img] of pages.entries()) {
    if (i >= MAX_PAGES) {
      warnings.push(`Обработаны только первые ${MAX_PAGES} страниц.`);
      break;
    }
    if (!img?.mimeType || !img?.data) continue;
    if (!ALLOWED_MIME.test(img.mimeType)) {
      throw new HttpError(400, `Формат ${img.mimeType} не поддерживается. Используйте JPEG, PNG или WEBP.`);
    }
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  }

  if (parts.length === 0) {
    throw new HttpError(400, "Не получено ни одного корректного изображения");
  }

  const extra = typeof body.instructions === "string" ? body.instructions.trim() : "";
  parts.push({
    text: [
      `Расшифруй ${parts.length > 1 ? "эти рукописные страницы" : "эту рукописную страницу"} и оформи как конспект.`,
      extra ? `Дополнительные требования: ${extra}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  const call = await callGemini(env, {
    systemInstruction: HANDWRITING_TRANSCRIBE_PROMPT,
    parts,
    temperature: 0.1,
    // Reading handwriting benefits from real reasoning; give it a budget.
    thinkingBudget: 4096,
    timeoutMs: 180_000,
  });

  const result: ConspectResult = {
    conspect: call.conspect,
    html: conspectToPlainText(call.conspect),
    meta: {
      model: call.model,
      attempts: call.attempts,
      mode: "handwriting",
      sources: [],
      usage: call.usage,
      warnings: [...warnings, ...call.warnings],
    },
  };

  if (!user.anonymous) {
    const { warning } = await logConspectus(env, {
      user_id: user.id,
      title: result.conspect.title,
      mode: "handwriting",
      source_kind: "handwriting",
      page_count: parts.length - 1,
      glyphs_used: 0,
      model: call.model,
    });
    if (warning) result.meta.warnings.push(warning);
  }

  return json(result, { request, env });
}
