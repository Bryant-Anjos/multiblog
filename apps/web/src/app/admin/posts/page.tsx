"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin";
import { formatDate } from "@/lib/format";

type Site = { id: string; name: string; slug: string };
type Post = {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  published_at?: string;
};

export default function AdminPostsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [publish, setPublish] = useState(false);

  async function loadSites() {
    const res = await adminFetch("/api/admin/sites");
    if (res.ok) {
      const data = await res.json();
      setSites(data);
      if (data.length > 0 && !selectedSite) setSelectedSite(data[0].id);
    }
  }

  async function loadPosts() {
    if (!selectedSite) return;
    const res = await adminFetch(`/api/admin/sites/${selectedSite}/posts`);
    if (res.ok) setPosts(await res.json());
  }

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedSite]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const body: any = { title, slug, content, excerpt };
    if (publish) body.status = "PUBLISHED";
    const res = await adminFetch(`/api/admin/sites/${selectedSite}/posts`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setTitle("");
      setSlug("");
      setContent("");
      setExcerpt("");
      setPublish(false);
      setShowForm(false);
      loadPosts();
    }
  }

  return (
    <AdminShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h1>Posts</h1>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button className="btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New Post"}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={create} style={{ margin: "2rem 0" }}>
          <div className="form-field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-first-post"
              required
            />
          </div>
          <div className="form-field">
            <label>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              style={{ minHeight: "80px" }}
            />
          </div>
          <div className="form-field">
            <label>Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"## Heading\n\nParagraph with **bold**, _italic_, [links](url), lists and ```code``` blocks."}
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button className="btn" type="submit">
              Save {publish ? "& Publish" : "Draft"}
            </button>
            <label style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
                style={{ width: "auto", marginRight: "0.35rem" }}
              />
              Publish now
            </label>
          </div>
        </form>
      )}

      <div className="admin-list">
        {posts.map((post) => (
          <div key={post.id} className="admin-list-item">
            <div className="info">
              <h3>{post.title}</h3>
              <p>
                /{post.slug}
                {post.published_at ? ` · ${formatDate(post.published_at)}` : ""}
              </p>
            </div>
            <div className="actions">
              <span className={`status-pill ${post.status === "PUBLISHED" ? "published" : ""}`}>
                {post.status}
              </span>
              {selectedSite && (
                <Link href={`/admin/posts/${post.id}?site=${selectedSite}`} className="small-btn">
                  Edit
                </Link>
              )}
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="empty">No posts for this site.</p>}
      </div>
    </AdminShell>
  );
}
