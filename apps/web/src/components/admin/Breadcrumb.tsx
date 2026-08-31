"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length < 2 || segments[0] !== "admin") return null;

  const crumbs: { label: string; href: string }[] = [
    { label: "Admin", href: "/admin" },
  ];

  let href = "";
  for (let i = 0; i < segments.length; i++) {
    href += "/" + segments[i];
    if (i === 0) continue;

    const segment = segments[i];
    const label =
      segment === "sites"
        ? "Sites"
        : segment === "posts"
          ? "Posts"
          : segment === "pages"
            ? "Pages"
            : segment === "stories"
              ? "Stories"
              : segment === "navigation"
                ? "Navigation"
                : segment === "settings"
                  ? "Settings"
                  : segment === "new"
                    ? "New"
                    : null;

    if (label) {
      crumbs.push({ label, href });
    }
  }

  return (
    <nav style={{ fontSize: "0.85rem", color: "#7c6f64", marginBottom: "1.5rem" }}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href}>
          {i > 0 && <span style={{ margin: "0 0.4rem" }}>/</span>}
          {i < crumbs.length - 1 ? (
            <Link href={crumb.href} style={{ color: "#7c6f64", textDecoration: "none" }}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ color: "#37352f", fontWeight: 500 }}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
