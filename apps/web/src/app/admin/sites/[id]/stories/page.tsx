"use client";

import Link from "next/link";
import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useEffect, useState } from "react";

interface Story {
  id: string;
  title: string;
  slug: string;
  description?: string;
  parent_story_id?: string | null;
  relationship_type?: string | null;
}

export default function SiteStoriesPage() {
  const { siteId } = useSite();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchStories = () => {
    if (!siteId) return;
    adminFetch(`/api/admin/sites/${siteId}/stories`)
      .then((r) => r.json())
      .then((data) => setStories(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStories(); }, [siteId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;
    setCreating(true);
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/stories`, {
        method: "POST",
        body: JSON.stringify({ title, slug }),
      });
      if (res.ok) {
        setTitle("");
        setSlug("");
        fetchStories();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (story: Story) => {
    if (!confirm(`Delete story "${story.title}" and all its chapters?`)) return;
    const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${story.id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchStories();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: 0 }}>
          Stories
        </h1>
      </div>

      <div style={{ marginBottom: "2rem", padding: "1rem", background: "#faf7f2", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#37352f", margin: "0 0 0.75rem" }}>New story</h2>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Title</label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
              }}
              required
              style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem", fontFamily: "monospace" }}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            style={{ padding: "0.4rem 0.8rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", whiteSpace: "nowrap" }}
          >
            {creating ? "..." : "Create"}
          </button>
        </form>
      </div>

      {loading ? (
        <p style={{ color: "#999" }}>Loading...</p>
      ) : stories.length === 0 ? (
        <p style={{ color: "#999", textAlign: "center", padding: "2rem" }}>No stories yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e8e4df" }}>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Title</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Slug</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Type</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Chapters</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story) => {
              const type = story.parent_story_id ? (story.relationship_type || "Related") : "Main";
              return (
                <tr key={story.id} style={{ borderBottom: "1px solid #f0ece6" }}>
                  <td style={{ padding: "0.5rem" }}>{story.title}</td>
                  <td style={{ padding: "0.5rem", color: "#999", fontFamily: "monospace", fontSize: "0.85rem" }}>/{story.slug}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "99px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        background: story.parent_story_id ? "#ede7f6" : "#e3f2fd",
                        color: story.parent_story_id ? "#5e35b1" : "#0d47a1",
                      }}
                    >
                      {type}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", color: "#7c6f64", fontSize: "0.9rem" }}>
                    <StoryCount siteId={siteId} storyId={story.id} />
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "0.6rem" }}>
                      <Link
                        href={`/admin/sites/${siteId}/stories/${story.id}`}
                        style={{ color: "#d4a373", textDecoration: "none", fontSize: "0.85rem" }}
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => handleDelete(story)}
                        style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StoryCount({ siteId, storyId }: { siteId: string | null; storyId: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!siteId) return;
    adminFetch(`/api/admin/sites/${siteId}/stories/${storyId}`)
      .then((r) => r.json())
      .then((data) => setCount(Array.isArray(data.chapters) ? data.chapters.length : 0));
  }, [siteId, storyId]);

  return <>{count === null ? "…" : count}</>;
}
