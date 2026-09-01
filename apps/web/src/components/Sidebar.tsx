"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, House, LayoutGrid, NotebookPen, PenLine, Search, Sun, Moon } from "lucide-react";
import { useSettings } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import type { NavigationItem, Site } from "@/lib/api";

interface SidebarProps {
  site: Site;
  navigation: NavigationItem[];
  downloads?: boolean;
}

function isActive(pathname: string, destination: string): boolean {
  if (destination === "/") return pathname === "/";
  return pathname.startsWith(destination);
}

export function Sidebar({ site, navigation }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const settings = useSettings();
  const { t } = useLanguage();

  async function onSearch(q: string) {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } finally {
      setSearching(false);
    }
  }

  const mainNav = navigation.filter((n) => n.type === "home" || n.type === "page");
  const contentNav = navigation.filter(
    (n) => n.type === "posts" || n.type === "stories" || n.type === "page"
  );

  return (
    <aside className="sidebar">
      <div>
        <Link href="/" className="site-identity">
          <span className="book-icon" aria-hidden="true">
            <BookOpen size={24} strokeWidth={1.6} />
          </span>
          <h1>{site.name}</h1>
        </Link>
        {site.description && (
          <p className="site-description">{site.description}</p>
        )}
      </div>

      <nav aria-label="Primary navigation">
        <ul className="nav-list">
          {mainNav.length > 0 ? (
            mainNav.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.destination || "/"}
                  className={`nav-link${isActive(pathname, item.destination || "/") ? " active" : ""}`}
                >
                  <span className="icon" aria-hidden="true">
                    {item.type === "home" ? <House size={18} strokeWidth={1.6} /> : <LayoutGrid size={18} strokeWidth={1.6} />}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))
          ) : (
            <>
              <li>
                <Link
                  href="/"
                  className={`nav-link${pathname === "/" ? " active" : ""}`}
                >
                    <span className="icon" aria-hidden="true">
                      <House size={18} strokeWidth={1.6} />
                    </span>
                    {t("home")}
                  </Link>
                </li>
              <li>
                <Link
                  href="/posts"
                  className={`nav-link${pathname.startsWith("/posts") ? " active" : ""}`}
                >
                  <span className="icon" aria-hidden="true">
                    <LayoutGrid size={18} strokeWidth={1.6} />
                  </span>
                  {t("blog")}
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div>
        <p className="sidebar-section-label">{t("content")}</p>
        <ul className="nav-list">
          {(contentNav.length > 0 ? contentNav : navigation).map(
            (item) => (
              <li key={item.id}>
                <Link
                  href={item.destination || "/"}
                  className={`nav-link${isActive(pathname, item.destination || "/") ? " active" : ""}`}
                >
                  <span className="icon" aria-hidden="true">
                    {item.type === "stories" ? <BookOpen size={18} strokeWidth={1.6} /> : item.type === "posts" ? <NotebookPen size={18} strokeWidth={1.6} /> : <PenLine size={18} strokeWidth={1.6} />}
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>

      <div>
        <p className="sidebar-section-label">{t("search")}</p>
        <div className="search-box">
          <span className="search-icon" aria-hidden="true">
            <Search size={15} strokeWidth={1.7} />
          </span>
          <input
            type="search"
            placeholder={t("search")}
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            aria-label={t("search")}
          />
        </div>
        {searching && <p className="sidebar-section-label">{t("searching")}</p>}
        {results.length > 0 && (
          <div className="search-results">
            {results.map((r) => (
              <Link
                key={r.type + r.slug}
                href={r.url}
                className="search-result"
              >
                <div className="r-title">{r.title}</div>
                <div className="r-meta">{r.type}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="reading-controls">
        <div>
          <p className="control-label">{t("theme")}</p>
          <div className="control-row">
            <button
              className={`small-btn${settings.theme === "light" ? " active" : ""}`}
              onClick={() => settings.setTheme("light")}
            >
              <Sun size={15} strokeWidth={1.7} /> {t("light")}
            </button>
            <button
              className={`small-btn${settings.theme === "dark" ? " active" : ""}`}
              onClick={() => settings.setTheme("dark")}
            >
              <Moon size={15} strokeWidth={1.7} /> {t("dark")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
