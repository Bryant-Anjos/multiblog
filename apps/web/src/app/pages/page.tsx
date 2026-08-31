import { headers } from "next/headers";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { fetchPublicSite, getHost, resolveSiteLang } from "@/lib/api";
import { translate, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const host = getHost(headers());
  const [pages, lang] = await Promise.all([
    fetchPublicSite(host, "/pages"),
    resolveSiteLang(host),
  ]);
  const t = (k: Parameters<typeof translate>[1]) => translate(lang as Lang | undefined, k);

  return (
    <SiteShell>
      <div className="page">
        <div className="section-header">
          <span className="section-title">{t("pages")}</span>
        </div>
        {Array.isArray(pages) && pages.length > 0 ? (
          <div className="page-grid">
            {pages.map((page: any) => (
              <Link key={page.id} href={`/pages/${page.slug}`} className="page-card">
                <div className="icon" aria-hidden="true">
                  ✎
                </div>
                <h3>{page.title}</h3>
                <p>{page.content.slice(0, 120)}...</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">{t("noPages")}</div>
        )}
      </div>
    </SiteShell>
  );
}
