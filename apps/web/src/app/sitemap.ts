import { headers } from "next/headers";
import { fetchPublicSite, getHost } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const host = getHost(headers());
  const origin = host.startsWith("localhost") ? `http://${host}` : `https://${host}`;

  const [posts, pages, stories] = await Promise.all([
    fetchPublicSite(host, "/posts"),
    fetchPublicSite(host, "/pages"),
    fetchPublicSite(host, "/stories"),
  ]);

  const entries = [{ url: `${origin}/` }];

  (Array.isArray(posts) ? posts : []).forEach((p: any) => {
    entries.push({ url: `${origin}/posts/${p.slug}` });
  });
  (Array.isArray(pages) ? pages : []).forEach((p: any) => {
    entries.push({ url: `${origin}/pages/${p.slug}` });
  });
  (Array.isArray(stories) ? stories : []).forEach((s: any) => {
    entries.push({ url: `${origin}/stories/${s.slug}` });
  });

  return entries;
}
