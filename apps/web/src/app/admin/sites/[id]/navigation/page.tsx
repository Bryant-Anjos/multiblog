"use client";

import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useEffect, useMemo, useState } from "react";
import { SkeletonRows } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface NavItem {
  id: string;
  label: string;
  type: string;
  destination: string;
  position: number;
  is_visible: boolean;
}

type NavType = "home" | "page" | "posts" | "stories" | "link";

const TYPE_INFO: Record<
  NavType,
  { label: string; description: string; icon: string; placeholder: string; external?: boolean }
> = {
  home: {
    label: "Início",
    description: "Link para a página inicial do site.",
    icon: "⌂",
    placeholder: "/",
  },
  page: {
    label: "Página",
    description: "Link para uma página interna do seu site (ex.: “Sobre”, “Contato”).",
    icon: "✎",
    placeholder: "/pages/sobre",
  },
  posts: {
    label: "Posts",
    description: "Abre a lista de posts publicados do blog.",
    icon: "◷",
    placeholder: "/posts",
  },
  stories: {
    label: "Histórias",
    description: "Abre a lista de histórias (séries de capítulos).",
    icon: "📖",
    placeholder: "/stories",
  },
  link: {
    label: "Link externo",
    description: "Link para um endereço na internet (abre fora do site).",
    icon: "↗",
    placeholder: "https://exemplo.com",
    external: true,
  },
};

const TYPE_ORDER: NavType[] = ["home", "page", "posts", "stories", "link"];
const VISIBLE_TYPES: NavType[] = TYPE_ORDER;

function navLabel(type: string): string {
  const t = (TYPE_INFO as Record<string, { label: string }>)[type];
  return t ? t.label : type;
}

export default function SiteNavigationPage() {
  const { siteId } = useSite();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [label, setLabel] = useState("");
  const [type, setType] = useState<NavType>("page");
  const [destination, setDestination] = useState("");
  const [creating, setCreating] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<NavType>("page");
  const [editDestination, setEditDestination] = useState("");
  const [editVisible, setEditVisible] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const [toDelete, setToDelete] = useState<NavItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sorted = useMemo(() => [...items].sort((a, b) => a.position - b.position), [items]);

  const fetchItems = () => {
    if (!siteId) return;
    adminFetch(`/api/admin/sites/${siteId}/navigation`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError("Não foi possível carregar o menu."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, [siteId]);

  const isHomeOrPage = (t: string) => t === "home" || t === "page";
  const mainNav = sorted.filter((n) => (isHomeOrPage(n.type) || n.type === "link") && n.is_visible);
  const contentNav = sorted
    .filter((n) => (n.type === "posts" || n.type === "stories" || n.type === "page") && n.is_visible);

  const selectedTypeInfo = TYPE_INFO[type];

  const resetCreate = () => {
    setLabel("");
    setType("page");
    setDestination("");
    setMessage("");
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !type) return;
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/navigation`, {
        method: "POST",
        body: JSON.stringify({
          label: label.trim(),
          type,
          destination: destination.trim(),
          position: items.length,
          is_visible: true,
        }),
      });
      if (res.ok) {
        resetCreate();
        fetchItems();
        setMessage("Item adicionado ao menu.");
      } else {
        setError("Não foi possível salvar o item.");
      }
    } catch {
      setError("Não foi possível salvar o item.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (item: NavItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditType((item.type as NavType) || "page");
    setEditDestination(item.destination);
    setEditVisible(item.is_visible);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    setError("");
    setMessage("");
    const item = items.find((i) => i.id === editingId);
    if (!item) return;
    try {
      const res = await adminFetch(`/api/admin/navigation/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          label: editLabel.trim(),
          type: editType,
          destination: editDestination.trim(),
          position: item.position,
          is_visible: editVisible,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchItems();
        setMessage("Alterações salvas.");
      } else {
        setError("Não foi possível salvar as alterações.");
      }
    } catch {
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSavingEdit(false);
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    const update = (item: NavItem, pos: number) =>
      adminFetch(`/api/admin/navigation/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          label: item.label,
          type: item.type,
          destination: item.destination,
          position: pos,
          is_visible: item.is_visible,
        }),
      });
    setDeleting(true);
    setError("");
    try {
      await Promise.all([update(a, b.position), update(b, a.position)]);
      fetchItems();
    } catch {
      setError("Não foi possível reordenar.");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setError("");
    try {
      const res = await adminFetch(`/api/admin/navigation/${toDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setToDelete(null);
        setMessage(`Item “${toDelete.label}” removido do menu.`);
        fetchItems();
      } else {
        setError("Não foi possível remover o item.");
      }
    } catch {
      setError("Não foi possível remover o item.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: 0 }}>
          Menu de navegação
        </h1>
        <p style={{ color: "#7c6f64", fontSize: "0.9rem", margin: "0.35rem 0 0", maxWidth: "560px" }}>
          Estes são os itens que aparecem no menu lateral do seu site. Adicione, reordene (↑/↓),
          edite ou oculte links abaixo. Você vê uma prévia do resultado em tempo real.
        </p>
      </div>

      {message && (
        <p style={{ padding: "0.5rem 0.75rem", background: "#e8f5e9", borderRadius: "4px", fontSize: "0.85rem", color: "#2e7d32", marginBottom: "1rem" }}>
          {message}
        </p>
      )}
      {error && (
        <p style={{ padding: "0.5rem 0.75rem", background: "#ffebee", borderRadius: "4px", fontSize: "0.85rem", color: "#c0392b", marginBottom: "1rem" }}>
          {error}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "1.5rem", alignItems: "start" }}>
        <div>
          <section style={{ marginBottom: "2rem", padding: "1rem", background: "#faf7f2", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#37352f", margin: "0 0 0.75rem" }}>
              Adicionar item ao menu
            </h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Texto do link</label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder='Ex.: "Sobre mim"'
                    required
                    style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Tipo de item</label>
                  <select value={type} onChange={(e) => { setType(e.target.value as NavType); setDestination(""); }} style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }}>
                    {VISIBLE_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_INFO[t].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>
                  Endereço
                </label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={selectedTypeInfo.placeholder}
                  required={type !== "home"}
                  style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem", fontFamily: "monospace" }}
                />
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "#7c6f64" }}>
                  <span style={{ marginRight: "0.35rem" }}>{selectedTypeInfo.icon}</span>
                  {selectedTypeInfo.description}
                  {selectedTypeInfo.external
                    ? " Cole o endereço completo (com https://)."
                    : type === "home"
                      ? " O Início aponta para a raiz do site."
                      : " Informe o caminho no site. Você pode usar o atalho sugerido abaixo."}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="submit" disabled={creating || !label.trim()} style={{ padding: "0.4rem 0.9rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                    {creating ? "Salvando…" : "+ Adicionar ao menu"}
                  </button>
                  {type !== "home" && selectedTypeInfo.placeholder.startsWith("/") && (
                    <button
                      type="button"
                      onClick={() => setDestination(selectedTypeInfo.placeholder)}
                      disabled={destination === selectedTypeInfo.placeholder}
                      style={{ padding: "0.4rem 0.9rem", background: "#fff", color: "#37352f", border: "1px solid #d9d5ce", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      Usar sugestão: <span style={{ fontFamily: "monospace" }}>{selectedTypeInfo.placeholder}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </section>

          <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#37352f", margin: "0 0 0.75rem" }}>
            Itens do menu
          </h2>

          {loading ? (
            <SkeletonRows rows={3} cols={4} />
          ) : sorted.length === 0 ? (
            <EmptyState title="Seu menu ainda está vazio." hint="Adicione um item acima para começar a montar a navegação do site." />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e8e4df" }}>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Ordem</th>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Item</th>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Destino</th>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Visível</th>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f0ece6", background: editingId === item.id ? "#fffaf3" : "transparent" }}>
                    <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                      <button onClick={() => move(i, -1)} disabled={i === 0 || deleting} style={arrowBtnStyle}>↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === sorted.length - 1 || deleting} style={arrowBtnStyle}>↓</button>
                    </td>

                    {editingId === item.id ? (
                      <>
                        <td style={{ padding: "0.5rem" }}>
                          <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Texto do link" style={{ width: "100%", minWidth: "120px", padding: "0.3rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.8rem" }} />
                          <p style={{ margin: "0.15rem 0 0", fontSize: "0.72rem", color: "#7c6f64" }}>Texto do link</p>
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          <select value={editType} onChange={(e) => { setEditType(e.target.value as NavType); }} style={{ width: "100%", padding: "0.3rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.8rem" }}>
                            {VISIBLE_TYPES.map((t) => (
                              <option key={t} value={t}>{TYPE_INFO[t].label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          <input value={editDestination} onChange={(e) => setEditDestination(e.target.value)} placeholder={TYPE_INFO[editType].placeholder} style={{ width: "100%", minWidth: "130px", padding: "0.3rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.8rem", fontFamily: "monospace" }} />
                        </td>
                        <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                          <button onClick={() => setEditVisible((v) => !v)} style={{ background: "none", border: "1px solid #d9d5ce", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", padding: "0.2rem 0.5rem", color: editVisible ? "#2e7d32" : "#c0392b" }}>
                            {editVisible ? "Sim" : "Não"}
                          </button>
                        </td>
                        <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                          <button onClick={saveEdit} disabled={savingEdit || !editLabel.trim()} style={{ background: "none", border: "none", color: "#2e7d32", cursor: "pointer", fontSize: "0.85rem", padding: 0, marginRight: "0.5rem" }}>
                            {savingEdit ? "Salvando…" : "Salvar"}
                          </button>
                          <button onClick={cancelEdit} style={{ background: "none", border: "none", color: "#7c6f64", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>
                            Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "0.5rem" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                            <span aria-hidden="true" style={{ color: "#999" }}>{TYPE_INFO[item.type as NavType]?.icon ?? "•"}</span>
                            <span>{item.label}</span>
                            <span style={{ color: "#999", fontSize: "0.75rem" }}>{navLabel(item.type)}</span>
                          </span>
                        </td>
                        <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.85rem", color: item.destination ? "#37352f" : "#aaa" }}>
                          {item.destination || "—"}
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          {item.is_visible ? (
                            <span style={{ color: "#2e7d32", fontSize: "0.8rem" }}>Visível</span>
                          ) : (
                            <span style={{ color: "#c0392b", fontSize: "0.8rem" }}>Oculto</span>
                          )}
                        </td>
                        <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                          <button onClick={() => startEdit(item)} style={{ background: "none", border: "none", color: "#d4a373", cursor: "pointer", fontSize: "0.85rem", padding: 0, marginRight: "0.75rem" }}>
                            Editar
                          </button>
                          <button onClick={() => setToDelete(item)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>
                            Excluir
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ position: "sticky", top: "1rem", background: "#fff", border: "1px solid #e8e4df", borderRadius: "8px", padding: "1rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#7c6f64", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem" }}>
            Prévia do menu
          </p>
          <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "0.95rem" }}>
            <div style={{ fontWeight: 600, color: "#37352f", marginBottom: "0.15rem" }}>{/* site name */}Seu site</div>
            <div style={{ color: "#999", fontSize: "0.75rem", marginBottom: "0.75rem" }}>Descrição do site</div>

            <div style={{ marginBottom: "0.5rem" }}>
              {(mainNav.length > 0 ? mainNav : sorted).map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.15rem 0", color: "#37352f" }}>
                  <span aria-hidden="true" style={{ color: "#999", minWidth: "1em" }}>{TYPE_INFO[item.type as NavType]?.icon ?? "•"}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {(contentNav.length > 0) && (
              <div>
                <div style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", marginBottom: "0.25rem" }}>Conteúdo</div>
                {contentNav.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.15rem 0", color: "#37352f" }}>
                    <span aria-hidden="true" style={{ color: "#999", minWidth: "1em" }}>{TYPE_INFO[item.type as NavType]?.icon ?? "•"}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
            {mainNav.length === 0 && contentNav.length === 0 && (
              <div style={{ color: "#aaa", fontSize: "0.85rem" }}>O menu ainda está vazio.</div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Excluir “${toDelete?.label}”?`}
        body="Este item será removido do menu do site."
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

const arrowBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid #d9d5ce",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.8rem",
  lineHeight: 1,
  padding: "0.2rem 0.45rem",
  marginRight: "0.25rem",
  color: "#7c6f64",
};