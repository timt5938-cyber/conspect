# Conspectus Web Studio (Конспект)

A web-based platform with a dark liquid chrome aesthetic that turns raw lecture materials (text, audio recordings, photo slides) into realistic handwritten notes on authentic notebook paper (5mm squared, lined, red margins, natural jitter) with Supabase Cloud Auth and storage.

## Architecture & Routes

**Showcase Landing (`/`)**:
The public presentation entrance inspired by `timt5938-cyber/sait`, featuring a 3D Liquid Chrome logo, animated dark bento grid, smooth scrolling, step-by-step handwriting calibration instructions, and an embedded Interactive Sandbox Demo.
_Avoid_: Static promo, template splash

**Liquid Chrome Hero**:
The kinetic entrance centerpiece rendering reflective metallic shaders on canvas with atmospheric glows, status badges, and direct navigation into the studio.
_Avoid_: Flat text logo, static SVG icon

**Kinetic Bento Showcase**:
Card-based architectural overview featuring an interactive live notebook canvas (5mm grid, margins, ink jitter), Gemini multimodal lecture distillation, and multi-page vector PDF compilation.
_Avoid_: Plain feature list, bullet points

**Scroll-Guided Handwriting Walkthrough**:
An animated step-by-step instructional journey demonstrating how to write Cyrillic letters and digits on a plain A4 paper and convert them into a digital font without printable templates.
_Avoid_: Buried documentation, static PDF manual

**Interactive Sandbox Demo**:
A lightweight live preview widget embedded directly in the landing bento grid allowing unauthenticated visitors to test paper grids, pen styles, and rendering before signing up.
_Avoid_: Fake mockup, static screenshot

**Auth Gateway (`/auth`)**:
Dedicated authentication view powered directly by Supabase Auth (Email + Password registration and login) with dark chrome glassmorphism card styling and error handling.
_Avoid_: Basic browser popup, third-party iframe

**Studio Workspace (`/app`)**:
The protected web workspace where authenticated users create conspectuses, configure paper styles and pen colors, calibrate custom A4 handwriting, view multi-page live previews, and download multi-page PDFs.
_Avoid_: Mini App iframe, Telegram webview

## Domain Language

**Handwriting Synthesis**:
Rendering digital text onto virtual notebook/ruled paper to visually resemble human handwriting, including natural variations, slant, and ink flow.
_Avoid_: Font printing, plain OCR

**Freeform A4 Calibration**:
Handwritten samples written on a standard blank A4 paper (1. Uppercase Cyrillic, 2. Lowercase Cyrillic, 3. Digits 0-9) without printed templates.
_Avoid_: Template blank, printable grid

**Glyph Extraction**:
Computer vision perspective warping and line segmentation to isolate and vectorize individual handwritten characters from the user's A4 sheet.
_Avoid_: Character recognition, OCR text dump

**Personal Font**:
A custom glyph library synthesized directly from the user's uploaded A4 photo and stored in Supabase under their user profile.
_Avoid_: User profile, clone font

**Synthesis Mode**:
The processing strategy chosen by the user: either *Smart Conspectus* (Gemini AI summarization, student abbreviations, structured definitions/formulas) or *Verbatim* (word-for-word reproduction).
_Avoid_: Prompt style, output flag

**Notebook Style**:
The visual background configuration for rendered pages: 5mm squared (клетка), ruled (линейка), or blank sheet with authentic red margins.
_Avoid_: Theme, template canvas

**Cloud Store**:
The managed Supabase project `conspect` housing database tables (`user_profiles`, `user_fonts`, `conspectuses`), authentication sessions, and storage buckets (`conspectus-assets`).
_Avoid_: Local dump, hard drive cache
