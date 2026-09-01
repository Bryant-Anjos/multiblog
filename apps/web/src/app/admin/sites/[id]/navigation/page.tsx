"use client";

import { useSite } from "@/context/SiteContext";
import { adminFetch } from "@/lib/admin";
import { useEffect, useState } from "react";
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

export default function SiteNavigationPage() {
  const { siteId } = useSite();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [type, setType] = useState("link");
  const [destination, setDestination] = useState("");
  const [creating, setCreating] = useState(false);

  const [toDelete, setToDelete] = useState<NavItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = [...items].sort((a, b) => a.position - b.position);

  const fetchItems = () => {
    if (!siteId) return;
    adminFetch(`/api/admin/sites/${siteId}/navigation`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, [siteId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !type) return;
    setCreating(true);
    try {
      const res = await adminFetch(`/api/admin/sites/${siteId}/navigation`, {
        method: "POST",
        body: JSON.stringify({ label, type, destination, position: items.length, is_visible: true }),
      });
      if (res.ok) {
        setLabel("");
        setDestination("");
        fetchItems();
      }
    } finally {
      setCreating(false);
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
    try {
      await Promise.all([update(a, b.position), update(b, a.position)]);
      fetchItems();
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    await adminFetch(`/api/admin/navigation/${toDelete.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setToDelete(null);
    fetchItems();
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", marginBottom: "1.5rem" }}>
        Navigation
      </h1>

      <div style={{ marginBottom: "2rem", padding: "1rem", background: "#faf7f2", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#37352f", margin: "0 0 0.75rem" }}>Add item</h2>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} required style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }} />
          </div>
          <div style={{ width: "100px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }}>
              <option value="link">Link</option>
              <option value="page">Page</option>
              <option value="posts">Posts</option>
              <option value="stories">Stories</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#7c6f64", marginBottom: "0.25rem" }}>Destination</label>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} style={{ width: "100%", padding: "0.4rem", border: "1px solid #d9d5ce", borderRadius: "4px", fontSize: "0.85rem" }} />
          </div>
          <button type="submit" disabled={creating} style={{ padding: "0.4rem 0.8rem", background: "#37352f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            {creating ? "..." : "Add"}
          </button>
        </form>
      </div>

      {loading ? (
        <SkeletonRows rows={3} cols={4} />
      ) : sorted.length === 0 ? (
        <EmptyState title="No navigation items yet." hint="Add links, pages, posts, or stories above to build your site menu." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e8e4df" }}>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Order</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Label</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Type</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Destination</th>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "#7c6f64", fontWeight: 500, fontSize: "0.8rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f0ece6" }}>
                <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                  <button onClick={() => move(i, -1)} disabled={i === 0 || deleting} style={arrowBtnStyle}>↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === sorted.length - 1 || deleting} style={arrowBtnStyle}>↓</button>
                </td>
                <td style={{ padding: "0.5rem" }}>{item.label}</td>
                <td style={{ padding: "0.5rem", color: "#999", fontSize: "0.85rem" }}>{item.type}</td>
                <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.85rem" }}>{item.destination}</td>
                <td style={{ padding: "0.5rem" }}>
                  <button onClick={() => setToDelete(item)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.label}"?`}
        body="This removes the item from the site menu."
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
