"use client";

import Link from "next/link";
import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useEffect, useState } from "react";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default function SitePostsPage() {
  const { siteId } = useSite();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) return;
    adminFetch(`/api/admin/sites/${siteId}/posts`)
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [siteId]);

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
          New post
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "#999" }}>Loading...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
          <p>No posts yet.</p>
          <Link href={`/admin/sites/${siteId}/posts/new`} style={{ color: "#d4a373" }}>
            Create your first post →
          </Link>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e8e4df" }}>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Title</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Slug</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Status</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} style={{ borderBottom: "1px solid #f0ece6" }}>
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
                    {post.status}
                  </span>
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <Link
                    href={`/admin/sites/${siteId}/posts/${post.id}`}
                    style={{ color: "#d4a373", textDecoration: "none", fontSize: "0.85rem" }}
                  >
                    Edit
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
