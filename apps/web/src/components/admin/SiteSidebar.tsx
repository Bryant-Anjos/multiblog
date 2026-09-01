"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSite } from "@/context/SiteContext";

const SITE_NAV = [
  { label: "Painel", segment: "" },
  { label: "Posts", segment: "posts" },
  { label: "Páginas", segment: "pages" },
  { label: "Histórias", segment: "stories" },
  { label: "Menu", segment: "navigation" },
  { label: "Configurações", segment: "settings" },
];

export default function SiteSidebar() {
  const pathname = usePathname();
  const { site, siteId } = useSite();
  const segments = pathname.split("/").filter(Boolean);
  const currentSiteId = siteId || "";
  const siteIdx = currentSiteId ? segments.indexOf(currentSiteId) : -1;
  const activeSegment = siteIdx >= 0 ? segments.slice(siteIdx + 1).join("/") : "";

  return (
    <nav
      style={{
        width: "200px",
        background: "#faf7f2",
        borderRight: "1px solid #e8e4df",
        padding: "1.5rem 0",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "0 1rem 1rem", borderBottom: "1px solid #e8e4df" }}>
        <Link
          href="/admin/sites"
          style={{
            fontSize: "0.75rem",
            color: "#7c6f64",
            textDecoration: "none",
          }}
        >
          ← Todos os sites
        </Link>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#37352f",
            marginTop: "0.5rem",
            margin: "0.5rem 0 0",
            fontFamily: "'Lora', Georgia, serif",
          }}
        >
          {site?.name || "..."}
        </h3>
      </div>
      <ul style={{ listStyle: "none", padding: "1rem 0", margin: 0 }}>
        {SITE_NAV.map((item) => {
          const href = `/admin/sites/${currentSiteId}/${item.segment}`.replace(/\/+$/, "");
          const isActive = item.segment === "" ? activeSegment === "" : activeSegment.startsWith(item.segment);
          return (
            <li key={item.segment}>
              <Link
                href={href}
                style={{
                  display: "block",
                  padding: "0.5rem 1rem",
                  color: isActive ? "#37352f" : "#7c6f64",
                  textDecoration: "none",
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? "#eee8e0" : "transparent",
                  borderLeft: isActive ? "3px solid #d4a373" : "3px solid transparent",
                  fontSize: "0.9rem",
                }}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
