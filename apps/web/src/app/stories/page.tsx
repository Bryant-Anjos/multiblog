import { headers } from "next/headers";
import { Sparkles } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { StoryCard } from "@/components/StoryCard";
import { fetchPublicSite, getHost, resolveSiteLang } from "@/lib/api";
import { translate, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const host = getHost(headers());
  const [stories, lang] = await Promise.all([
    fetchPublicSite(host, "/stories"),
    resolveSiteLang(host),
  ]);
  const t = (k: Parameters<typeof translate>[1]) => translate(lang as Lang | undefined, k);

  const mainStories = Array.isArray(stories)
    ? stories.filter((s: any) => !s.parent_story_id)
    : [];
  const spinoffs = Array.isArray(stories)
    ? stories.filter((s: any) => s.parent_story_id)
    : [];

  return (
    <SiteShell>
      <div className="page">
        <div className="section-header">
          <span className="section-title">{t("stories")}</span>
        </div>

        {mainStories.length > 0 && (
          <div className="story-grid">
            {mainStories.map((story: any) => (
              <StoryCard
                key={story.id}
                story={story}
                lang={lang}
                fallbackLabel={t("mainStory")}
              />
            ))}
          </div>
        )}

        {spinoffs.length > 0 && (
          <>
            <div className="section-header" style={{ marginTop: "1rem" }}>
              <span className="section-title">{t("spinoffs")}</span>
            </div>
            <div className="story-grid">
              {spinoffs.map((story: any) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  lang={lang}
                  icon={Sparkles}
                  fallbackLabel={t("related")}
                />
              ))}
            </div>
          </>
        )}

        {mainStories.length === 0 && spinoffs.length === 0 && (
          <div className="empty">{t("noStories")}</div>
        )}
      </div>
    </SiteShell>
  );
}
