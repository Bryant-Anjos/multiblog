import withPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: "public",
  // Precaches only the built static assets (_next/static, icons, the
  // manifest) — never a runtime-caching rule for anything else. This app
  // renders every page server-side per request (real blog content, and the
  // admin's own drafts behind a password), so letting the service worker
  // cache rendered HTML or API responses would mean a reader — or, on the
  // admin domain, the one account with the password — looking at content
  // that quietly stopped being current. Offline gets the app shell (the
  // page loads, JS runs), never a stale page pretending to be live.
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  // false so `/` is never PREcached (baked in at build time, served without
  // even trying the network) — it renders different real content per Host
  // (a different blog per subdomain) and per session. It still ends up
  // runtime-cached: this plugin unconditionally registers `/` as a
  // NetworkFirst route regardless of this flag (confirmed by reading the
  // built sw.js, not assumed from the docs) — network is tried first every
  // time, the cached copy is only a fallback for genuinely offline, which
  // is what makes an installed PWA show SOMETHING instead of a blank error
  // the first time it's opened without a connection. That is the one
  // caching rule this app has, by design, not an oversight.
  reloadOnOnline: true,
  // Disabled in dev on purpose, unlike cv-editor's Vite setup: Next's own
  // dev server (Fast Refresh) and a live service worker fight over which
  // one's cache is authoritative, which is confusing in a way Vite's dev
  // server does not have the same problem with. The build/precache list
  // still gets exercised for real every time `next build` runs (verified
  // below), so this is not "PWA behavior goes untested."
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    // Replaces, not extends, this plugin's own default runtime-caching
    // rules (fonts/images/scripts with stale-while-revalidate,
    // Google-Fonts-specific caching, etc.) — empty means NOTHING beyond the
    // precached build assets is ever runtime-cached. Every page here is
    // server-rendered per request (real blog content on one domain, the
    // one admin account's own drafts on another), so a stale-while-
    // revalidate rule on pages would mean a reader or the admin looking at
    // content that quietly stopped being current.
    runtimeCaching: [],
  },
})(nextConfig);
