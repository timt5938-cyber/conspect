/**
 * Supabase REST client.
 *
 * Uses the service-role key when configured (server-side writes, bypasses RLS) and
 * transparently falls back to the publishable key so the studio still works on a
 * project whose RLS policies it does not control. The chosen mode is reported by
 * /api/health so it is never a mystery.
 */

import type { Env, UserFont, StoredGlyph } from "./types";
import { HttpError } from "./http";

interface SupabaseConfig {
  url: string;
  key: string;
  mode: "service_role" | "publishable";
}

export function supabaseConfig(env: Env): SupabaseConfig {
  const url = env.SUPABASE_URL.replace(/\/+$/, "");
  if (env.SUPABASE_SERVICE_KEY) {
    return { url, key: env.SUPABASE_SERVICE_KEY, mode: "service_role" };
  }
  if (env.SUPABASE_ANON_KEY) {
    return { url, key: env.SUPABASE_ANON_KEY, mode: "publishable" };
  }
  throw new HttpError(
    500,
    "Supabase не настроен: задайте секрет SUPABASE_SERVICE_KEY или переменную SUPABASE_ANON_KEY",
  );
}

async function rest(
  env: Env,
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<Response> {
  const cfg = supabaseConfig(env);
  const headers: Record<string, string> = {
    apikey: cfg.key,
    authorization: `Bearer ${cfg.key}`,
    "content-type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (init.prefer) headers.prefer = init.prefer;

  const res = await fetch(`${cfg.url}/rest/v1/${path}`, { ...init, headers });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new HttpError(
      res.status === 404 ? 404 : 502,
      `Supabase запрос не удался (${res.status}). ${describeSupabaseError(detail)}`,
    );
  }
  return res;
}

/** Turns Supabase's raw PostgREST errors into something a human can act on. */
function describeSupabaseError(detail: string): string {
  if (/relation .* does not exist|Could not find the table/i.test(detail)) {
    return `Таблица не найдена — примените SQL из docs/supabase-schema.sql. Ответ: ${detail.slice(0, 300)}`;
  }
  if (/row-level security|permission denied/i.test(detail)) {
    return `Заблокировано RLS. Задайте секрет SUPABASE_SERVICE_KEY: wrangler secret put SUPABASE_SERVICE_KEY. Ответ: ${detail.slice(0, 300)}`;
  }
  return detail.slice(0, 400);
}

export interface FontRow {
  id?: string;
  user_id: string;
  font_name: string;
  is_active: boolean;
  glyph_data: any;
  storage_path?: string | null;
  extracted_count?: number;
  total_chars?: number;
  created_at?: string;
}

export async function saveUserFont(
  env: Env,
  row: FontRow,
): Promise<{ id: string | null; warning?: string }> {
  const warnings: string[] = [];

  // Deactivate previous fonts so exactly one is active per user.
  try {
    await rest(env, `user_fonts?user_id=eq.${encodeURIComponent(row.user_id)}&is_active=eq.true`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: false }),
      prefer: "return=minimal",
    });
  } catch (e: any) {
    warnings.push(`Не удалось снять прошлые шрифты с активного статуса: ${e?.message ?? e}`);
  }

  const res = await rest(env, "user_fonts", {
    method: "POST",
    body: JSON.stringify(row),
    prefer: "return=representation",
  });
  const data = (await res.json()) as FontRow[];
  return { id: data?.[0]?.id ?? null, warning: warnings.join(" ") || undefined };
}

export async function getActiveUserFont(
  env: Env,
  userId: string,
): Promise<UserFont | null> {
  const res = await rest(
    env,
    `user_fonts?user_id=eq.${encodeURIComponent(userId)}&is_active=eq.true&order=created_at.desc&limit=1`,
    { method: "GET" },
  );
  const rows = (await res.json()) as FontRow[];
  if (!rows?.length) return null;
  const r = rows[0];
  const gd = (r.glyph_data ?? {}) as any;

  // Accept both the new shape ({glyphs:{...}, grid_version}) and anything older.
  const glyphs: Record<string, StoredGlyph> = gd.glyphs ?? gd ?? {};
  return {
    id: String(r.id),
    user_id: r.user_id,
    font_name: r.font_name,
    is_active: r.is_active,
    grid_version: Number(gd.grid_version ?? 1),
    glyphs,
    extracted_count: Number(gd.extracted_count ?? r.extracted_count ?? Object.keys(glyphs).length),
    total_chars: Number(gd.total_chars ?? r.total_chars ?? 0),
    created_at: r.created_at,
  };
}

export async function logConspectus(
  env: Env,
  row: {
    user_id: string;
    title: string;
    mode: string;
    source_kind: string;
    page_count: number;
    glyphs_used: number;
    preview_url?: string | null;
    pdf_url?: string | null;
    model?: string | null;
  },
): Promise<{ id: string | null; warning?: string }> {
  try {
    const res = await rest(env, "conspectuses", {
      method: "POST",
      body: JSON.stringify(row),
      prefer: "return=representation",
    });
    const data = (await res.json()) as any[];
    return { id: data?.[0]?.id ?? null };
  } catch (e: any) {
    // History is a nice-to-have; never fail a rendered conspectus because of it.
    return { id: null, warning: `Конспект не сохранён в историю: ${e?.message ?? e}` };
  }
}

export async function listConspectuses(env: Env, userId: string): Promise<any[]> {
  const res = await rest(
    env,
    `conspectuses?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=50`,
    { method: "GET" },
  );
  return (await res.json()) as any[];
}

/** Uploads a binary asset to the storage bucket. */
export async function uploadAsset(
  env: Env,
  bytes: ArrayBuffer,
  remotePath: string,
  contentType: string,
): Promise<string | null> {
  const cfg = supabaseConfig(env);
  const bucket = env.SUPABASE_BUCKET || "conspectus-assets";
  const res = await fetch(
    `${cfg.url}/storage/v1/object/${bucket}/${remotePath}`,
    {
      method: "POST",
      headers: {
        apikey: cfg.key,
        authorization: `Bearer ${cfg.key}`,
        "content-type": contentType,
        "x-upsert": "true",
      },
      body: bytes,
    },
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new HttpError(502, `Загрузка в Supabase Storage не удалась (${res.status}): ${detail.slice(0, 300)}`);
  }
  return `${cfg.url}/storage/v1/object/public/${bucket}/${remotePath}`;
}
