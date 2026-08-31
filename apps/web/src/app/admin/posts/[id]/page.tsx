"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin";

export default function EditPostPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const siteId = search.get("site") as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState("DRAFT");

  useEffect(() => {
    adminFetch(`/api/admin/sites/${siteId}/posts/${id}`).then(async (res) => {
      if (!res.ok) return;
      const p = await res.json();
      setTitle(p.title);
      setSlug(p.slug);
      setContent(p.content);
      setExcerpt(p.excerpt || "");
      setStatus(p.status);
    });
  }, [id, siteId]);

  async function save(publish: boolean) {
    const body = { title, slug, content, excerpt, status: publish ? "PUBLISHED" : "DRAFT" };
    await adminFetch(`/api/admin/sites/${siteId}/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    router.push("/admin/posts");
  }

  return (
    <AdminShell>
      <h1>Edit Post</h1>
      <div className="admin-form">
        <div className="form-field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} style={{ minHeight: "80px" }} />
        </div>
        <div className="form-field">
          <label>Content (Markdown)</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn" onClick={() => save(false)}>
            Save Draft
          </button>
          {status !== "PUBLISHED" && (
            <button className="btn" onClick={() => save(true)}>
              Publish
            </button>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
