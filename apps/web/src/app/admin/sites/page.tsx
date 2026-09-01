"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin";
import { LANGUAGES } from "@/lib/i18n";

const LANG_LABELS: Record<string, string> = {
  en: "Inglês",
  "pt-BR": "Português (Brasil)",
};

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
  const [language, setLanguage] = useState("pt-BR");
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
      setLanguage("pt-BR");
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
          {showForm ? "Cancelar" : "+ Novo site"}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={create} style={{ marginBottom: "2rem" }}>
          <p style={{ color: "#7c6f64", fontSize: "0.9rem", marginTop: 0 }}>
            Um site é um blog independente, com seus próprios textos, páginas e endereço. Você pode criar quantos quiser.
          </p>
          <div className="form-field">
            <label>Nome do site</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
            <small style={{ color: "#7c6f64" }}>Ex.: &quot;Diário do João&quot;</small>
          </div>
          <div className="form-field">
            <label>Endereço (URL)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} required />
            <small style={{ color: "#7c6f64" }}>
              Parte do endereço usada pelo sistema, em minúsculas e sem espaços. Ex.: <code style={{ background: "#f0ece6", padding: "0 0.25rem", borderRadius: "3px" }}>meu-blog</code>
            </small>
          </div>
          <div className="form-field">
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: "80px" }}
            />
            <small style={{ color: "#7c6f64" }}>Opcional. Uma frase curta que aparece no seu site.</small>
          </div>
          <div className="form-field">
            <label>Idioma padrão</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {LANG_LABELS[l.code] || l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Domínios (separados por vírgula)</label>
            <input
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              placeholder="exemplo.com, blog.exemplo.com"
            />
            <small style={{ color: "#7c6f64" }}>
              Opcional. Os endereços pelos quais o site ficará acessível.
            </small>
          </div>
          <button className="btn" type="submit">
            Criar site
          </button>
        </form>
      )}

      <div className="admin-list">
        {sites.map((site) => (
          <div key={site.id} className="admin-list-item">
            <div className="info">
              <h3>{site.name}</h3>
              <p>
                /{site.slug} · {site.description || "Sem descrição"} ·{" "}
                {site.language === "pt-BR" ? "Português (Brasil)" : site.language === "en" ? "Inglês" : site.language}
              </p>
            </div>
            <div className="actions">
              <Link href={`/admin/sites/${site.id}`} className="small-btn">
                Gerenciar
              </Link>
            </div>
          </div>
        ))}
        {sites.length === 0 && (
          <p className="empty">Nenhum site ainda. Crie o seu primeiro site.</p>
        )}
      </div>
    </AdminShell>
  );
}