"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { clearToken, getToken } from "@/lib/admin";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin");
    }
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/admin");
  }

  const links = [
    { href: "/admin/sites", label: "Sites" },
    { href: "/admin/posts", label: "Posts" },
    { href: "/admin/pages", label: "Pages" },
    { href: "/admin/stories", label: "Stories" },
  ];

  return (
    <div className="admin-layout">
      <nav className="admin-nav" aria-label="Admin navigation">
        <p className="nav-title">Multiblog</p>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              background:
                pathname === l.href || pathname.startsWith(l.href + "/")
                  ? "var(--bg-elevated, #fff)"
                  : undefined,
              color: pathname.startsWith(l.href) ? "var(--text)" : undefined,
              fontWeight: pathname.startsWith(l.href) ? 500 : undefined,
            }}
          >
            {l.label}
          </Link>
        ))}
        <button onClick={logout} style={{ marginTop: "auto" }}>
          Sign out
        </button>
      </nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}
