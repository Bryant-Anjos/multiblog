import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { fetchPublicSite, getHost, resolveSiteLang } from "@/lib/api";
import { translate, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function StoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const host = getHost(headers());
  const [data, lang] = await Promise.all([
    fetchPublicSite(host, `/stories/${params.slug}`),
    resolveSiteLang(host),
  ]);
  const t = (k: Parameters<typeof translate>[1]) => translate(lang as Lang | undefined, k);

  if (!data) {
    notFound();
  }

  const { story, groups = [], chapters = [] } = data;

  const ungrouped = chapters.filter((c: any) => !c.group_id);

  return (
    <SiteShell>
      <div className="reading-container">
        <header className="story-context">
          <p className="story-name">
            {story.parent_story_id
              ? `${story.relationship_type || t("relatedStory")}`
              : t("story")}
          </p>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", lineHeight: 1.2 }}>
            {story.title}
          </h1>
          {story.description && (
            <p
              style={{
                color: "var(--text-muted)",
                maxWidth: "34rem",
                margin: "0.75rem auto 0",
                lineHeight: 1.6,
              }}
            >
              {story.description}
            </p>
          )}
        </header>
        <hr className="reading-divider" />

        {groups.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            {groups.map((group: any) => {
              const groupChapters = chapters.filter(
                (c: any) => c.group_id === group.id
              );
              return (
                <div key={group.id} style={{ marginBottom: "1.5rem" }}>
                  <p
                    className="section-title"
                    style={{ marginBottom: "0.6rem", textTransform: "uppercase" }}
                  >
                    {group.title}
                  </p>
                  <ul className="post-list" style={{ listStyle: "none" }}>
                    {groupChapters.map((chapter: any, idx: number) => (
                      <li key={chapter.id}>
                        <Link
                          href={`/stories/${story.slug}/chapters/${chapter.slug}`}
                          className="post-row"
                        >
                          <span className="post-icon" aria-hidden="true">
                            {idx + 1}
                          </span>
                          <div className="post-info">
                            <span className="post-title" style={{ fontSize: "1rem" }}>
                              {chapter.title}
                            </span>
                          </div>
                          <span className="post-arrow" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {ungrouped.length > 0 && (
          <div>
            <p
              className="section-title"
              style={{ marginBottom: "0.6rem", textTransform: "uppercase" }}
            >
              {t("chapters")}
            </p>
            <ul className="post-list" style={{ listStyle: "none" }}>
              {ungrouped.map((chapter: any, idx: number) => (
                <li key={chapter.id}>
                  <Link
                    href={`/stories/${story.slug}/chapters/${chapter.slug}`}
                    className="post-row"
                  >
                    <span className="post-icon" aria-hidden="true">
                      {idx + 1}
                    </span>
                    <div className="post-info">
                      <span className="post-title" style={{ fontSize: "1rem" }}>
                        {chapter.title}
                      </span>
                    </div>
                    <span className="post-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
