"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin";

type Site = { id: string; name: string; slug: string };
type Story = {
  id: string;
  title: string;
  slug: string;
  relationship_type?: string;
  parent_story_id?: string;
};

export default function AdminStoriesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [relationshipType, setRelationshipType] = useState("MAIN");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  async function loadSites() {
    const res = await adminFetch("/api/admin/sites");
    if (res.ok) {
      const data = await res.json();
      setSites(data);
      if (data.length > 0 && !selectedSite) setSelectedSite(data[0].id);
    }
  }

  async function loadStories() {
    if (!selectedSite) return;
    const res = await adminFetch(`/api/admin/sites/${selectedSite}/stories`);
    if (res.ok) setStories(await res.json());
  }

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    loadStories();
  }, [selectedSite]);

  async function createStory(e: React.FormEvent) {
    e.preventDefault();
    const body: any = {
      title,
      slug,
      description,
      relationship_type: relationshipType,
    };
    if (parentId) {
      body.parent_story_id = parentId;
      body.relationship_type = "SPINOFF";
    }
    if (!parentId && relationshipType === "MAIN") delete body.relationship_type;

    const res = await adminFetch(`/api/admin/sites/${selectedSite}/stories`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setTitle("");
      setSlug("");
      setDescription("");
      setParentId("");
      setRelationshipType("MAIN");
      setShowForm(false);
      loadStories();
    }
  }

  return (
    <AdminShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h1>Stories</h1>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button className="btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New Story"}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={createStory} style={{ margin: "2rem 0" }}>
          <div className="form-field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: "80px" }} />
          </div>
          <div className="form-field">
            <label>Parent story (for spin-off / related)</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— None (Main Story) —</option>
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" type="submit">
            Create Story
          </button>
        </form>
      )}

      <div className="admin-list">
        {stories.map((story) => (
          <div key={story.id} className="admin-list-item">
            <div className="info">
              <h3>{story.title}</h3>
              <p>
                /{story.slug}
                {story.parent_story_id
                  ? ` · ${story.relationship_type || "Related"}`
                  : " · Main"}
              </p>
            </div>
            <div className="actions">
              <button className="small-btn" onClick={() => setSelectedStory(story)}>
                Manage
              </button>
            </div>
          </div>
        ))}
        {stories.length === 0 && <p className="empty">No stories for this site.</p>}
      </div>

      {selectedStory && (
        <StoryManager
          siteId={selectedSite}
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onChanged={loadStories}
        />
      )}
    </AdminShell>
  );
}

function StoryManager({
  siteId,
  story,
  onClose,
  onChanged,
}: {
  siteId: string;
  story: Story;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [groups, setGroups] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupSlug, setGroupSlug] = useState("");
  const [chTitle, setChTitle] = useState("");
  const [chSlug, setChSlug] = useState("");
  const [chContent, setChContent] = useState("");
  const [chGroup, setChGroup] = useState("");
  const [publish, setPublish] = useState(false);

  async function load() {
    const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${story.id}`);
    if (res.ok) {
      const data = await res.json();
      setGroups(data.groups || []);
      setChapters(data.chapters || []);
    }
  }

  useEffect(() => {
    load();
  }, [story.id]);

  async function addGroup(e: React.FormEvent) {
    e.preventDefault();
    const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${story.id}/groups`, {
      method: "POST",
      body: JSON.stringify({ title: groupTitle, slug: groupSlug }),
    });
    if (res.ok) {
      setGroupTitle("");
      setGroupSlug("");
      load();
    }
  }

  async function addChapter(e: React.FormEvent) {
    e.preventDefault();
    const body: any = {
      title: chTitle,
      slug: chSlug,
      content: chContent,
      group_id: chGroup || null,
    };
    if (publish) body.status = "PUBLISHED";
    const res = await adminFetch(`/api/admin/sites/${siteId}/stories/${story.id}/chapters`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setChTitle("");
      setChSlug("");
      setChContent("");
      setChGroup("");
      setPublish(false);
      load();
    }
  }

  return (
    <div
      style={{
        marginTop: "2rem",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "1.5rem",
        background: "var(--bg-elevated)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)" }}>Manage: {story.title}</h2>
        <button className="small-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <h3 style={{ marginBottom: "0.75rem", fontSize: "1rem" }}>Groups (Books / Seasons / Arcs)</h3>
      <form onSubmit={addGroup} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <input style={{ flex: 1, minWidth: "160px" }} placeholder="Group title (e.g. Book 1)" value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} required />
        <input style={{ flex: 1, minWidth: "120px" }} placeholder="slug" value={groupSlug} onChange={(e) => setGroupSlug(e.target.value)} required />
        <button className="btn" type="submit">
          Add Group
        </button>
      </form>

      <h3 style={{ marginBottom: "0.75rem", fontSize: "1rem" }}>New Chapter</h3>
      <form onSubmit={addChapter} className="admin-form" style={{ marginBottom: "1.5rem" }}>
        <div className="form-field">
          <label>Group (optional)</label>
          <select value={chGroup} onChange={(e) => setChGroup(e.target.value)}>
            <option value="">— No group —</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Title</label>
          <input value={chTitle} onChange={(e) => setChTitle(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Slug</label>
          <input value={chSlug} onChange={(e) => setChSlug(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Content (Markdown)</label>
          <textarea value={chContent} onChange={(e) => setChContent(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="btn" type="submit">
            Add {publish ? "& Publish" : "Chapter"}
          </button>
          <label style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} style={{ width: "auto", marginRight: "0.35rem" }} />
            Publish
          </label>
        </div>
      </form>

      <h3 style={{ marginBottom: "0.75rem", fontSize: "1rem" }}>Chapters</h3>
      <div className="admin-list">
        {groups.map((g) => {
          const gc = chapters.filter((c) => c.group_id === g.id);
          return (
            <div key={g.id} style={{ marginBottom: "1rem" }}>
              <p style={{ fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-muted)" }}>
                {g.title}
              </p>
              {gc.map((c) => (
                <div key={c.id} className="admin-list-item">
                  <div className="info">
                    <h3>{c.title}</h3>
                    <p>/{c.slug}</p>
                  </div>
                  <div className="actions">
                    <span className={`status-pill ${c.status === "PUBLISHED" ? "published" : ""}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        {chapters.filter((c) => !c.group_id).length > 0 && (
          <div>
            <p style={{ fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-muted)" }}>
              Ungrouped
            </p>
            {chapters
              .filter((c) => !c.group_id)
              .map((c) => (
                <div key={c.id} className="admin-list-item">
                  <div className="info">
                    <h3>{c.title}</h3>
                    <p>/{c.slug}</p>
                  </div>
                  <div className="actions">
                    <span className={`status-pill ${c.status === "PUBLISHED" ? "published" : ""}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
