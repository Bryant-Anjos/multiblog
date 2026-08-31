import { headers } from "next/headers";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { fetchPublicSite, getHost, resolveSiteLang } from "@/lib/api";
import { formatDate, readingTime } from "@/lib/format";
import { translate, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const host = getHost(headers());
  const [posts, lang] = await Promise.all([
    fetchPublicSite(host, "/posts"),
    resolveSiteLang(host),
  ]);
  const t = (k: Parameters<typeof translate>[1]) => translate(lang as Lang | undefined, k);

  return (
    <SiteShell>
      <div className="page">
        <div className="section-header">
          <span className="section-title">{t("blogPosts")}</span>
        </div>
        {Array.isArray(posts) && posts.length > 0 ? (
          <div className="post-list">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="post-row">
                <span className="post-icon" aria-hidden="true">
                  📄
                </span>
                <div className="post-info">
                  <h3 className="post-title">{post.title}</h3>
                  {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
                  <p className="post-meta">
                    {formatDate(post.published_at)} ·{" "}
                    {readingTime(post.content)} {t("minRead")}
                  </p>
                </div>
                <span className="post-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">{t("noPosts")}</div>
        )}
      </div>
    </SiteShell>
  );
}
