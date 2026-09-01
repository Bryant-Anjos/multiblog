"use client";

import Link from "next/link";
import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useEffect, useState } from "react";
import { SkeletonRows } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default function SitePostsPage() {
  const { siteId } = useSite();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchPosts = () => {
    if (!siteId) return;
    adminFetch(`/api/admin/sites/${siteId}/posts`)
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, [siteId]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === posts.length ? new Set() : new Set(posts.map((p) => p.id))));
  };

  const selectedPosts = posts.filter((p) => selected.has(p.id));
  const allSelected = posts.length > 0 && selected.size === posts.length;

  const runBulk = async (publish: boolean) => {
    setBusy(true);
    try {
      await Promise.all(
        selectedPosts.map((p) =>
          adminFetch(`/api/admin/sites/${siteId}/posts/${p.id}`, {
            method: "PUT",
            body: JSON.stringify({ status: publish ? "PUBLISHED" : "DRAFT" }),
          })
        )
      );
      setSelected(new Set());
      fetchPosts();
    } finally {
      setBusy(false);
    }
  };

  const runBulkDelete = async () => {
    setBusy(true);
    try {
      await Promise.all(
        selectedPosts.map((p) =>
          adminFetch(`/api/admin/sites/${siteId}/posts/${p.id}`, { method: "DELETE" })
        )
      );
      setSelected(new Set());
      setConfirmDelete(false);
      fetchPosts();
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = (s: string) => (s || "").toUpperCase() === "PUBLISHED" ? "Publicado" : "Rascunho";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: 0 }}>
          Posts
        </h1>
        <Link
          href={`/admin/sites/${siteId}/posts/new`}
          style={{
            padding: "0.4rem 0.8rem",
            background: "#37352f",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          Novo post
        </Link>
      </div>

      {selected.size > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 0.75rem",
            background: "#faf7f2",
            border: "1px solid #e8e4df",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#7c6f64", marginRight: "0.5rem" }}>
            {selected.size} selecionado{selected.size === 1 ? "" : "s"}
          </span>
          <button onClick={() => runBulk(true)} disabled={busy} style={toolbarBtn("#2e7d32")}>
            {busy ? "..." : "Publicar"}
          </button>
          <button onClick={() => runBulk(false)} disabled={busy} style={toolbarBtn("#e65100")}>
            {busy ? "..." : "Reverter para rascunho"}
          </button>
          <button onClick={() => setConfirmDelete(true)} disabled={busy} style={toolbarBtn("#c0392b")}>
            Excluir
          </button>
          <button
            onClick={() => setSelected(new Set())}
            disabled={busy}
            style={{ background: "none", border: "none", color: "#7c6f64", cursor: "pointer", fontSize: "0.85rem", marginLeft: "auto", padding: 0 }}
          >
            Limpar seleção
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonRows rows={4} cols={4} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="Nenhum post ainda."
          hint="Publique seu primeiro post para ele aparecer no site."
          ctaHref={`/admin/sites/${siteId}/posts/new`}
          ctaLabel="Criar seu primeiro post"
        />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e8e4df" }}>
              <th style={{ textAlign: "left", padding: "0.5rem", width: "28px" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  style={{ width: "auto", cursor: "pointer" }}
                />
              </th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Título</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Endereço</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Situação</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                style={{ borderBottom: "1px solid #f0ece6", background: selected.has(post.id) ? "#f3f8ff" : "transparent" }}
              >
                <td style={{ padding: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={selected.has(post.id)}
                    onChange={() => toggle(post.id)}
                    style={{ width: "auto", cursor: "pointer" }}
                  />
                </td>
                <td style={{ padding: "0.5rem" }}>{post.title}</td>
                <td style={{ padding: "0.5rem", color: "#999", fontFamily: "monospace", fontSize: "0.85rem" }}>/{post.slug}</td>
                <td style={{ padding: "0.5rem" }}>
                  <span
                    style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: "99px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      background: (post.status || "").toUpperCase() === "PUBLISHED" ? "#e8f5e9" : "#fff3e0",
                      color: (post.status || "").toUpperCase() === "PUBLISHED" ? "#2e7d32" : "#e65100",
                    }}
                  >
                    {statusLabel(post.status)}
                  </span>
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <Link
                    href={`/admin/sites/${siteId}/posts/${post.id}`}
                    style={{ color: "#d4a373", textDecoration: "none", fontSize: "0.85rem" }}
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Excluir ${selected.size} post${selected.size === 1 ? "" : "s"}?`}
        body="Isso remove permanentemente os posts selecionados. Esta ação não pode ser desfeita."
        busy={busy}
        confirmLabel={busy ? "..." : "Excluir"}
        onConfirm={runBulkDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

const toolbarBtn = (color: string): React.CSSProperties => ({
  padding: "0.3rem 0.7rem",
  background: "#fff",
  color,
  border: `1px solid ${color}`,
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.8rem",
  whiteSpace: "nowrap",
});
