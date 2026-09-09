import type { Metadata } from "next";
import "./admin.css";

// Without this, Next statically optimizes any admin page that reads nothing
// dynamic (the login screen is exactly that) and ships it with a year-long
// `s-maxage` — the shared edge in front of this app then caches and REUSES
// that response for every visitor. Harmless for a static login form, but the
// same mechanism would serve one admin's stale session state, a just-changed
// password's old form, or worse to someone else, the moment a page here
// stops being static by accident. Setting `dynamic` on a LAYOUT forces every
// page nested under it into dynamic rendering too (Next's own documented
// behaviour), so this one line covers the whole admin panel — no need to
// repeat it per page, and no new admin page can silently opt back into the
// year-long cache by forgetting to add it.
//
// Found live, 2026-09-10: a stale cached admin page kept serving the
// pre-fix login form after a real code fix had already shipped and the
// container had already restarted — see this commit's own message for the
// fuller story.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · Multiblog",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-app">{children}</div>;
}
