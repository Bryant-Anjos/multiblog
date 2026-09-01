"use client";

import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { MarkdownToolbar, applyMarkdownInsert } from "@/components/admin/MarkdownToolbar";

export default function EditPagePage() {
  const { siteId } = useSite();
  const router = useRouter();
  const params = useParams();
  const pageId = params?.pageId as string;
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!siteId || !pageId) return;
    adminFetch(`/api/admin/sites/${siteId}/pages/${pageId}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setContent(data.content || "");
        setStatus(data.status || "DRAFT");
      })
      .finally(() => setLoading(false));
  }, [siteId, pageId]);

  const handleSave = async (publishFlag = false) => {
    setSaving(true);
    setMessage("");
    const targetStatus = publishFlag ? "PUBLISHED" : status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/pages/${pageId}`, {
        method: "PUT",
        body: JSON.stringify({ title, slug, content, status: targetStatus }),
      });
      if (res.ok) {
        setStatus(targetStatus);
        setMessage(publishFlag ? "Página publicada." : "Alterações salvas.");
      } else setMessage("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Excluir esta página?")) return;
    const res = await adminFetch(`/api/admin/sites/${siteId}/pages/${pageId}`, {
      method: "DELETE",
    });
    if (res.ok) router.push(`/admin/sites/${siteId}/pages`);
  };

  const isPublished = status === "PUBLISHED";

  if (loading) return <p style={{ color: "#999" }}>Carregando...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: 0 }}>
          Editar página
        </h1>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {status !== "PUBLISHED" && (
            <button onClick={() => handleSave(true)} disabled={saving} style={{ padding: "0.4rem 0.8rem", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
              Publicar
            </button>
          )}
          <button onClick={() => handleSave(false)} disabled={saving} style={{ padding: "0.4rem 0.8rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button onClick={handleDelete} style={{ padding: "0.4rem 0.8rem", background: "#fff", color: "#c0392b", border: "1px solid #e8e4df", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
            Excluir
          </button>
        </div>
      </div>

      <p style={{ color: "#7c6f64", fontSize: "0.85rem", marginTop: "-1rem", marginBottom: "1.25rem" }}>
        Situação: {isPublished ? <strong style={{ color: "#2e7d32" }}>Publicado</strong> : <strong style={{ color: "#e65100" }}>Rascunho</strong>}
      </p>

      {message && (
        <p style={{ padding: "0.5rem 0.75rem", background: message === "Página publicada." || message === "Alterações salvas." ? "#e8f5e9" : "#ffebee", borderRadius: "4px", fontSize: "0.85rem", marginBottom: "1rem", color: message === "Erro ao salvar. Tente novamente." ? "#c0392b" : "#2e7d32" }}>
          {message}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "640px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Endereço</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem", fontFamily: "monospace" }}
          />
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#7c6f64" }}>
            Parte do link da página, em minúsculas e sem espaços. Alterar pode quebrar links já publicados.
          </p>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#7c6f64" }}>Conteúdo</label>
            <button
              onClick={() => setPreview((p) => !p)}
              style={{ background: "none", border: "none", color: "#d4a373", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
            >
              {preview ? "Editar" : "Pré-visualizar"}
            </button>
          </div>
          <p style={{ margin: "0 0 0.25rem", fontSize: "0.78rem", color: "#7c6f64" }}>
            Escreva em Markdown: use os botões para formatar ou escreva a sintaxe diretamente.
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
                rows={16}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "0 0 4px 4px", fontSize: "0.9rem", fontFamily: "monospace", resize: "vertical" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
