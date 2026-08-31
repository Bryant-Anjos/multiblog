import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { Prose } from "@/components/Prose";
import { fetchPublicSite, getHost, resolveSiteLang } from "@/lib/api";
import { translate, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; chapterSlug: string };
}) {
  const host = getHost(headers());
  const lang = await resolveSiteLang(host);
  const t = (k: Parameters<typeof translate>[1]) => translate(lang as Lang | undefined, k);

  const res = await fetchPublicSite(host, `/stories/${params.slug}`);

  if (!res) {
    notFound();
  }

  const { story, groups = [] } = res;
  let chapters: any[] = (await fetchPublicSite(
    host,
    `/stories/${params.slug}`
  ))?.chapters;

  const data = await fetchPublicSite(
    host,
    `/stories/${params.slug}/chapters/${params.chapterSlug}`
  );
  if (!data) {
    notFound();
  }

  const chapter = data.chapter;
  chapters = data.chapters || chapters || [];

  const group = chapter.group_id
    ? groups.find((g: any) => g.id === chapter.group_id)
    : null;

  const index = chapters.findIndex((c: any) => c.id === chapter.id);
  const published = chapters.filter((c: any) => c.status === "PUBLISHED");
  const prev = published.find((c: any) => c.position < chapter.position);
  const next = published.find((c: any) => c.position > chapter.position);

  return (
    <SiteShell>
      <div className="reading-container">
        <article className="reading">
          <header className="story-context">
            <p className="story-name">{story.title}</p>
            {group && <p className="story-group">{group.title}</p>}
            <p className="story-chapter-kicker">
              {t("chapterNumber")} {index + 1}
            </p>
            <h1>{chapter.title}</h1>
            <hr className="reading-divider" />
          </header>
          <Prose content={chapter.content} />
        </article>

        <nav className="bottom-nav" aria-label="Chapter navigation">
          {prev ? (
            <Link
              href={`/stories/${story.slug}/chapters/${prev.slug}`}
              className="bottom-nav-item"
            >
              <span className="label">← {t("previousChapter")}</span>
              <span className="title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              alignItems: "flex-end",
            }}
          >
            <Link
              href={`/stories/${story.slug}`}
              className="bottom-nav-item"
              style={{ gridColumn: "1 / -1", textAlign: "right" }}
            >
              <span className="label">{t("backToStory")}</span>
            </Link>
            {next && (
              <Link
                href={`/stories/${story.slug}/chapters/${next.slug}`}
                className="bottom-nav-item next"
              >
                <span className="label">{t("nextChapter")} →</span>
                <span className="title">{next.title}</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </SiteShell>
  );
}
