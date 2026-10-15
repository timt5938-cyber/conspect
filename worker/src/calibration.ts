/**
 * Deterministic calibration grid.
 *
 * The previous implementation told the user "write the whole alphabet on a plain
 * A4 sheet" and then guessed which glyph was which using a 45%/85% line split and
 * a blind index->character mapping. With 76 characters wrapping unpredictably
 * across 6-8 lines, that mapping was essentially random.
 *
 * Instead we publish a fixed grid with the target character printed in every cell.
 * The mapping is then positional and exact: cell (row, col) *is* character X.
 * Clients crop the cell rectangles from the perspective-corrected photo and send
 * the glyphs back; no fragile line segmentation is involved.
 */

import type { CalibrationGrid } from "./types";

export const GRID_COLS = 10;
export const GRID_ROWS = 8;
export const GRID_VERSION = 2;

/** Uppercase, then lowercase, then digits, then punctuation — reading order. */
export const CHAR_SEQUENCE: string[] = [
  ..."АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
  ..."абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
  ..."0123456789",
  ".", ",", "?", "!",
];

export function buildGrid(): CalibrationGrid {
  const cells = CHAR_SEQUENCE.map((char, i) => ({
    char,
    row: Math.floor(i / GRID_COLS),
    col: i % GRID_COLS,
  }));
  return {
    version: GRID_VERSION,
    cols: GRID_COLS,
    rows: GRID_ROWS,
    // Reference page is A4 at 1240x1754 px; a cell is 1/10 wide and 1/8 tall.
    cell_aspect: 0.8,
    cells,
  };
}

/** Cells that carry a descender below the baseline, in Russian lowercase. */
export const DESCENDER_CHARS = new Set(["р", "у", "ф", "д", "ц", "щ", "ў"]);

export function isDescender(ch: string): boolean {
  return DESCENDER_CHARS.has(ch.toLowerCase());
}

/** Characters that occupy only the x-height, used to anchor the baseline. */
export function isXHeightOnly(ch: string): boolean {
  return "аеоисэъь".includes(ch.toLowerCase()) || "0123456789".includes(ch);
}
