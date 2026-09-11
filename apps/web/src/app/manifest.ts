import type { MetadataRoute } from "next";

// Static, not per-site: this platform can host several blogs on several
// subdomains (each with its own name in `sites`), but the request that
// asked for a PWA named this exact domain — multiblog.briam.cloud, the
// admin — not "every blog this platform will ever host." A manifest that
// reads the current Host and looked up a site's own name would be a real,
// separately-scoped feature (each blog becoming its own installable app,
// with its own identity) — worth doing later if wanted, not assumed here.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Multiblog",
    short_name: "Multiblog",
    description: "A personal multi-site publishing platform.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#4a443c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
