import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { Prose } from "@/components/Prose";
import { fetchPublicSite, getHost } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PageDetail({
  params,
}: {
  params: { slug: string };
}) {
  const host = getHost(headers());
  const page = await fetchPublicSite(host, `/pages/${params.slug}`);

  if (!page) {
    notFound();
  }

  return (
    <SiteShell>
      <div className="reading-container">
        <article className="reading">
          <h1>{page.title}</h1>
          <hr className="reading-divider" />
          <Prose content={page.content} />
        </article>
      </div>
    </SiteShell>
  );
}
