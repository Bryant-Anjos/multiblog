"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useSettings } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { ReadingSettingsPanel } from "./ReadingSettings";

interface TopBarProps {
  onMenuClick: () => void;
  siteName: string;
}

export function TopBar({ onMenuClick, siteName }: TopBarProps) {
  const settings = useSettings();
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="menu-btn"
            onClick={onMenuClick}
            aria-label={t("openNavigation")}
          >
            ☰
          </button>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}>
            {siteName}
          </span>
        </div>
        <div className="topbar-actions">
          <button
            className="small-btn"
            onClick={() => settings.setTheme(settings.theme === "dark" ? "light" : "dark")}
            aria-label={t("toggleTheme")}
          >
            {settings.theme === "dark" ? <Sun size={16} strokeWidth={1.7} /> : <Moon size={16} strokeWidth={1.7} />}
          </button>
          <button
            className="small-btn"
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Reading settings"
            aria-expanded={showSettings}
          >
            Aa
          </button>
        </div>
      </header>
      {showSettings && <ReadingSettingsPanel />}
    </>
  );
}
