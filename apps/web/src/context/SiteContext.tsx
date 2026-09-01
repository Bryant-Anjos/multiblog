"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useParams } from "next/navigation";

interface Site {
  id: string;
  name: string;
  slug: string;
  language: string;
  created_at: string;
}

interface SiteContextValue {
  site: Site | null;
  siteId: string | null;
  loading: boolean;
  error: string | null;
}

const SiteContext = createContext<SiteContextValue>({
  site: null,
  siteId: null,
  loading: true,
  error: null,
});

export function useSite() {
  return useContext(SiteContext);
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const siteId = (params?.id as string) || null;
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/sites/${siteId}`, {
      headers: {
        ...(localStorage.getItem("admin_token") ? { Authorization: `Bearer ${localStorage.getItem("admin_token")}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Site not found");
        return res.json();
      })
      .then((data) => setSite(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [siteId]);

  return (
    <SiteContext.Provider value={{ site, siteId, loading, error }}>
      {children}
    </SiteContext.Provider>
  );
}
