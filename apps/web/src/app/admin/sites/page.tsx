"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin";
import { LANGUAGES } from "@/lib/i18n";

type Site = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  language?: string;
};

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [domains, setDomains] = useState("");

  async function load() {
    const res = await adminFetch("/api/admin/sites");
    if (res.ok) setSites(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await adminFetch("/api/admin/sites", {
      method: "POST",
      body: JSON.stringify({
        name,
        slug,
        description,
        language,
        domains: domains.split(",").map((d) => d.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      setName("");
      setSlug("");
      setDescription("");
      setLanguage("en");
      setDomains("");
      setShowForm(false);
      load();
    }
  }

  return (
    <AdminShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Sites</h1>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New Site"}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={create} style={{ marginBottom: "2rem" }}>
          <div className="form-field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: "80px" }}
            />
          </div>
          <div className="form-field">
            <label>Default language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Domains (comma-separated)</label>
            <input
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              placeholder="localhost, diario.localhost"
            />
          </div>
          <button className="btn" type="submit">
            Create Site
          </button>
        </form>
      )}

      <div className="admin-list">
        {sites.map((site) => (
          <div key={site.id} className="admin-list-item">
            <div className="info">
              <h3>{site.name}</h3>
              <p>
                /{site.slug} · {site.description || "No description"} ·{" "}
                {site.language || "en"}
              </p>
            </div>
            <div className="actions">
              <Link href={`/admin/sites/${site.id}`} className="small-btn">
                Manage
              </Link>
            </div>
          </div>
        ))}
        {sites.length === 0 && (
          <p className="empty">No sites yet. Create your first site.</p>
        )}
      </div>
    </AdminShell>
  );
}
