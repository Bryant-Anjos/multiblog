"use client";

import { useSettings } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export function ReadingSettingsPanel() {
  const settings = useSettings();
  const { t } = useLanguage();
  return (
    <div className="reading-settings-panel" role="dialog" aria-label={t("readingSettings")}>
      <p className="reading-settings-heading">{t("readingSettings")}</p>
      <div className="setting-group">
        <label className="setting-group-label">{t("fontSize")}</label>
        <div className="seg-control">
          {(["small", "medium", "large"] as const).map((s) => (
            <button
              key={s}
              className={settings.fontSize === s ? "active" : ""}
              onClick={() => settings.setFontSize(s)}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>
      <div className="setting-group">
        <label className="setting-group-label">{t("readingWidth")}</label>
        <div className="seg-control">
          {(["normal", "wide"] as const).map((w) => (
            <button
              key={w}
              className={settings.readingWidth === w ? "active" : ""}
              onClick={() => settings.setReadingWidth(w)}
            >
              {t(w)}
            </button>
          ))}
        </div>
      </div>
      <div className="setting-group">
        <label className="setting-group-label">{t("theme")}</label>
        <div className="seg-control">
          <button
            className={settings.theme === "light" ? "active" : ""}
            onClick={() => settings.setTheme("light")}
          >
            {t("light")}
          </button>
          <button
            className={settings.theme === "dark" ? "active" : ""}
            onClick={() => settings.setTheme("dark")}
          >
            {t("dark")}
          </button>
        </div>
      </div>
    </div>
  );
}
