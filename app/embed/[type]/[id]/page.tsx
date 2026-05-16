import { notFound } from "next/navigation";
import { getEmbedUrl } from "@/lib/nexstream/client";

interface EmbedPageProps {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

export default async function EmbedPage({ params, searchParams }: EmbedPageProps) {
  const { type, id } = await params;
  const { season, episode } = await searchParams;

  if (type !== "movie" && type !== "tv") notFound();

  const tmdbId = parseInt(id);
  if (isNaN(tmdbId)) notFound();

  const embedUrl = getEmbedUrl(
    type,
    tmdbId,
    season ? parseInt(season) : undefined,
    episode ? parseInt(episode) : undefined
  );

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        <iframe
          src={embedUrl}
          style={{ width: "100vw", height: "100vh", border: "none" }}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
        />
      </body>
    </html>
  );
}
