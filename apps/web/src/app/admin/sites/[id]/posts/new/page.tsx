"use client";

import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPostPage() {
  const { siteId } = useSite();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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
      const res = await adminFetch(`/api/admin/sites/${siteId}/posts`, {
        method: "POST",
        body: JSON.stringify({ title, slug, content, status: "DRAFT" }),
      });
      if (res.ok) {
        const post = await res.json();
        router.push(`/admin/sites/${siteId}/posts/${post.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", marginBottom: "1.5rem" }}>
        New post
      </h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "640px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Title *</label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Slug *</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem", fontFamily: "monospace" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem", fontFamily: "monospace", resize: "vertical" }}
          />
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
            {saving ? "Saving..." : "Create post"}
          </button>
        </div>
      </form>
    </div>
  );
}
