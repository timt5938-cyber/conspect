/**
 * Shared domain types for the Conspectus worker.
 */

/** One line of a conspectus. `kind` drives how it is rendered in the notebook. */
export type LineKind =
  | "bullet"
  | "text"
  | "definition"
  | "formula"
  | "important"
  | "conclusion";

export interface ConspectLine {
  kind: LineKind;
  text: string;
}

export interface ConspectSection {
  heading: string;
  lines: ConspectLine[];
}

/** The structured conspectus — the single contract between Gemini and the UI. */
export interface Conspect {
  title: string;
  subject: string;
  summary: string;
  sections: ConspectSection[];
  key_terms: string[];
  questions: string[];
}

export interface SourceRef {
  url: string;
  title: string;
  /** How the source was obtained: Gemini's native url_context or our HTML fallback. */
  via: "url_context" | "html_fetch" | "none";
  status?: string;
}

export interface ConspectMeta {
  model: string;
  /** Every model that was tried, in order, with its outcome. */
  attempts: { model: string; ok: boolean; error?: string }[];
  mode: string;
  sources: SourceRef[];
  usage?: { prompt_tokens?: number; output_tokens?: number; total_tokens?: number };
  warnings: string[];
}

/** What we hand to the client so it can render locally. */
export interface ConspectResult {
  conspect: Conspect;
  html: string;
  meta: ConspectMeta;
}

/** Calibration grid: deterministic glyph <-> character mapping. */
export interface CalibrationCell {
  char: string;
  row: number;
  col: number;
}

export interface CalibrationGrid {
  version: number;
  cols: number;
  rows: number;
  cell_aspect: number;
  cells: CalibrationCell[];
}

export interface StoredGlyph {
  /** data:image/png;base64,... tightly cropped to the ink bounding box. */
  png: string;
  /** Strokes may not fill the cell: remember where the ink sat so the baseline stays level. */
  baseline: number;
  /** Height of the character's x-height relative to its own bbox, 0..1. */
  xheight?: number;
  aspect: number;
}

export interface UserFont {
  id: string;
  user_id: string;
  font_name: string;
  is_active: boolean;
  grid_version: number;
  glyphs: Record<string, StoredGlyph>;
  extracted_count: number;
  total_chars: number;
  created_at?: string;
}

export interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  GEMINI_MODEL_FALLBACKS: string;
  SUPABASE_URL: string;
  /** Service role key — server only, never sent to the browser. */
  SUPABASE_SERVICE_KEY?: string;
  /** Legacy publishable key, used as a fallback so the app works before RLS is tightened. */
  SUPABASE_ANON_KEY?: string;
  SUPABASE_JWT_SECRET?: string;
  SUPABASE_BUCKET: string;
  ALLOWED_ORIGINS: string;
  RATE_LIMIT?: KVNamespace;
}
