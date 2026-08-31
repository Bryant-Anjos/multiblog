"use client";

import Link from "next/link";
import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useEffect, useState } from "react";

interface Domain {
  id: string;
  hostname: string;
  is_primary: boolean;
}

interface Post {
  id: string;
  status: string;
}

interface Page {
  id: string;
  status: string;
}

interface Story {
  id: string;
  title: string;
}

export default function SiteDashboard() {
  const { site, siteId, loading, error } = useSite();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!siteId) return;
    Promise.all([
      adminFetch(`/api/admin/sites/${siteId}/domains`).then((r) => r.json()),
      adminFetch(`/api/admin/sites/${siteId}/posts`).then((r) => r.json()),
      adminFetch(`/api/admin/sites/${siteId}/pages`).then((r) => r.json()),
      adminFetch(`/api/admin/sites/${siteId}/stories`).then((r) => r.json()),
    ]).then(([d, p, pg, s]) => {
      setDomains(Array.isArray(d) ? d : []);
      setPosts(Array.isArray(p) ? p : []);
      setPages(Array.isArray(pg) ? pg : []);
      setStories(Array.isArray(s) ? s : []);
    });
  }, [siteId]);

  if (loading) return <p style={{ color: "#999" }}>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!site) return <p>Site not found.</p>;

  const publishedPosts = posts.filter((p) => (p.status || "").toUpperCase() === "PUBLISHED").length;
  const draftPosts = posts.filter((p) => (p.status || "").toUpperCase() === "DRAFT").length;
  const primaryDomain = domains.find((d) => d.is_primary)?.hostname || domains[0]?.hostname;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: 0 }}>
            {site.name}
          </h1>
          <p style={{ color: "#7c6f64", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            /{site.slug} · {site.language}
          </p>
        </div>
        {primaryDomain && (
          <a
            href={`http://${primaryDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.4rem 0.8rem",
              background: "#fff",
              border: "1px solid #d4a373",
              borderRadius: "6px",
              color: "#d4a373",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            ↗ View site
          </a>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Posts", value: posts.length, sub: `${publishedPosts} published, ${draftPosts} drafts`, href: `/admin/sites/${siteId}/posts` },
          { label: "Pages", value: pages.length, sub: null, href: `/admin/sites/${siteId}/pages` },
          { label: "Stories", value: stories.length, sub: null, href: `/admin/sites/${siteId}/stories` },
          { label: "Domains", value: domains.length, sub: null, href: `/admin/sites/${siteId}/settings` },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            style={{
              display: "block",
              padding: "1rem",
              background: "#fff",
              border: "1px solid #e8e4df",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#7c6f64" }}>{card.label}</div>
            {card.sub && <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "0.25rem" }}>{card.sub}</div>}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Link
          href={`/admin/sites/${siteId}/posts/new`}
          style={{
            padding: "0.5rem 1rem",
            background: "#37352f",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          New post
        </Link>
        <Link
          href={`/admin/sites/${siteId}/pages/new`}
          style={{
            padding: "0.5rem 1rem",
            background: "#fff",
            color: "#37352f",
            border: "1px solid #d9d5ce",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          New page
        </Link>
      </div>
    </div>
  );
}
