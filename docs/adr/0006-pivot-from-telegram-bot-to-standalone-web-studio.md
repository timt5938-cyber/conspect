# 6. Pivot from Telegram Bot to Standalone Liquid Chrome Web Studio

Date: 2026-10-06

## Status
Accepted

## Context
Originally, the project was envisioned as a Telegram Bot and Telegram Mini App hybrid running on Vercel with webhooks and long-polling fallbacks.
However:
1. Telegram Bot platform constraints (mobile webview black screens, HTTP restrictions, webhook cold starts) limited user experience.
2. The user requested complete removal of the Telegram Bot in favor of a standalone, high-performance web platform (`conspect`).
3. The platform requires a premium, dark liquid-chrome visual identity matching `timt5938-cyber/sait` with WebGL shaders, kinetic bento grids, and smooth scroll animations.
4. Independent email/password user authentication is required using Supabase Auth.
5. All Vercel-specific couplings must be removed.

## Decision
1. **Ditch Telegram Bot & Vercel**: Remove all aiogram bot handlers, webhooks, and `vercel.json` configurations.
2. **Dedicated Route Separation**:
   - `/` - **Showcase Landing**: Dark liquid chrome centerpiece, kinetic bento grid, interactive sandbox demo, and step-by-step handwriting onboarding.
   - `/auth` - **Auth Gateway**: Supabase Email/Password authentication.
   - `/app` - **Studio Workspace**: Full handwritten note creation, OpenCV A4 calibration, and multi-page vector PDF compiler.
3. **Supabase Project Migration**: Transition to newly provisioned project `conspect` (`https://ddvzcqeunaappryvbuov.supabase.co`) with Supabase Auth, profiles, user fonts, and conspectus storage.
4. **Pre-push Verification**: Launch the UI on `http://localhost:5173` for interactive review before publishing to `timt5938-cyber/conspect`.

## Consequences
- Clean separation between frontend (React 18 + Vite + TailwindCSS + Three.js/WebGL) and backend services.
- Zero reliance on external chat messengers or serverless timeout limits.
- High-fidelity dark chrome user interface with smooth animations.
