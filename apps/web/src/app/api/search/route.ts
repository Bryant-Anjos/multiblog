import { NextRequest, NextResponse } from "next/server";
import { fetchPublicSite, getHost } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const host = getHost(req.headers as any);
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";

  if (!q) {
    return NextResponse.json([]);
  }

  const [posts, pages, stories] = await Promise.all([
    fetchPublicSite(host, "/posts"),
    fetchPublicSite(host, "/pages"),
    fetchPublicSite(host, "/stories"),
  ]);

  const results: any[] = [];

  (Array.isArray(posts) ? posts : []).forEach((p: any) => {
    if (p.title.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q)) {
      results.push({ title: p.title, slug: p.slug, type: "post", url: `/posts/${p.slug}` });
    }
  });

  (Array.isArray(pages) ? pages : []).forEach((p: any) => {
    if (p.title.toLowerCase().includes(q)) {
      results.push({ title: p.title, slug: p.slug, type: "page", url: `/pages/${p.slug}` });
    }
  });

  (Array.isArray(stories) ? stories : []).forEach((s: any) => {
    if (s.title.toLowerCase().includes(q)) {
      results.push({ title: s.title, slug: s.slug, type: "story", url: `/stories/${s.slug}` });
    }
  });

  return NextResponse.json(results.slice(0, 8));
}
