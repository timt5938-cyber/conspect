import type { Env, ConspectResult } from "../types";
import { HttpError, json, rateLimit, requireUser } from "../http";
import { callGemini, modelChain, type GeminiPart } from "../gemini";
import {
  IMAGE_LECTURE_PROMPT,
  URL_SYSTEM_PROMPT,
  buildSystemPrompt,
} from "../prompts";
import { conspectToPlainText } from "../schema";
import { logConspectus } from "../supabase";

const MAX_IMAGES = 8;
const MAX_AUDIO_BYTES = 8_000_000;
const ALLOWED_IMAGE_MIME = /^image\/(png|jpeg|jpg|webp|heic|heif)$/i;
const ALLOWED_AUDIO_MIME = /^audio\/(mpeg|mp3|wav|x-wav|ogg|webm|m4a|mp4|aac|flac)$/i;

export interface InlineMedia {
  mimeType: string;
  data: string;
}

/** Validates and converts client-supplied base64 media into Gemini inline parts. */
function mediaToParts(
  images: InlineMedia[] | undefined,
  audio: InlineMedia | undefined,
): { parts: GeminiPart[]; warnings: string[] } {
  const parts: GeminiPart[] = [];
  const warnings: string[] = [];

  for (const [i, img] of (images ?? []).entries()) {
    if (i >= MAX_IMAGES) {
      warnings.push(`Обработаны только первые ${MAX_IMAGES} изображений.`);
      break;
    }
    if (!img?.mimeType || !img?.data) continue;
    if (!ALLOWED_IMAGE_MIME.test(img.mimeType)) {
      warnings.push(`Формат изображения ${img.mimeType} не поддерживается и пропущен.`);
      continue;
    }
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  }

  if (audio?.mimeType && audio?.data) {
    if (!ALLOWED_AUDIO_MIME.test(audio.mimeType)) {
      warnings.push(`Формат аудио ${audio.mimeType} не поддерживается и пропущен.`);
    } else if (audio.data.length * 0.75 > MAX_AUDIO_BYTES) {
      warnings.push("Аудиофайл слишком большой (лимит ~8 МБ) и пропущен.");
    } else {
      parts.push({ inlineData: { mimeType: audio.mimeType, data: audio.data } });
    }
  }

  return { parts, warnings };
}

function uniqueUrls(input: unknown): string[] {
  const list = Array.isArray(input) ? input : typeof input === "string" ? [input] : [];
  const out: string[] = [];
  for (const raw of list) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    let u: URL;
    try {
      u = new URL(trimmed);
    } catch {
      throw new HttpError(400, `Некорректная ссылка: ${trimmed}`);
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new HttpError(400, `Поддерживаются только http/https ссылки: ${trimmed}`);
    }
    // Do not let the model be pointed at internal infrastructure.
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) ||
      host === "0.0.0.0" ||
      host === "[::1]"
    ) {
      throw new HttpError(400, `Внутренние адреса запрещены: ${trimmed}`);
    }
    if (!out.includes(u.toString())) out.push(u.toString());
  }
  if (out.length === 0) throw new HttpError(400, "Укажите хотя бы одну ссылку");
  if (out.length > 5) throw new HttpError(400, "За один раз можно обработать не более 5 ссылок");
  return out;
}

async function persist(
  env: Env,
  userId: string,
  mode: string,
  sourceKind: string,
  model: string,
  result: ConspectResult,
): Promise<string[]> {
  const warnings = [...result.meta.warnings];
  const { warning } = await logConspectus(env, {
    user_id: userId,
    title: result.conspect.title,
    mode,
    source_kind: sourceKind,
    page_count: 0,
    glyphs_used: 0,
    model,
  });
  if (warning) warnings.push(warning);
  return warnings;
}

export async function handleConspect(
  request: Request,
  env: Env,
  body: any,
  _ctx: ExecutionContext,
): Promise<Response> {
  await rateLimit(request, env, "conspect", 20);
  const user = await requireUser(request, env, body);

  const { parts: mediaParts, warnings: mediaWarnings } = mediaToParts(body.images, body.audio);
  const mode = body.mode === "verbatim" ? "verbatim" : "smart";

  const text: string = typeof body.text === "string" ? body.text.trim() : "";
  if (!text && mediaParts.length === 0) {
    throw new HttpError(400, "Нужен текст, изображения слайдов или аудио лекции");
  }
  if (text.length > 200_000) {
    throw new HttpError(413, "Текст слишком большой (максимум 200 000 символов)");
  }

  const hasImages = (body.images ?? []).length > 0;
  const systemInstruction =
    mode === "verbatim"
      ? buildSystemPrompt("verbatim")
      : hasImages && !text
        ? IMAGE_LECTURE_PROMPT
        : buildSystemPrompt("smart");

  const parts: GeminiPart[] = [...mediaParts];
  if (body.audio?.data) parts.push({ text: "Расшифруй аудиозапись лекции и законспектируй её." });
  if (text) parts.push({ text });

  const call = await callGemini(env, {
    systemInstruction,
    parts,
    temperature: mode === "smart" ? 0.25 : 0.1,
    timeoutMs: 180_000,
  });

  const result: ConspectResult = {
    conspect: call.conspect,
    html: conspectToPlainText(call.conspect),
    meta: {
      model: call.model,
      attempts: call.attempts,
      mode,
      sources: [],
      usage: call.usage,
      warnings: [...mediaWarnings, ...call.warnings],
    },
  };

  if (!user.anonymous) {
    result.meta.warnings = await persist(env, user.id, mode, "text", call.model, result);
  }

  return json(result, { request, env });
}

export async function handleFromUrl(
  request: Request,
  env: Env,
  body: any,
  _ctx: ExecutionContext,
): Promise<Response> {
  await rateLimit(request, env, "from-url", 8);
  const user = await requireUser(request, env, body);

  const urls = uniqueUrls(body.urls ?? body.url);
  const mode = body.mode === "verbatim" ? "verbatim" : "smart";
  const extra: string = typeof body.instructions === "string" ? body.instructions.trim() : "";

  const prompt = [
    "Сделай конспект по этим ссылкам:",
    ...urls.map((u, i) => `${i + 1}. ${u}`),
    extra ? `\nДополнительные требования: ${extra}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const call = await callGemini(env, {
    systemInstruction: URL_SYSTEM_PROMPT,
    parts: [{ text: prompt }],
    temperature: mode === "smart" ? 0.2 : 0.1,
    useUrlContext: true,
    thinkingBudget: 4096,
    timeoutMs: 180_000,
  });

  const warnings = [...call.warnings];
  const sources = call.sources.length
    ? call.sources
    : urls.map((u) => ({ url: u, title: u, via: "none" as const }));

  if (call.sources.length === 0) {
    warnings.push(
      "Модель не вернула источники: страницы могли не открыться или не содержать текста. Проверьте, что ссылки публично доступны.",
    );
  }

  const result: ConspectResult = {
    conspect: call.conspect,
    html: conspectToPlainText(call.conspect),
    meta: {
      model: call.model,
      attempts: call.attempts,
      mode,
      sources,
      usage: call.usage,
      warnings,
    },
  };

  if (!user.anonymous) {
    result.meta.warnings = await persist(env, user.id, mode, "url", call.model, result);
  }

  return json(result, { request, env });
}

export { modelChain };
