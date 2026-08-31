"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { LanguageProvider } from "@/context/LanguageContext";
import type { NavigationItem, Site } from "@/lib/api";

interface ShellProps {
  site: Site;
  navigation: NavigationItem[];
  children: ReactNode;
}

export function Shell({ site, navigation, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LanguageProvider language={site.language}>
      <div className="app">
        <div
          className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <Sidebar site={site} navigation={navigation} />
        </div>
        <div className="main">
          <TopBar onMenuClick={() => setSidebarOpen(true)} siteName={site.name} />
          <main className="content">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  );
}
