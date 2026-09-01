"use client";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  busy = false,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "1.5rem", maxWidth: "420px", width: "90%", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#37352f", fontFamily: "'Lora', Georgia, serif", margin: "0 0 0.5rem" }}>{title}</h3>
        {body && <p style={{ fontSize: "0.85rem", color: "#7c6f64", margin: "0 0 1.25rem" }}>{body}</p>}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={busy}
            style={{ padding: "0.4rem 0.9rem", background: "#fff", color: "#37352f", border: "1px solid #d9d5ce", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            style={{ padding: "0.4rem 0.9rem", background: "#c0392b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
          >
            {busy ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
