"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin";
import { LANGUAGES } from "@/lib/i18n";

type Domain = { id: string; hostname: string; is_primary: boolean };
type NavItem = {
  id: string;
  label: string;
  type: string;
  destination: string;
  position: number;
  is_visible: boolean;
};

export default function SiteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [site, setSite] = useState<any>(null);
  const [language, setLanguage] = useState("en");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [navLabel, setNavLabel] = useState("");
  const [navType, setNavType] = useState("page");
  const [navDest, setNavDest] = useState("/");

  async function load() {
    const siteRes = await adminFetch(`/api/admin/sites/${id}`);
    if (siteRes.ok) {
      const s = await siteRes.json();
      setSite(s);
      setLanguage(s.language || "en");
    }
    const domRes = await adminFetch(`/api/admin/sites/${id}/domains`);
    if (domRes.ok) setDomains(await domRes.json());
    const navRes = await adminFetch(`/api/admin/sites/${id}/navigation`);
    if (navRes.ok) setNavItems(await navRes.json());
  }

  useEffect(() => {
    load();
  }, [id]);

  async function saveLanguage(e: React.FormEvent) {
    e.preventDefault();
    const res = await adminFetch(`/api/admin/sites/${id}`, {
      method: "PUT",
      body: JSON.stringify({ language }),
    });
    if (res.ok) {
      const s = await res.json();
      setSite(s);
    }
  }

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    const res = await adminFetch(`/api/admin/sites/${id}/domains`, {
      method: "POST",
      body: JSON.stringify({ hostname: newDomain }),
    });
    if (res.ok) {
      setNewDomain("");
      load();
    }
  }

  async function addNavItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await adminFetch(`/api/admin/sites/${id}/navigation`, {
      method: "POST",
      body: JSON.stringify({
        label: navLabel,
        type: navType,
        destination: navDest,
        position: navItems.length + 1,
        is_visible: true,
      }),
    });
    if (res.ok) {
      setNavLabel("");
      setNavDest("/");
      load();
    }
  }

  if (!site) return <AdminShell><p className="empty">Loading...</p></AdminShell>;

  return (
    <AdminShell>
      <h1>{site.name}</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        /{site.slug} · {site.description || "No description"}
      </p>

      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Language</h2>
      <form
        onSubmit={saveLanguage}
        style={{ display: "flex", gap: "0.5rem", maxWidth: "420px", marginBottom: "1.5rem" }}
      >
        <select
          style={{ flex: 1 }}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <button className="btn" type="submit">
          Save language
        </button>
      </form>

      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Domains</h2>
      <div className="admin-list" style={{ marginBottom: "1.5rem" }}>
        {domains.map((d) => (
          <div key={d.id} className="admin-list-item">
            <div className="info">
              <h3>{d.hostname}</h3>
              <p>{d.is_primary ? "Primary" : "Alias"}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={addDomain} style={{ display: "flex", gap: "0.5rem", maxWidth: "420px" }}>
        <input
          style={{ flex: 1 }}
          placeholder="new-domain.com"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
        />
        <button className="btn" type="submit">
          Add Domain
        </button>
      </form>

      <h2 style={{ fontSize: "1.1rem", margin: "2rem 0 0.75rem" }}>Navigation</h2>
      <div className="admin-list" style={{ marginBottom: "1.5rem" }}>
        {navItems.map((n) => (
          <div key={n.id} className="admin-list-item">
            <div className="info">
              <h3>{n.label}</h3>
              <p>
                {n.type} → {n.destination || "/"}
              </p>
            </div>
          </div>
        ))}
        {navItems.length === 0 && <p className="empty">No navigation items.</p>}
      </div>

      <form onSubmit={addNavItem} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", maxWidth: "560px" }}>
        <input
          style={{ flex: 1, minWidth: "120px" }}
          placeholder="Label"
          value={navLabel}
          onChange={(e) => setNavLabel(e.target.value)}
        />
        <select value={navType} onChange={(e) => setNavType(e.target.value)}>
          <option value="home">Home</option>
          <option value="posts">Posts</option>
          <option value="stories">Stories</option>
          <option value="page">Page</option>
        </select>
        <input
          style={{ flex: 1, minWidth: "140px" }}
          placeholder="/destination"
          value={navDest}
          onChange={(e) => setNavDest(e.target.value)}
        />
        <button className="btn" type="submit">
          Add Item
        </button>
      </form>
    </AdminShell>
  );
}
