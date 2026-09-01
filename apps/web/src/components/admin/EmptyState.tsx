"use client";

import Link from "next/link";

export function EmptyState({
  title,
  hint,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  hint?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "#999", border: "1px dashed #e0dbd4", borderRadius: "12px" }}>
      <p style={{ fontSize: "1rem", fontWeight: 500, color: "#7c6f64", margin: "0 0 0.25rem" }}>{title}</p>
      {hint && <p style={{ fontSize: "0.85rem", margin: "0 0 1rem" }}>{hint}</p>}
      {ctaHref && (
        <Link
          href={ctaHref}
          style={{
            display: "inline-block",
            padding: "0.45rem 1rem",
            background: "#37352f",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "0.85rem",
          }}
        >
          {ctaLabel || "Create"}
        </Link>
      )}
    </div>
  );
}
