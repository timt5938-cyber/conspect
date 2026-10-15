import type { Env } from "../types";
import { HttpError, json, requireUser } from "../http";
import { buildGrid } from "../calibration";
import { modelChain } from "../gemini";
import { getActiveUserFont, listConspectuses, supabaseConfig } from "../supabase";

export async function handleHealth(request: Request, env: Env): Promise<Response> {
  let supabase: Record<string, unknown>;
  try {
    const cfg = supabaseConfig(env);
    supabase = { configured: true, mode: cfg.mode, url: cfg.url };
  } catch (e: any) {
    supabase = { configured: false, error: e?.message ?? String(e) };
  }

  return json(
    {
      status: "ok",
      service: "conspect-api",
      version: "3.0.0",
      gemini: {
        configured: Boolean(env.GEMINI_API_KEY),
        primary_model: env.GEMINI_MODEL,
        fallback_chain: modelChain(env),
      },
      supabase,
      rate_limit: env.RATE_LIMIT ? "enabled" : "disabled (KV namespace not bound)",
      calibration: { grid_version: buildGrid().version, cells: buildGrid().cells.length },
    },
    { request, env },
  );
}

export async function handlePresets(request: Request, env: Env): Promise<Response> {
  return json(
    {
      presets: [
        {
          id: "user_handwriting",
          name: "Мой почерк",
          desc: "Ваши собственные буквы, откалиброванные по фото листа A4",
          custom: true,
        },
        { id: "marck_script", name: "Курсивный студенческий", desc: "Живой беглый рукописный почерк" },
        { id: "caveat", name: "Полупечатный аккуратный", desc: "Чёткий разборчивый почерк" },
        { id: "bad_script", name: "Небрежный конспект", desc: "Быстрая запись шариковой ручкой" },
        { id: "segoe_print", name: "Печатный", desc: "Прямые чёткие буквы" },
      ],
      paper_styles: [
        { id: "squared_5mm", name: "Клетка 5 мм", desc: "Классическая студенческая тетрадь" },
        { id: "ruled", name: "Линейка", desc: "Тетрадь в линейку" },
        { id: "blank", name: "Чистый лист", desc: "Без разметки" },
      ],
      pen_colors: [
        { id: "blue_ballpoint", name: "Синяя шариковая", hex: "#1a44a0" },
        { id: "gel_black", name: "Чёрная гелевая", hex: "#18181c" },
        { id: "purple", name: "Фиолетовые чернила", hex: "#4e1e8c" },
        { id: "red_ink", name: "Красная ручка", hex: "#b91c1c" },
        { id: "pencil", name: "Карандаш HB", hex: "#4b5563" },
      ],
      modes: [
        { id: "smart", name: "Умный конспект", desc: "Сжатие с сохранением определений, формул и выводов" },
        { id: "verbatim", name: "Слово в слово", desc: "Только исправление опечаток, без пересказа" },
      ],
      calibration_grid: buildGrid(),
      max_urls: 5,
      max_images: 8,
      max_handwriting_pages: 6,
    },
    { request, env },
  );
}

export async function handleFont(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");
  if (!userId) throw new HttpError(400, "Укажите ?user_id=");

  const font = await getActiveUserFont(env, userId);
  if (!font) {
    return json({ font: null }, { request, env });
  }
  return json({ font }, { request, env });
}

export async function handleHistory(request: Request, env: Env): Promise<Response> {
  const user = await requireUser(request, env);
  if (user.anonymous) {
    return json({ conspectuses: [] }, { request, env });
  }
  return json({ conspectuses: await listConspectuses(env, user.id) }, { request, env });
}
