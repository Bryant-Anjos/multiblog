import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { Prose } from "@/components/Prose";
import { fetchPublicSite, getHost, resolveSiteLang } from "@/lib/api";
import { formatDate, readingTime } from "@/lib/format";
import { translate, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const host = getHost(headers());
  const [post, lang] = await Promise.all([
    fetchPublicSite(host, `/posts/${params.slug}`),
    resolveSiteLang(host),
  ]);
  const t = (k: Parameters<typeof translate>[1]) => translate(lang as Lang | undefined, k);

  if (!post) {
    notFound();
  }

  const posts = (await fetchPublicSite(host, "/posts")) || [];
  const index = posts.findIndex((p: any) => p.slug === post.slug);
  const prev = index > 0 ? posts[index - 1] : null;
  const next = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;

  return (
    <SiteShell>
      <div className="reading-container">
        <article className="reading">
          <header>
            {post.published_at && (
              <p className="reading-meta">
                {t("diary")} · {formatDate(post.published_at)} ·{" "}
                {readingTime(post.content)} {t("minRead")}
              </p>
            )}
            <h1>{post.title}</h1>
            <hr className="reading-divider" />
          </header>
          <Prose content={post.content} />
        </article>

        <nav className="bottom-nav" aria-label={t("previous")}>
          {prev ? (
            <Link href={`/posts/${prev.slug}`} className="bottom-nav-item">
              <span className="label">← {t("previous")}</span>
              <span className="title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/posts/${next.slug}`} className="bottom-nav-item next">
              <span className="label">{t("next")} →</span>
              <span className="title">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </SiteShell>
  );
}
