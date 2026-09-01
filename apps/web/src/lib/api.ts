const API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function resolveSite(host: string) {
  const res = await fetch(`${API_URL}/api/public/site`, {
    headers: { "X-Site-Host": host },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function resolveSiteLang(host: string): Promise<string | undefined> {
  const data = await resolveSite(host);
  return data?.site?.language;
}

export async function fetchPublicSite(host: string, path: string) {
  const res = await fetch(`${API_URL}/api/public${path}`, {
    headers: { "X-Site-Host": host },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export function getHost(headersOrNil?: { get(name: string): string | null }): string {
  if (headersOrNil) {
    const host = headersOrNil.get("host");
    if (host) return host;
  }
  return "localhost:3000";
}

export type Site = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  language?: string;
};

export type NavigationItem = {
  id: string;
  site_id: string;
  label: string;
  type: string;
  destination: string;
  position: number;
  is_visible: boolean;
};

export type Post = {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: "DRAFT" | "PUBLISHED";
  published_at?: string;
  created_at: string;
};

export type Page = {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  created_at: string;
};

export type Story = {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  description?: string;
  parent_story_id?: string;
  relationship_type?: string;
  group_count?: number;
  chapter_count?: number;
  published_count?: number;
};

export type Chapter = {
  id: string;
  story_id: string;
  group_id?: string;
  title: string;
  slug: string;
  content: string;
  position: number;
  status: "DRAFT" | "PUBLISHED";
};

export type StoryGroup = {
  id: string;
  story_id: string;
  title: string;
  slug: string;
  position: number;
};
