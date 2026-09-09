import { NextRequest, NextResponse } from "next/server";

// Makes ONE configured hostname behave as the admin panel's root, with no
// `/admin` ever showing in the URL — the "management" domain for this whole
// multi-tenant instance (multiblog.briam.cloud), as opposed to every other
// domain, which resolves a blog by Host (see app/page.tsx's `resolveSite`).
//
// A REWRITE, not a redirect: the browser's address bar and any link the user
// copies keep showing e.g. `multiblog.briam.cloud/sites/abc`, while Next.js
// actually serves `/admin/sites/abc` underneath. A redirect would instead
// change the visible URL to include `/admin` — the opposite of what this is
// for.
//
// ADMIN_HOSTNAME is unset by default, so this is inert everywhere else
// (local dev, a future second admin-style deployment would need its own
// value). Read as a plain server env var — middleware runs server-side, so
// it does not need the NEXT_PUBLIC_ prefix.
const ADMIN_HOSTNAME = process.env.ADMIN_HOSTNAME;

// Left untouched even on the admin host: `/admin/*` itself (already correct,
// rewriting it would prefix twice), Next.js internals, and the metadata
// routes (`app/robots.ts`/`app/sitemap.ts`) — those answer per-Host already
// and gain nothing from being admin content.
const PASSTHROUGH_PREFIXES = ["/admin", "/_next", "/api"];
const PASSTHROUGH_EXACT = new Set(["/robots.txt", "/sitemap.xml", "/favicon.ico"]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (!ADMIN_HOSTNAME || host !== ADMIN_HOSTNAME) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (
    PASSTHROUGH_EXACT.has(pathname) ||
    PASSTHROUGH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/admin${pathname}`;
  return NextResponse.rewrite(url);
}

// Excludes static assets and image optimization output at the matcher level
// too — redundant with the `/_next` prefix check above for `/_next/*`
// specifically, but this is what keeps the middleware from running (and
// reading headers) on every single asset request at all.
export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
