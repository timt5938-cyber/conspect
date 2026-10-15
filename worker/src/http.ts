/**
 * Small HTTP helpers: CORS, JSON responses, errors, rate limiting, JWT verification.
 * No framework — this keeps the worker bundle tiny and cold starts negligible.
 */

import type { Env } from "./types";
import { verifySupabaseJwt } from "./jwt";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("origin") ?? "";
  const allow = allowedOrigins(env);
  const headers: Record<string, string> = {
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
  if (!origin) return headers;

  const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (allow.includes(origin) || isLocalhost) {
    headers["access-control-allow-origin"] = origin;
  }
  return headers;
}

/** Only ever echo back an origin we explicitly trust; never `*` with credentials. */
export function json(
  data: unknown,
  init: { status?: number; request: Request; env: Env; headers?: Record<string, string> },
): Response {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders(init.request, init.env),
      ...(init.headers ?? {}),
    },
  });
}

export function fail(error: unknown, request: Request, env: Env): Response {
  if (error instanceof HttpError) {
    return json({ error: error.message, details: error.details ?? null }, {
      status: error.status,
      request,
      env,
    });
  }
  const message = error instanceof Error ? error.message : String(error);
  // Surface the failure honestly — the client must never believe it got a conspectus.
  const attempts = (error as any)?.attempts;
  return json(
    { error: message, details: attempts ? { attempts } : null },
    { status: (error as any)?.status ?? 500, request, env },
  );
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Fixed-window rate limiter, per IP + route. Fail-open when KV is not bound so a
 * missing namespace never takes the API down — but it is loudly reported at /api/health.
 */
export async function rateLimit(
  request: Request,
  env: Env,
  route: string,
  limit: number,
  windowSec = 60,
): Promise<void> {
  const kv = env.RATE_LIMIT;
  if (!kv) return;

  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / windowSec);
  const key = `rl:${route}:${clientIp(request)}:${bucket}`;

  const current = Number((await kv.get(key)) ?? "0");
  if (current >= limit) {
    throw new HttpError(429, `Слишком много запросов. Лимит: ${limit} в ${windowSec} с.`);
  }
  await kv.put(key, String(current + 1), { expirationTtl: windowSec * 2 });
}

/** Reads and validates a JSON request body with a size guard. */
export async function readJson<T>(request: Request, maxBytes = 2_000_000): Promise<T> {
  const len = Number(request.headers.get("content-length") ?? "0");
  if (len && len > maxBytes) {
    throw new HttpError(413, `Тело запроса слишком большое (${len} байт, максимум ${maxBytes})`);
  }
  const text = await request.text();
  if (text.length > maxBytes) {
    throw new HttpError(413, `Тело запроса слишком большое (${text.length} байт, максимум ${maxBytes})`);
  }
  if (!text.trim()) throw new HttpError(400, "Пустое тело запроса");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "Тело запроса не является корректным JSON");
  }
}

export interface AuthUser {
  id: string;
  email?: string;
  anonymous: boolean;
}

/**
 * Resolves the caller.
 *
 * - With a valid Supabase JWT: the real user id. This is the only way to write to
 *   an account.
 * - Without one: an anonymous id derived from a client-generated key, kept in a
 *   separate `anon:` namespace so it can never collide with (or touch) a real
 *   account's rows. The old backend trusted a raw `user_id` from the request body,
 *   which let anyone write into anyone else's storage folder.
 */
export async function requireUser(request: Request, env: Env, body?: any): Promise<AuthUser> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";

  if (token) {
    const claims = await verifySupabaseJwt(token, env);
    if (claims?.sub) {
      return { id: claims.sub, email: claims.email, anonymous: false };
    }
    throw new HttpError(401, "Недействительный или истёкший токен авторизации");
  }

  const anonKey = typeof body?.anon_key === "string" ? body.anon_key : "";
  if (anonKey && /^[a-zA-Z0-9_-]{8,64}$/.test(anonKey)) {
    return { id: `anon:${anonKey}`, anonymous: true };
  }

  // Fully anonymous: ephemeral identity, nothing is persisted under an account.
  return { id: "anon:ephemeral", anonymous: true };
}
