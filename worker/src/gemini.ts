/**
 * Gemini REST client.
 *
 * Two deliberate design choices, both fixing real bugs in the previous backend:
 *
 * 1. There is NO silent local fallback. The old code quietly degraded to a
 *    regex-based formatter on any API error, so a dead model name looked like a
 *    working "smart conspectus". Here a failure surfaces as an error.
 * 2. The model name is not trusted blindly. Every model in the chain is tried in
 *    order, and the exact per-model outcome is reported in `meta.attempts`.
 */

import { CONSPECT_RESPONSE_SCHEMA, coerceConspect } from "./schema";
import type { Conspect, SourceRef } from "./types";

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly attempts: { model: string; ok: boolean; error?: string }[],
    readonly status = 502,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

export interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

export interface GeminiOptions {
  systemInstruction: string;
  parts: GeminiPart[];
  temperature?: number;
  useUrlContext?: boolean;
  thinkingBudget?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

export interface GeminiCallResult {
  conspect: Conspect;
  model: string;
  attempts: { model: string; ok: boolean; error?: string }[];
  usage?: { prompt_tokens?: number; output_tokens?: number; total_tokens?: number };
  sources: SourceRef[];
  warnings: string[];
}

/** Errors that mean "try the next model" rather than "give up". */
function isRetryable(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function isModelUnavailable(status: number, body: string): boolean {
  if (status === 404) return true;
  return /no longer available|not found|not supported|does not support/i.test(body);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Pulls `url_citation` annotations out of the first candidate, if the model used url_context. */
function extractSources(candidate: any): SourceRef[] {
  const out: SourceRef[] = [];
  const seen = new Set<string>();
  const parts: any[] = candidate?.content?.parts ?? [];
  for (const p of parts) {
    for (const a of p?.annotations ?? []) {
      if (a?.type === "url_citation" && typeof a.url === "string" && !seen.has(a.url)) {
        seen.add(a.url);
        out.push({ url: a.url, title: a.title ?? a.url, via: "url_context" });
      }
    }
  }
  return out;
}

export function modelChain(env: { GEMINI_MODEL: string; GEMINI_MODEL_FALLBACKS: string }): string[] {
  const chain = [env.GEMINI_MODEL, ...(env.GEMINI_MODEL_FALLBACKS || "").split(",")]
    .map((m) => m.trim())
    .filter(Boolean);
  return [...new Set(chain)];
}

export async function callGemini(env: any, opts: GeminiOptions): Promise<GeminiCallResult> {
  const chain = modelChain(env);
  const attempts: { model: string; ok: boolean; error?: string }[] = [];
  const warnings: string[] = [];

  if (!env.GEMINI_API_KEY) {
    throw new GeminiError(
      "GEMINI_API_KEY не настроен на сервере. Добавьте его как секрет воркера: wrangler secret put GEMINI_API_KEY",
      [],
      500,
    );
  }

  const generationConfig: Record<string, unknown> = {
    temperature: opts.temperature ?? 0.25,
    responseMimeType: "application/json",
    responseSchema: CONSPECT_RESPONSE_SCHEMA,
    maxOutputTokens: opts.maxOutputTokens ?? 32768,
    thinkingConfig: { thinkingBudget: opts.thinkingBudget ?? 0 },
  };

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: opts.parts }],
    systemInstruction: { parts: [{ text: opts.systemInstruction }] },
    generationConfig,
  };
  if (opts.useUrlContext) {
    body.tools = [{ url_context: {} }];
    // url_context requires the model to actually browse; give it room to think.
    (generationConfig.thinkingConfig as any).thinkingBudget = opts.thinkingBudget ?? 2048;
  }

  for (const model of chain) {
    const url = `${API_ROOT}/${encodeURIComponent(model)}:generateContent`;
    let lastError = "";

    // One in-place retry for transient capacity errors before moving down the chain.
    for (let attempt = 0; attempt < 2; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 120_000);
      try {
        const res = await fetch(`${url}?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        clearTimeout(timer);

        const raw = await res.text();

        if (!res.ok) {
          lastError = `${res.status}: ${raw.slice(0, 500)}`;
          if (isModelUnavailable(res.status, raw)) break; // do not retry a dead model
          if (isRetryable(res.status) && attempt === 0) {
            await sleep(700);
            continue;
          }
          break;
        }

        let parsed: any;
        try {
          parsed = JSON.parse(raw);
        } catch {
          lastError = "Некорректный JSON в ответе Gemini";
          break;
        }

        const candidate = parsed?.candidates?.[0];
        const finish = candidate?.finishReason;
        const text: string = (candidate?.content?.parts ?? [])
          .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
          .join("");

        if (!text) {
          lastError = `Пустой ответ Gemini (finishReason=${finish ?? "unknown"})`;
          if (finish === "MAX_TOKENS") {
            warnings.push(
              "Ответ модели обрезан по лимиту токенов — часть материала могла не попасть в конспект.",
            );
          }
          break;
        }

        let json: unknown;
        try {
          json = JSON.parse(text);
        } catch {
          // Structured output occasionally arrives wrapped in a fenced block.
          const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (!fenced) {
            lastError = "Модель вернула не-JSON";
            break;
          }
          json = JSON.parse(fenced[1]);
        }

        if (finish === "MAX_TOKENS") {
          warnings.push(
            "Ответ модели обрезан по лимиту токенов — часть материала могла не попасть в конспект.",
          );
        }
        if (candidate?.finishReason === "SAFETY") {
          warnings.push("Модель остановила генерацию по фильтру безопасности.");
        }

        attempts.push({ model, ok: true });
        return {
          conspect: coerceConspect(json),
          model,
          attempts,
          usage: parsed?.usageMetadata
            ? {
                prompt_tokens: parsed.usageMetadata.promptTokenCount,
                output_tokens: parsed.usageMetadata.candidatesTokenCount,
                total_tokens: parsed.usageMetadata.totalTokenCount,
              }
            : undefined,
          sources: extractSources(candidate),
          warnings,
        };
      } catch (e: any) {
        clearTimeout(timer);
        lastError =
          e?.name === "AbortError"
            ? `Таймаут запроса к ${model}`
            : `Сетевая ошибка: ${String(e?.message ?? e)}`;
        break;
      }
    }

    attempts.push({ model, ok: false, error: lastError });
  }

  const summary = attempts
    .map((a) => `${a.model}: ${a.ok ? "ok" : a.error}`)
    .join(" | ");
  throw new GeminiError(
    `Ни одна модель Gemini не ответила. Попытки — ${summary}`,
    attempts,
  );
}
