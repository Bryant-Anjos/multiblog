"use client";

import { RefObject } from "react";

type InsertDef = {
  label: string;
  title: string;
  before: string;
  after: string;
  placeholder?: string;
};

const items: InsertDef[] = [
  { label: "B", title: "Bold", before: "**", after: "**", placeholder: "bold text" },
  { label: "I", title: "Italic", before: "_", after: "_", placeholder: "italic text" },
  { label: "H2", title: "Heading", before: "## ", after: "", placeholder: "Heading" },
  { label: "•", title: "List", before: "- ", after: "", placeholder: "item" },
  { label: "🔗", title: "Link", before: "[", after: "](https://)", placeholder: "link text" },
  { label: "`", title: "Code", before: "`", after: "`", placeholder: "code" },
];

function insert(
  ref: RefObject<HTMLTextAreaElement | null>,
  getContent: () => string,
  setContent: (v: string) => void,
  def: InsertDef
) {
  const el = ref.current;
  if (!el) return;

  const start = el.selectionStart ?? getContent().length;
  const end = el.selectionEnd ?? start;
  const selected = getContent().slice(start, end);

  if (selected) {
    setContent(
      getContent().slice(0, start) + def.before + selected + def.after + getContent().slice(end)
    );
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + def.before.length, start + def.before.length + selected.length);
    });
  } else {
    const ph = def.placeholder || "";
    setContent(
      getContent().slice(0, start) + def.before + ph + def.after + getContent().slice(end)
    );
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + def.before.length, start + def.before.length + ph.length);
    });
  }
}

export function MarkdownToolbar({
  textareaRef,
  onInsert,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onInsert: (def: InsertDef) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.25rem",
        padding: "0.35rem 0.5rem",
        background: "#fff",
        border: "1px solid #d9d5ce",
        borderBottom: "none",
        borderRadius: "6px 6px 0 0",
        marginBottom: "-1px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {items.map((it) => (
        <button
          key={it.label + it.title}
          type="button"
          title={it.title}
          onClick={() => onInsert(it)}
          style={{
            minWidth: "26px",
            padding: "0.2rem 0.45rem",
            background: "#faf7f2",
            border: "1px solid #e0dbd4",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: it.title === "Bold" ? 700 : it.title === "Italic" ? "italic" : 400,
            color: "#37352f",
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export { insert as applyMarkdownInsert };
export type { InsertDef };
