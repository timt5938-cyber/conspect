/**
 * Gemini structured-output schema for a conspectus.
 *
 * Kept as a plain JSON Schema literal (OpenAPI-subset) so the REST API can use it
 * directly as `generationConfig.responseSchema`.
 */

export const LINE_KINDS = [
  "bullet",
  "text",
  "definition",
  "formula",
  "important",
  "conclusion",
] as const;

export const CONSPECT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Короткое название темы без слова 'Тема:'",
    },
    subject: {
      type: "string",
      description: "Учебная дисциплина или пустая строка",
    },
    summary: {
      type: "string",
      description: "1-2 предложения о содержании конспекта",
    },
    sections: {
      type: "array",
      description: "Смысловые блоки конспекта",
      items: {
        type: "object",
        properties: {
          heading: {
            type: "string",
            description: "Короткий заголовок блока без нумерации",
          },
          lines: {
            type: "array",
            items: {
              type: "object",
              properties: {
                kind: {
                  type: "string",
                  enum: [...LINE_KINDS],
                  description: "Тип строки, определяет оформление в тетради",
                },
                text: { type: "string", description: "Текст строки" },
              },
              required: ["kind", "text"],
              propertyOrdering: ["kind", "text"],
            },
          },
        },
        required: ["heading", "lines"],
        propertyOrdering: ["heading", "lines"],
      },
    },
    key_terms: {
      type: "array",
      description: "3-8 ключевых терминов темы",
      items: { type: "string" },
    },
    questions: {
      type: "array",
      description: "2-5 вопросов для самопроверки",
      items: { type: "string" },
    },
  },
  required: ["title", "subject", "summary", "sections", "key_terms", "questions"],
  propertyOrdering: [
    "title",
    "subject",
    "summary",
    "sections",
    "key_terms",
    "questions",
  ],
} as const;

/** Normalises whatever Gemini returned into a trusted `Conspect`. */
export function coerceConspect(raw: unknown): import("./types").Conspect {
  const o = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

  const sections = arr(o.sections)
    .map((s) => {
      const so = (s ?? {}) as Record<string, unknown>;
      const lines = arr(so.lines)
        .map((l) => {
          const lo = (l ?? {}) as Record<string, unknown>;
          const kind = str(lo.kind);
          const text = str(lo.text);
          return {
            kind: (LINE_KINDS as readonly string[]).includes(kind)
              ? (kind as import("./types").LineKind)
              : "bullet",
            text,
          };
        })
        .filter((l) => l.text.length > 0);
      return { heading: str(so.heading), lines };
    })
    .filter((s) => s.lines.length > 0);

  return {
    title: str(o.title) || "Конспект",
    subject: str(o.subject),
    summary: str(o.summary),
    sections:
      sections.length > 0
        ? sections
        : [{ heading: "Конспект", lines: [{ kind: "text", text: str(o.summary) }] }],
    key_terms: arr(o.key_terms).map(str).filter(Boolean),
    questions: arr(o.questions).map(str).filter(Boolean),
  };
}

/**
 * Flattens a conspectus into plain text. Useful for plain-text export and for
 * feeding a conspectus back into another model call.
 */
export function conspectToPlainText(c: import("./types").Conspect): string {
  const out: string[] = [c.title, ""];
  if (c.subject) out.push(`Дисциплина: ${c.subject}`, "");
  if (c.summary) out.push(c.summary, "");
  c.sections.forEach((s, i) => {
    out.push(`${i + 1}. ${s.heading}`);
    for (const l of s.lines) {
      switch (l.kind) {
        case "definition":
          out.push(`[ОПР] ${l.text}`);
          break;
        case "formula":
          out.push(`[ФОРМУЛА] ${l.text}`);
          break;
        case "important":
          out.push(`[ВАЖНО] ${l.text}`);
          break;
        case "conclusion":
          out.push(`[ВЫВОД] ${l.text}`);
          break;
        case "bullet":
          out.push(`- ${l.text}`);
          break;
        default:
          out.push(l.text);
      }
    }
    out.push("");
  });
  if (c.key_terms.length) out.push(`Ключевые термины: ${c.key_terms.join(", ")}`, "");
  if (c.questions.length) {
    out.push("Вопросы для самопроверки:");
    c.questions.forEach((q, i) => out.push(`${i + 1}. ${q}`));
  }
  return out.join("\n");
}
