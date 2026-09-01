"use client";

import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Domain {
  id: string;
  hostname: string;
  is_primary: boolean;
}

export default function SiteSettingsPage() {
  const { site, siteId, loading } = useSite();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [domains, setDomains] = useState<Domain[]>([]);
  const [hostname, setHostname] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [toDelete, setToDelete] = useState<Domain | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchDomains = () => {
    if (!siteId) return;
    adminFetch(`/api/admin/sites/${siteId}/domains`)
      .then((r) => r.json())
      .then((data) => setDomains(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    if (site) {
      setName(site.name || "");
      setSlug(site.slug || "");
      setLanguage(site.language || "en");
    }
  }, [site]);

  useEffect(() => { fetchDomains(); }, [siteId]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}`, {
        method: "PUT",
        body: JSON.stringify({ name, slug, language }),
      });
      if (res.ok) setMessage("Saved.");
      else setMessage("Error saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostname) return;
    setAddingDomain(true);
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/domains`, {
        method: "POST",
        body: JSON.stringify({ hostname, is_primary: domains.length === 0 }),
      });
      if (res.ok) {
        setHostname("");
        fetchDomains();
      }
    } finally {
      setAddingDomain(false);
    }
  };

  const confirmDeleteDomain = async () => {
    if (!toDelete) return;
    setBusy(true);
    const res = await adminFetch(`/api/admin/sites/${siteId}/domains/${toDelete.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (res.ok) {
      setToDelete(null);
      fetchDomains();
    }
  };

  const setPrimary = async (d: Domain) => {
    setBusy(true);
    const res = await adminFetch(`/api/admin/sites/${siteId}/domains/${d.id}`, {
      method: "PUT",
    });
    setBusy(false);
    if (res.ok) fetchDomains();
  };

  if (loading) return <p style={{ color: "#999" }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", marginBottom: "1.5rem" }}>
        Settings
      </h1>

      {message && (
        <p style={{ padding: "0.5rem 0.75rem", background: message === "Saved." ? "#e8f5e9" : "#ffebee", borderRadius: "4px", fontSize: "0.85rem", marginBottom: "1rem" }}>
          {message}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "480px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Site name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem", fontFamily: "monospace" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem" }}>
            <option value="en">English</option>
            <option value="pt-BR">Portuguese (Brazil)</option>
          </select>
        </div>
        <div>
          <button onClick={handleSave} disabled={saving} style={{ padding: "0.5rem 1rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem" }}>
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e8e4df", margin: "2rem 0" }} />

      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", marginBottom: "1rem" }}>
        Domains
      </h2>

      <form onSubmit={handleAddDomain} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", maxWidth: "480px" }}>
        <input
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
          placeholder="e.g. myblog.example.com"
          required
          style={{ flex: 1, padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }}
        />
        <button type="submit" disabled={addingDomain} style={{ padding: "0.4rem 0.8rem", background: "#fff", color: "#37352f", border: "1px solid #d9d5ce", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
          Add domain
        </button>
      </form>

      {domains.length === 0 ? (
        <p style={{ color: "#999", fontSize: "0.9rem" }}>No domains configured.</p>
      ) : (
        <table style={{ width: "100%", maxWidth: "480px", borderCollapse: "collapse" }}>
          <tbody>
            {domains.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid #f0ece6" }}>
                <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {d.hostname}
                  {d.is_primary && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#7c6f64" }}>(primary)</span>}
                </td>
                <td style={{ padding: "0.5rem", textAlign: "right", whiteSpace: "nowrap" }}>
                  <a href={`http://${d.hostname}`} target="_blank" rel="noopener noreferrer" style={{ color: "#d4a373", fontSize: "0.85rem", marginRight: "0.75rem" }}>
                    View
                  </a>
                  {!d.is_primary && (
                    <button onClick={() => setPrimary(d)} disabled={busy} style={{ background: "none", border: "none", color: "#2e7d32", cursor: "pointer", fontSize: "0.85rem", padding: 0, marginRight: "0.75rem" }}>
                      Set primary
                    </button>
                  )}
                  <button onClick={() => setToDelete(d)} disabled={busy} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.hostname}"?`}
        body="Traffic sent to this hostname will no longer resolve to this site."
        busy={busy}
        onConfirm={confirmDeleteDomain}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
