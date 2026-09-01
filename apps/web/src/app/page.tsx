import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, PenLine } from "lucide-react";
import { Shell } from "@/components/Shell";
import { StoryCard } from "@/components/StoryCard";
import {
  fetchPublicSite,
  getHost,
  resolveSite,
} from "@/lib/api";
import { formatDate, readingTime } from "@/lib/format";
import { translate, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const h = headers();
  const host = getHost(h);

  const siteData = await resolveSite(host);

  if (!siteData) {
    return <NoSite host={host} />;
  }

  const lang = siteData.site?.language as Lang | undefined;
  const t = (k: Parameters<typeof translate>[1]) => translate(lang, k);

  const [posts, stories, pages] = await Promise.all([
    fetchPublicSite(host, "/posts"),
    fetchPublicSite(host, "/stories"),
    fetchPublicSite(host, "/pages"),
  ]);

  const featured = Array.isArray(posts) ? posts[0] : null;
  const recentPosts = Array.isArray(posts) ? posts.slice(0, 5) : [];
  const topStories = Array.isArray(stories)
    ? stories.filter((s: any) => !s.parent_story_id).slice(0, 3)
    : [];
  const topPages = Array.isArray(pages) ? pages.slice(0, 4) : [];

  return (
    <Shell
      site={siteData.site}
      navigation={siteData.navigation || []}
    >
      <div className="page">
        {featured && (
          <section aria-labelledby="featured-heading">
            <div className="section-header">
              <span id="featured-heading" className="section-title">
                {t("featured")}
              </span>
            </div>
            <article className="featured">
              <div className="featured-content">
                {featured.status === "PUBLISHED" && (
                  <p className="featured-meta">
                    {t("diary")} · {formatDate(featured.published_at)}
                  </p>
                )}
                <h2 className="featured-title">{featured.title}</h2>
                {featured.excerpt && (
                  <p className="featured-desc">{featured.excerpt}</p>
                )}
                <p className="featured-meta">
                  {readingTime(featured.content)} {t("minRead")}
                </p>
                <Link href={`/posts/${featured.slug}`} className="btn">
                  {t("readArticle")} <ArrowRight size={16} strokeWidth={1.8} />
                </Link>
              </div>
              <div className="featured-image" aria-hidden="true">
                <BookOpen size={120} strokeWidth={0.5} style={{ opacity: 0.25 }} />
              </div>
            </article>
          </section>
        )}

        {recentPosts.length > 0 && (
          <section aria-labelledby="recent-heading" style={{ marginBottom: "3rem" }}>
            <div className="section-header">
              <span id="recent-heading" className="section-title">
                {t("recentPosts")}
              </span>
              {recentPosts.length > 5 && (
                <Link href="/posts" className="section-viewall">
                  {t("viewAll")} <ArrowRight size={15} strokeWidth={1.8} />
                </Link>
              )}
            </div>
            <div className="post-list">
              {recentPosts.map((post: any) => (
                <Link key={post.id} href={`/posts/${post.slug}`} className="post-row">
                  <span className="post-icon" aria-hidden="true">
                    <FileText size={22} strokeWidth={1.4} />
                  </span>
                  <div className="post-info">
                    <h3 className="post-title">{post.title}</h3>
                    {post.excerpt && (
                      <p className="post-excerpt">{post.excerpt}</p>
                    )}
                    <p className="post-meta">
                      {formatDate(post.published_at)} ·{" "}
                      {readingTime(post.content)} {t("minRead")}
                    </p>
                  </div>
                  <span className="post-arrow" aria-hidden="true">
                    <ArrowRight size={18} strokeWidth={1.6} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {topStories.length > 0 && (
          <section aria-labelledby="stories-heading" style={{ marginBottom: "3rem" }}>
            <div className="section-header">
              <span id="stories-heading" className="section-title">
                {t("stories")}
              </span>
              <Link href="/stories" className="section-viewall">
                {t("viewAll")} <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
            </div>
            <div className="story-grid">
              {topStories.map((story: any) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  lang={lang}
                  fallbackLabel={t("story")}
                />
              ))}
            </div>
          </section>
        )}

        {topPages.length > 0 && (
          <section aria-labelledby="pages-heading">
            <div className="section-header">
              <span id="pages-heading" className="section-title">
                {t("pages")}
              </span>
              <Link href="/pages" className="section-viewall">
                {t("viewAll")} <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
            </div>
            <div className="page-grid">
              {topPages.map((page: any) => (
                <Link key={page.id} href={`/pages/${page.slug}`} className="page-card">
                  <div className="icon" aria-hidden="true">
                    <PenLine size={24} strokeWidth={1.4} />
                  </div>
                  <h3>{page.title}</h3>
                  <p>{page.content.slice(0, 90)}...</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Shell>
  );
}

function NoSite({ host }: { host: string }) {
  return (
    <div className="app">
      <div className="main">
        <div className="empty">
          <p>No site is configured for hostname</p>
          <p style={{ fontStyle: "normal" }}>
            <strong>{host}</strong>
          </p>
          <p>Please configure a domain for this hostname in the admin area.</p>
        </div>
      </div>
    </div>
  );
}
