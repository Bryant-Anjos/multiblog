"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
type FontSize = "small" | "medium" | "large";

type Settings = {
  theme: Theme;
  fontSize: FontSize;
  readingWidth: "normal" | "wide";
  setTheme: (t: Theme) => void;
  setFontSize: (s: FontSize) => void;
  setReadingWidth: (w: "normal" | "wide") => void;
};

const SettingsContext = createContext<Settings | null>(null);

const FONT_SIZES: Record<FontSize, number> = {
  small: 1.0,
  medium: 1.15,
  large: 1.3,
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");
  const [readingWidth, setReadingWidthState] = useState<"normal" | "wide">(
    "normal"
  );

  useEffect(() => {
    const saved = localStorage.getItem("settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setThemeState(parsed.theme);
        if (parsed.fontSize) setFontSizeState(parsed.fontSize);
        if (parsed.readingWidth) setReadingWidthState(parsed.readingWidth);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.setProperty(
      "--reading-body-size",
      `${FONT_SIZES[fontSize]}rem`
    );
    document.documentElement.style.setProperty(
      "--reading-width",
      readingWidth === "wide" ? "44rem" : "36rem"
    );
    localStorage.setItem("settings", JSON.stringify({ theme, fontSize, readingWidth }));
  }, [theme, fontSize, readingWidth]);

  const value: Settings = {
    theme,
    fontSize,
    readingWidth,
    setTheme: setThemeState,
    setFontSize: setFontSizeState,
    setReadingWidth: setReadingWidthState,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within ThemeProvider");
  return ctx;
}
