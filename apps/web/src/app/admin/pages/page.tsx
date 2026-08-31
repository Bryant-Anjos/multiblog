"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin";

type Site = { id: string; name: string; slug: string };
type Page = { id: string; title: string; slug: string; status: string };

export default function AdminPagesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [pages, setPages] = useState<Page[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [publish, setPublish] = useState(false);

  async function loadSites() {
    const res = await adminFetch("/api/admin/sites");
    if (res.ok) {
      const data = await res.json();
      setSites(data);
      if (data.length > 0 && !selectedSite) setSelectedSite(data[0].id);
    }
  }

  async function loadPages() {
    if (!selectedSite) return;
    const res = await adminFetch(`/api/admin/sites/${selectedSite}/pages`);
    if (res.ok) setPages(await res.json());
  }

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    loadPages();
  }, [selectedSite]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const body: any = { title, slug, content };
    if (publish) body.status = "PUBLISHED";
    const res = await adminFetch(`/api/admin/sites/${selectedSite}/pages`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setTitle("");
      setSlug("");
      setContent("");
      setPublish(false);
      setShowForm(false);
      loadPages();
    }
  }

  return (
    <AdminShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h1>Pages</h1>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button className="btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New Page"}
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
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="about" required />
          </div>
          <div className="form-field">
            <label>Content (Markdown)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} />
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
        {pages.map((page) => (
          <div key={page.id} className="admin-list-item">
            <div className="info">
              <h3>{page.title}</h3>
              <p>/{page.slug}</p>
            </div>
            <div className="actions">
              <span className={`status-pill ${page.status === "PUBLISHED" ? "published" : ""}`}>
                {page.status}
              </span>
            </div>
          </div>
        ))}
        {pages.length === 0 && <p className="empty">No pages for this site.</p>}
      </div>
    </AdminShell>
  );
}
