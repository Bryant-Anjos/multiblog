"use client";

import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Domain {
  id: string;
  hostname: string;
  is_primary: boolean;
  verified: boolean;
}

export default function SiteSettingsPage() {
  const { site, siteId, loading } = useSite();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [toDelete, setToDelete] = useState<Domain | null>(null);
  const [busy, setBusy] = useState(false);
  const [showDnsHelp, setShowDnsHelp] = useState(false);

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
    setNotice(null);
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}`, {
        method: "PUT",
        body: JSON.stringify({ name, slug, language }),
      });
      if (res.ok) setNotice({ ok: true, text: "Configurações salvas." });
      else setNotice({ ok: false, text: "Erro ao salvar. Tente novamente." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput) return;
    setAddingDomain(true);
    setNotice(null);
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/domains`, {
        method: "POST",
        body: JSON.stringify({ hostname: domainInput, is_primary: domains.length === 0 }),
      });
      if (res.ok) {
        setDomainInput("");
        setNotice({ ok: true, text: "Domínio adicionado." });
        fetchDomains();
      } else {
        setNotice({ ok: false, text: "Não foi possível adicionar o domínio." });
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
      setNotice({ ok: true, text: "Domínio removido." });
      fetchDomains();
    }
  };

  const setPrimary = async (d: Domain) => {
    setBusy(true);
    setNotice(null);
    const res = await adminFetch(`/api/admin/sites/${siteId}/domains/${d.id}`, {
      method: "PUT",
    });
    setBusy(false);
    if (res.ok) {
      setNotice({ ok: true, text: "Domínio principal atualizado." });
      fetchDomains();
    }
  };

  const verifyDomain = async (d: Domain) => {
    setBusy(true);
    setNotice(null);
    const res = await adminFetch(`/api/admin/sites/${siteId}/domains/${d.id}/verify`, {
      method: "PUT",
    });
    setBusy(false);
    if (res.ok) {
      setNotice({ ok: true, text: "Verificação concluída." });
      fetchDomains();
    } else {
      setNotice({ ok: false, text: "Não foi possível verificar o domínio." });
    }
  };

  if (loading) return <p style={{ color: "#999" }}>Carregando...</p>;

  return (
    <div>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", marginBottom: "0.5rem" }}>
        Configurações
      </h1>
      <p style={{ color: "#7c6f64", fontSize: "0.9rem", margin: "0 0 1.5rem", maxWidth: "560px" }}>
        Ajuste as informações gerais do site e os endereços (domínios) pelos quais ele será acessado.
      </p>

      {notice && (
        <p style={{ padding: "0.5rem 0.75rem", background: notice.ok ? "#e8f5e9" : "#ffebee", borderRadius: "4px", fontSize: "0.85rem", color: notice.ok ? "#2e7d32" : "#c0392b", marginBottom: "1rem" }}>
          {notice.text}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "480px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Nome do site</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem" }} />
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#7c6f64" }}>Aparece no cabeçalho do site, por exemplo: &quot;Diário do João&quot;.</p>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Endereço (URL)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem", fontFamily: "monospace" }} />
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#7c6f64" }}>
            Parte do endereço usada pelo sistema, em letras minúsculas e sem espaços (ex.: <code style={{ background: "#f0ece6", padding: "0 0.25rem", borderRadius: "3px" }}>meu-blog</code>). Evite alterar depois da publicação.
          </p>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Idioma do site</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem" }}>
            <option value="en">Inglês</option>
            <option value="pt-BR">Português (Brasil)</option>
          </select>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#7c6f64" }}>Define o idioma padrão dos textos do próprio site (não as suas publicações).</p>
        </div>
        <div>
          <button onClick={handleSave} disabled={saving} style={{ padding: "0.5rem 1rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem" }}>
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e8e4df", margin: "2rem 0" }} />

      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", marginBottom: "0.25rem" }}>
        Endereços (domínios)
      </h2>
      <p style={{ color: "#7c6f64", fontSize: "0.85rem", margin: "0 0 1rem", maxWidth: "480px" }}>
        Os endereços pelos quais o seu site é acessado. Um deles é o <strong>principal</strong>; você pode ter vários apontando para o mesmo conteúdo.
      </p>

      <form onSubmit={handleAddDomain} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", maxWidth: "480px" }}>
        <input
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          placeholder="exemplo.meublog.com"
          required
          style={{ flex: 1, padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }}
        />
        <button type="submit" disabled={addingDomain} style={{ padding: "0.4rem 0.8rem", background: "#fff", color: "#37352f", border: "1px solid #d9d5ce", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
          Adicionar domínio
        </button>
      </form>
      <button
        type="button"
        onClick={() => setShowDnsHelp((v) => !v)}
        style={{ background: "none", border: "none", color: "#d4a373", cursor: "pointer", fontSize: "0.8rem", padding: 0, marginBottom: "1rem" }}
      >
        {showDnsHelp ? "Ocultar como configurar o domínio" : "Como configurar / verificar um domínio?"}
      </button>

      {showDnsHelp && (
        <div style={{ maxWidth: "480px", background: "#faf7f2", border: "1px solid #e8e4df", borderRadius: "8px", padding: "1rem", marginBottom: "1.25rem", fontSize: "0.85rem", color: "#37352f", lineHeight: 1.5 }}>
          <ol style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>
              <strong>Apontar o domínio:</strong> no seu provedor de hospedagem/DNS, aponte o domínio (ou um subdomínio, ex.: <code style={{ background: "#f0ece6", padding: "0 0.25rem", borderRadius: "3px" }}>blog.exemplo.com</code>) para o servidor onde o site está hospedado.
            </li>
            <li>
              <strong>Registro TXT:</strong> adicione um registro de texto (TXT) no domínio com o valor abaixo.
            </li>
            <li>
              <strong>Verificar:</strong> clique no botão &quot;Verificar&quot; do domínio. Se o registro estiver correto, ele ficará marcado como verificado.
            </li>
          </ol>
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.8rem", color: "#7c6f64" }}>
            Valor do registro TXT: <code style={{ background: "#f0ece6", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>multiblog-verify={site?.slug}</code>
          </p>
        </div>
      )}

      {domains.length === 0 ? (
        <p style={{ color: "#999", fontSize: "0.9rem" }}>Nenhum domínio configurado.</p>
      ) : (
        <table style={{ width: "100%", maxWidth: "480px", borderCollapse: "collapse" }}>
          <tbody>
            {domains.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid #f0ece6" }}>
                <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {d.hostname}
                  {d.is_primary && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#7c6f64" }}>(principal)</span>}
                  {d.verified ? (
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#2e7d32" }}>Verificado</span>
                  ) : (
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#c0392b" }}>Não verificado</span>
                  )}
                </td>
                <td style={{ padding: "0.5rem", textAlign: "right", whiteSpace: "nowrap" }}>
                  <a href={`http://${d.hostname}`} target="_blank" rel="noopener noreferrer" style={{ color: "#d4a373", fontSize: "0.85rem", marginRight: "0.75rem" }}>
                    Ver
                  </a>
                  <button onClick={() => verifyDomain(d)} disabled={busy} style={{ background: "none", border: "1px solid #d9d5ce", borderRadius: "6px", color: "#37352f", cursor: "pointer", fontSize: "0.78rem", padding: "0.15rem 0.5rem", marginRight: "0.5rem" }}>
                    Verificar
                  </button>
                  {!d.is_primary && (
                    <button onClick={() => setPrimary(d)} disabled={busy} style={{ background: "none", border: "none", color: "#2e7d32", cursor: "pointer", fontSize: "0.85rem", padding: 0, marginRight: "0.75rem" }}>
                      Tornar principal
                    </button>
                  )}
                  <button onClick={() => setToDelete(d)} disabled={busy} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`Excluir "${toDelete?.hostname}"?`}
        body="Este endereço deixará de apontar para o site."
        busy={busy}
        onConfirm={confirmDeleteDomain}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}