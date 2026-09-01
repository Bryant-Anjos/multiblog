import Link from "next/link";
import { normalizeLang, translate, type TranslationKey } from "@/lib/i18n";

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    relationship_type?: string;
    chapter_count?: number;
    published_count?: number;
  };
  lang: string | undefined;
  icon?: string;
  fallbackLabel: string;
}

export function StoryCard({ story, lang, icon = "📖", fallbackLabel }: StoryCardProps) {
  const l = normalizeLang(lang);
  const t = (k: TranslationKey) => translate(l, k);
  const chapterCount = story.chapter_count || 0;
  const publishedCount = story.published_count || 0;
  const pct = chapterCount > 0 ? Math.round((publishedCount / chapterCount) * 100) : 0;

  return (
    <Link href={`/stories/${story.slug}`} className="story-card">
      <div className="story-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{story.title}</h3>
      {story.description && <p className="story-desc">{story.description}</p>}
      {chapterCount > 0 ? (
        <>
          <p className="story-stats">
            {chapterCount} {t("chaptersUnit")} · {publishedCount} {t("publishedOf")}
          </p>
          <div className="story-progress">
            <div className="story-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </>
      ) : (
        <p className="story-stats">{story.relationship_type || fallbackLabel}</p>
      )}
    </Link>
  );
}