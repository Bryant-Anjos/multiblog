"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { clearToken, getToken } from "@/lib/admin";

function isSiteScoped(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "admin" && segments[1] === "sites" && segments.length >= 3;
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.replace("/admin");
  }, [router]);

  const inSiteScope = isSiteScoped(pathname);
  const segments = pathname.split("/").filter(Boolean);
  const siteId = segments[1] === "sites" ? segments[2] : null;

  return (
    <div className="app">
      <aside className="sidebar">
        <nav>
          <ul>
            <li>
              <Link href="/admin/sites" className={pathname.startsWith("/admin/sites") && !inSiteScope ? "active" : ""}>
                Sites
              </Link>
            </li>
          </ul>
        </nav>
        <div style={{ marginTop: "auto", padding: "1rem 0", borderTop: "1px solid #eee" }}>
          {siteId && (
            <a
              href={`/sites/${segments[2]}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "0.5rem 1rem",
                color: "#d4a373",
                textDecoration: "none",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              ↗ View public site
            </a>
          )}
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/admin";
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "0.5rem 1rem",
              background: "none",
              border: "none",
              color: "#999",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "0.9rem",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="main" style={{ padding: "2rem", maxWidth: "960px" }}>{children}</main>
    </div>
  );
}
