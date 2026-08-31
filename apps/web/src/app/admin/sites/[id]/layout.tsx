"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteProvider } from "@/context/SiteContext";
import SiteSidebar from "@/components/admin/SiteSidebar";
import { getToken } from "@/lib/admin";

export default function SiteLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.replace("/admin");
  }, [router]);

  return (
    <SiteProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <SiteSidebar />
        <main style={{ flex: 1, padding: "2rem", maxWidth: "960px" }}>
          {children}
        </main>
      </div>
    </SiteProvider>
  );
}
