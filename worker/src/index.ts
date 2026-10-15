import type { Env } from "./types";
import { handleCalibrate } from "./handlers/calibrate";
import { handleConspect, handleFromUrl } from "./handlers/conspect";
import { handleFromHandwriting } from "./handlers/handwriting";
import { handleFont, handleHistory, handlePresets, handleHealth } from "./handlers/misc";
import { HttpError, corsHeaders, fail, json, readJson } from "./http";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    try {
      if (path === "/" || path === "/api") {
        return json(
          {
            service: "conspect-api",
            version: "3.0.0",
            endpoints: [
              "GET  /api/health",
              "GET  /api/presets",
              "GET  /api/font",
              "GET  /api/history",
              "POST /api/conspect",
              "POST /api/from-url",
              "POST /api/from-handwriting",
              "POST /api/calibrate",
            ],
          },
          { request, env },
        );
      }

      if (path === "/api/health" && request.method === "GET") {
        return await handleHealth(request, env);
      }
      if (path === "/api/presets" && request.method === "GET") {
        return await handlePresets(request, env);
      }
      if (path === "/api/font" && request.method === "GET") {
        return await handleFont(request, env);
      }
      if (path === "/api/history" && request.method === "GET") {
        return await handleHistory(request, env);
      }

      if (path === "/api/conspect" && request.method === "POST") {
        const body = await readJson<any>(request, 24_000_000);
        return await handleConspect(request, env, body, ctx);
      }
      if (path === "/api/from-url" && request.method === "POST") {
        const body = await readJson<any>(request, 200_000);
        return await handleFromUrl(request, env, body, ctx);
      }
      if (path === "/api/from-handwriting" && request.method === "POST") {
        const body = await readJson<any>(request, 24_000_000);
        return await handleFromHandwriting(request, env, body, ctx);
      }
      if (path === "/api/calibrate" && request.method === "POST") {
        const body = await readJson<any>(request, 32_000_000);
        return await handleCalibrate(request, env, body);
      }

      throw new HttpError(404, `Неизвестный маршрут: ${request.method} ${path}`);
    } catch (error) {
      console.error("request failed", path, error);
      return fail(error, request, env);
    }
  },
} satisfies ExportedHandler<Env>;
