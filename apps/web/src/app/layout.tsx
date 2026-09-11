import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Multiblog",
    template: "%s · Multiblog",
  },
  description: "A personal multi-site publishing platform.",
  // The manifest file itself needs no link here — Next serves
  // src/app/manifest.ts at /manifest.webmanifest and injects the <link>
  // automatically just because that file exists.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Multiblog",
  },
};

// themeColor lives here, not in `metadata` above: Next.js 14 moved it (and
// viewport) into this separate export — leaving it in `metadata` still
// "works" but prints a deprecation warning on every build.
export const viewport: Viewport = {
  themeColor: "#4a443c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
