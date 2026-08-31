import { headers } from "next/headers";
import { getHost } from "@/lib/api";

export const dynamic = "force-dynamic";

export default function robots() {
  const host = getHost(headers());
  const origin = host.startsWith("localhost") ? `http://${host}` : `https://${host}`;
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
