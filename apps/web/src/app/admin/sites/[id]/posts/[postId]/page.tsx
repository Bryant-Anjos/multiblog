"use client";

import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { MarkdownToolbar, applyMarkdownInsert } from "@/components/admin/MarkdownToolbar";

export default function EditPostPage() {
  const { siteId } = useSite();
  const router = useRouter();
  const params = useParams();
  const postId = params?.postId as string;
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
    if (!siteId || !postId) return;
    adminFetch(`/api/admin/sites/${siteId}/posts/${postId}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setContent(data.content || "");
        setStatus(data.status || "DRAFT");
      })
      .finally(() => setLoading(false));
  }, [siteId, postId]);

  const handleSave = async (publishFlag = false) => {
    setSaving(true);
    setMessage("");
    const targetStatus = publishFlag ? "PUBLISHED" : status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ title, slug, content, status: targetStatus }),
      });
      if (res.ok) {
        setStatus(targetStatus);
        setMessage(publishFlag ? "Published." : "Saved.");
      } else setMessage("Error saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    const res = await adminFetch(`/api/admin/sites/${siteId}/posts/${postId}`, {
      method: "DELETE",
    });
    if (res.ok) router.push(`/admin/sites/${siteId}/posts`);
  };

  if (loading) return <p style={{ color: "#999" }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: 0 }}>
          Edit post
        </h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {status !== "PUBLISHED" && (
            <button onClick={() => handleSave(true)} disabled={saving} style={{ padding: "0.4rem 0.8rem", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
              Publish
            </button>
          )}
          <button onClick={() => handleSave(false)} disabled={saving} style={{ padding: "0.4rem 0.8rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={handleDelete} style={{ padding: "0.4rem 0.8rem", background: "#fff", color: "#c0392b", border: "1px solid #e8e4df", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
            Delete
          </button>
        </div>
      </div>

      {message && (
        <p style={{ padding: "0.5rem 0.75rem", background: message === "Saved." || message === "Published." ? "#e8f5e9" : "#ffebee", borderRadius: "4px", fontSize: "0.85rem", marginBottom: "1rem" }}>
          {message}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "640px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem", fontFamily: "monospace" }}
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#7c6f64" }}>Content</label>
            <button
              onClick={() => setPreview((p) => !p)}
              style={{ background: "none", border: "none", color: "#d4a373", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
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
