"use client";

import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { MarkdownToolbar, applyMarkdownInsert } from "@/components/admin/MarkdownToolbar";

export default function NewPagePage() {
  const { siteId } = useSite();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/pages`, {
        method: "POST",
        body: JSON.stringify({ title, slug, content, status: "DRAFT" }),
      });
      if (res.ok) {
        const page = await res.json();
        router.push(`/admin/sites/${siteId}/pages/${page.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", marginBottom: "1.5rem" }}>
        Nova página
      </h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "640px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Título *</label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Endereço *</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem", fontFamily: "monospace" }}
          />
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#7c6f64" }}>
            Parte do link da página, em minúsculas e sem espaços. É preenchido automaticamente a partir do título (ex.: <code style={{ background: "#f0ece6", padding: "0 0.25rem", borderRadius: "3px" }}>sobre</code>).
          </p>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#7c6f64" }}>Conteúdo *</label>
            <button type="button" onClick={() => setPreview((p) => !p)} style={{ background: "none", border: "none", color: "#d4a373", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}>
              {preview ? "Editar" : "Pré-visualizar"}
            </button>
          </div>
          <p style={{ margin: "0 0 0.25rem", fontSize: "0.78rem", color: "#7c6f64" }}>
            Escreva em Markdown: use os botões para formatar ou escreva a sintaxe diretamente (ex.: **negrito**, ## Título, *[link](https://)*).
          </p>
          {preview ? (
            <MarkdownPreview content={content} />
          ) : (
            <div>
              <MarkdownToolbar
                textareaRef={contentRef}
                onInsert={(def) => applyMarkdownInsert(contentRef, () => content, setContent, def)}
              />
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={12}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "0 0 4px 4px", fontSize: "0.9rem", fontFamily: "monospace", resize: "vertical" }}
              />
            </div>
          )}
        </div>
        <div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.5rem 1rem",
              background: "#37352f",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: saving ? "wait" : "pointer",
              fontSize: "0.9rem",
            }}
          >
            {saving ? "Salvando..." : "Criar página"}
          </button>
        </div>
      </form>
    </div>
  );
}
