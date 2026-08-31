import { headers } from "next/headers";
import type { ReactNode } from "react";
import { Shell } from "./Shell";
import { getHost, resolveSite } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function SiteShell({ children }: { children: ReactNode }) {
  const host = getHost(headers());
  const siteData = await resolveSite(host);

  if (!siteData) {
    return (
      <div className="app">
        <div className="main">
          <div className="empty">
            <p>No site is configured for hostname</p>
            <p style={{ fontStyle: "normal" }}>
              <strong>{host}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Shell site={siteData.site} navigation={siteData.navigation || []}>
      {children}
    </Shell>
  );
}
