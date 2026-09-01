"use client";

import Link from "next/link";
import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useEffect, useState } from "react";
import { SkeletonRows } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export default function SitePagesPage() {
  const { siteId } = useSite();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) return;
    adminFetch(`/api/admin/sites/${siteId}/pages`)
      .then((r) => r.json())
      .then((data) => setPages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [siteId]);

  const statusLabel = (s: string) => (s || "").toUpperCase() === "PUBLISHED" ? "Publicado" : "Rascunho";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: 0 }}>
          Páginas
        </h1>
        <Link
          href={`/admin/sites/${siteId}/pages/new`}
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
          Nova página
        </Link>
      </div>
      <p style={{ color: "#7c6f64", fontSize: "0.9rem", marginTop: 0, maxWidth: "560px" }}>
        Páginas são textos fixos, como &quot;Sobre&quot; ou &quot;Contato&quot;, que ficam acessíveis para sempre no site.
      </p>

      {loading ? (
        <SkeletonRows rows={4} cols={4} />
      ) : pages.length === 0 ? (
        <EmptyState
          title="Nenhuma página ainda."
          hint="Crie páginas como &quot;Sobre&quot; ou &quot;Contato&quot; para o seu site."
          ctaHref={`/admin/sites/${siteId}/pages/new`}
          ctaLabel="Criar sua primeira página"
        />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e8e4df" }}>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Título</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Endereço</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Situação</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} style={{ borderBottom: "1px solid #f0ece6" }}>
                <td style={{ padding: "0.5rem" }}>{page.title}</td>
                <td style={{ padding: "0.5rem", color: "#999", fontFamily: "monospace", fontSize: "0.85rem" }}>/{page.slug}</td>
                <td style={{ padding: "0.5rem" }}>
                  <span
                    style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: "99px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      background: (page.status || "").toUpperCase() === "PUBLISHED" ? "#e8f5e9" : "#fff3e0",
                      color: (page.status || "").toUpperCase() === "PUBLISHED" ? "#2e7d32" : "#e65100",
                    }}
                  >
                    {statusLabel(page.status)}
                  </span>
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <Link
                    href={`/admin/sites/${siteId}/pages/${page.id}`}
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
    </div>
  );
}
