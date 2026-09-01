"use client";

import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";

interface Story {
  id: string;
  title: string;
  slug: string;
  description?: string;
  parent_story_id?: string | null;
  relationship_type?: string | null;
}

interface Group {
  id: string;
  title: string;
  slug: string;
}

interface Chapter {
  id: string;
  group_id?: string | null;
  title: string;
  slug: string;
  content: string;
  status: string;
}

export default function StoryDetailPage() {
  const { siteId } = useSite();
  const router = useRouter();
  const params = useParams();
  const storyId = params?.storyId as string;

  const [story, setStory] = useState<Story | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const load = () => {
    if (!siteId || !storyId) return;
    adminFetch(`/api/admin/sites/${siteId}/stories/${storyId}`)
      .then((r) => r.json())
      .then((data) => {
        setStory(data.story || null);
        setGroups(Array.isArray(data.groups) ? data.groups : []);
        setChapters(Array.isArray(data.chapters) ? data.chapters : []);
        if (data.story) {
          setTitle(data.story.title || "");
          setSlug(data.story.slug || "");
          setDescription(data.story.description || "");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [siteId, storyId]);

  const handleSaveStory = async () => {
    if (!title || !slug) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${storyId}`, {
        method: "PUT",
        body: JSON.stringify({ title, slug, description }),
      });
      if (res.ok) setMessage("Story saved.");
      else setMessage("Error saving story.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!confirm("Delete this story and all its chapters?")) return;
    const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${storyId}`, {
      method: "DELETE",
    });
    if (res.ok) router.push(`/admin/sites/${siteId}/stories`);
  };

  if (loading) return <p style={{ color: "#999" }}>Loading...</p>;
  if (!story) return <p style={{ color: "#c0392b" }}>Story not found.</p>;

  const ungrouped = chapters.filter((c) => !c.group_id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: 0 }}>
          Story: {story.title}
        </h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleSaveStory}
            disabled={saving}
            style={{ padding: "0.4rem 0.8rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
          >
            {saving ? "Saving..." : "Save story"}
          </button>
          <button onClick={handleDeleteStory} style={{ padding: "0.4rem 0.8rem", background: "#fff", color: "#c0392b", border: "1px solid #e8e4df", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
            Delete
          </button>
        </div>
      </div>

      {message && (
        <p style={{ padding: "0.5rem 0.75rem", background: message.includes("saved") ? "#e8f5e9" : "#ffebee", borderRadius: "4px", fontSize: "0.85rem", marginBottom: "1rem" }}>
          {message}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "640px", marginBottom: "2rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem", fontFamily: "monospace" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.9rem", resize: "vertical" }} />
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e8e4df", margin: "0 0 2rem" }} />

      <GroupsSection siteId={siteId} storyId={storyId} groups={groups} onChanged={load} />
      <ChaptersSection siteId={siteId} storyId={storyId} groups={groups} chapters={chapters} onChanged={load} />
    </div>
  );
}

function GroupsSection({
  siteId,
  storyId,
  groups,
  onChanged,
}: {
  siteId: string | null;
  storyId: string;
  groups: Group[];
  onChanged: () => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;
    setCreating(true);
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${storyId}/groups`, {
        method: "POST",
        body: JSON.stringify({ title, slug }),
      });
      if (res.ok) {
        setTitle("");
        setSlug("");
        onChanged();
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", marginBottom: "1rem" }}>
        Groups (Books / Seasons / Arcs)
      </h2>
      <form onSubmit={addGroup} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", marginBottom: "1rem", maxWidth: "640px" }}>
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
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem", fontFamily: "monospace" }} />
        </div>
        <button type="submit" disabled={creating} style={{ padding: "0.4rem 0.8rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
          {creating ? "..." : "Add group"}
        </button>
      </form>
      {groups.length === 0 ? (
        <p style={{ color: "#999", fontSize: "0.9rem" }}>No groups yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {groups.map((g) => (
            <li key={g.id} style={{ padding: "0.5rem 0.75rem", background: "#fff", border: "1px solid #e8e4df", borderRadius: "8px", marginBottom: "0.5rem", maxWidth: "640px" }}>
              {g.title} <span style={{ color: "#999", fontFamily: "monospace", fontSize: "0.8rem" }}>/{g.slug}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChaptersSection({
  siteId,
  storyId,
  groups,
  chapters,
  onChanged,
}: {
  siteId: string | null;
  storyId: string;
  groups: Group[];
  chapters: Chapter[];
  onChanged: () => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [groupId, setGroupId] = useState("");
  const [publish, setPublish] = useState(false);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState(false);

  const [editing, setEditing] = useState<Chapter | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editGroup, setEditGroup] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editPreview, setEditPreview] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moveGroup, setMoveGroup] = useState("");
  const [moving, setMoving] = useState(false);
  const [groupMoveError, setGroupMoveError] = useState("");

  const addChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return;
    setCreating(true);
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${storyId}/chapters`, {
        method: "POST",
        body: JSON.stringify({
          title,
          slug,
          content,
          group_id: groupId || null,
          status: publish ? "PUBLISHED" : "DRAFT",
        }),
      });
      if (res.ok) {
        setTitle("");
        setSlug("");
        setContent("");
        setGroupId("");
        setPublish(false);
        onChanged();
      }
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (c: Chapter) => {
    setEditing(c);
    setEditTitle(c.title);
    setEditSlug(c.slug);
    setEditContent(c.content);
    setEditGroup(c.group_id || "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setEditSaving(true);
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${storyId}/chapters/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle,
          slug: editSlug,
          content: editContent,
          group_id: editGroup || null,
          status: editing.status,
        }),
      });
      if (res.ok) {
        setEditing(null);
        onChanged();
      }
    } finally {
      setEditSaving(false);
    }
  };

  const deleteChapter = async (c: Chapter) => {
    if (!confirm(`Delete chapter "${c.title}"?`)) return;
    const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${storyId}/chapters/${c.id}`, {
      method: "DELETE",
    });
    if (res.ok) onChanged();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected((prev) => (prev.size === chapters.length ? new Set() : new Set(chapters.map((c) => c.id))));
  };

  const clearSelection = () => setSelected(new Set());

  const applyBulkMove = async () => {
    if (selected.size === 0) return;
    setMoving(true);
    setGroupMoveError("");
    const target = moveGroup || null;
    try {
      const results = await Promise.all(
        chapters
          .filter((c) => selected.has(c.id))
          .map((c) =>
            adminFetch(`/api/admin/sites/${siteId}/stories/${storyId}/chapters/${c.id}`, {
              method: "PUT",
              body: JSON.stringify({
                title: c.title,
                slug: c.slug,
                content: c.content,
                group_id: target,
                status: c.status,
              }),
            })
          )
      );
      if (results.every((r) => r.ok)) {
        setSelected(new Set());
        setMoveGroup("");
        onChanged();
      } else {
        setGroupMoveError("Failed to move one or more chapters. Please try again.");
      }
    } catch {
      setGroupMoveError("Failed to move chapters. Please try again.");
    } finally {
      setMoving(false);
    }
  };

  const renderChapter = (c: Chapter) => (
    <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.6rem 0.75rem", background: selected.has(c.id) ? "#f3f8ff" : "#fff", border: "1px solid #e8e4df", borderRadius: "8px", marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <input
          type="checkbox"
          checked={selected.has(c.id)}
          onChange={() => toggleSelect(c.id)}
          style={{ width: "auto", cursor: "pointer" }}
          title="Select for bulk move"
        />
        <div>
          <div style={{ fontWeight: 500, color: "#37352f" }}>{c.title}</div>
          <div style={{ color: "#999", fontFamily: "monospace", fontSize: "0.8rem" }}>/{c.slug}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <span
          style={{
            padding: "0.15rem 0.5rem",
            borderRadius: "99px",
            fontSize: "0.7rem",
            fontWeight: 500,
            background: (c.status || "").toUpperCase() === "PUBLISHED" ? "#e8f5e9" : "#fff3e0",
            color: (c.status || "").toUpperCase() === "PUBLISHED" ? "#2e7d32" : "#e65100",
          }}
        >
          {c.status}
        </span>
        <button onClick={() => startEdit(c)} style={{ background: "none", border: "none", color: "#d4a373", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>
          Edit
        </button>
        <button onClick={() => deleteChapter(c)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>
          Delete
        </button>
      </div>
    </div>
  );

  const ungrouped = chapters.filter((c) => !c.group_id);

  return (
    <div style={{ maxWidth: "720px" }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", marginBottom: "1rem" }}>
        Chapters
      </h2>

      <div style={{ padding: "1rem", background: "#faf7f2", borderRadius: "8px", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#37352f", margin: "0 0 0.75rem" }}>New chapter</h3>
        <form onSubmit={addChapter} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
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
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem", fontFamily: "monospace" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Group (optional)</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }}>
              <option value="">— No group —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#7c6f64" }}>Content (Markdown)</label>
              <button onClick={() => setPreview((p) => !p)} style={{ background: "none", border: "none", color: "#d4a373", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}>
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <MarkdownPreview content={content} />
            ) : (
              <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={5} style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem", fontFamily: "monospace", resize: "vertical" }} />
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button type="submit" disabled={creating} style={{ padding: "0.4rem 0.8rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
              {creating ? "..." : publish ? "Add & Publish" : "Add chapter"}
            </button>
            <label style={{ fontSize: "0.85rem", color: "#7c6f64", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} style={{ width: "auto" }} />
              Publish
            </label>
          </div>
        </form>
      </div>

      {chapters.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "#7c6f64", cursor: "pointer" }}>
            <input type="checkbox" checked={selected.size === chapters.length} onChange={selectAll} style={{ width: "auto", cursor: "pointer" }} />
            Select all
          </label>
          {selected.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", background: "#faf7f2", border: "1px solid #e8e4df", borderRadius: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", color: "#7c6f64" }}>{selected.size} selected</span>
              <select value={moveGroup} onChange={(e) => setMoveGroup(e.target.value)} disabled={moving} style={{ padding: "0.3rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.8rem" }}>
                <option value="">— No group —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
              <button onClick={applyBulkMove} disabled={moving || selected.size === 0} style={{ padding: "0.3rem 0.7rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                {moving ? "..." : "Move"}
              </button>
              <button onClick={clearSelection} disabled={moving} style={{ background: "none", border: "none", color: "#7c6f64", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}>
                Clear
              </button>
            </div>
          )}
        </div>
      )}
      {groupMoveError && <p style={{ color: "#c0392b", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>{groupMoveError}</p>}

      {groups.map((g) => {
        const gc = chapters.filter((c) => c.group_id === g.id);
        if (gc.length === 0) return null;
        return (
          <div key={g.id} style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#7c6f64" }}>{g.title}</p>
            {gc.map(renderChapter)}
          </div>
        );
      })}

      {ungrouped.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#7c6f64" }}>Ungrouped</p>
          {ungrouped.map(renderChapter)}
        </div>
      )}

      {chapters.length === 0 && <p style={{ color: "#999", fontSize: "0.9rem" }}>No chapters yet.</p>}

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "1.5rem", maxWidth: "560px", width: "90%", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: 0 }}>Edit chapter</h3>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Title</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Slug</label>
                  <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem", fontFamily: "monospace" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Group</label>
                <select value={editGroup} onChange={(e) => setEditGroup(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }}>
                  <option value="">— No group —</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "#7c6f64" }}>Content</label>
                  <button onClick={() => setEditPreview((p) => !p)} style={{ background: "none", border: "none", color: "#d4a373", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}>
                    {editPreview ? "Edit" : "Preview"}
                  </button>
                </div>
                {editPreview ? (
                  <MarkdownPreview content={editContent} />
                ) : (
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} style={{ width: "100%", padding: "0.45rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem", fontFamily: "monospace", resize: "vertical" }} />
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button onClick={() => setEditing(null)} style={{ padding: "0.4rem 0.8rem", background: "#fff", color: "#37352f", border: "1px solid #d9d5ce", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                  Cancel
                </button>
                <button onClick={saveEdit} disabled={editSaving} style={{ padding: "0.4rem 0.8rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                  {editSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
