import { extractStreamLink } from "@/lib/streamlib/extract";
import { WatchPlayer } from "@/components/WatchPlayer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchMetaDetails } from "@/lib/api";

interface WatchPageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
  searchParams: Promise<{
    season?: string;
    episode?: string;
  }>;
}

export default async function WatchPage({
  params,
  searchParams,
}: WatchPageProps) {
  const { type, id } = await params;
  const { season = "1", episode = "1" } = await searchParams;

  const [links, meta] = await Promise.all([
    extractStreamLink(id, type, parseInt(season), parseInt(episode)),
    fetchMetaDetails(type, id),
  ]);

  const streamLink = links ?? null;

  // Construct a unique ID for tracking progress
  // For movies: id
  // For series: id-sX-eY
  const contentId = type === "movie" ? id : `${id}-s${season}-e${episode}`;

  const metaInfo = {
    metaId: id,
    type,
    title: meta?.name || "Unknown Title",
    poster: meta?.poster || "",
    season: type === "series" ? parseInt(season) : undefined,
    episode: type === "series" ? parseInt(episode) : undefined,
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="p-4 absolute top-0 left-0 z-10">
        <Link href={`/${type}/${id}`}>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {streamLink ? (
          <div className="w-full h-full max-w-6xl aspect-video bg-black">
            <WatchPlayer
              id="player"
              file={streamLink}
              contentId={contentId}
              meta={metaInfo}
            />
          </div>
        ) : (
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-2">Stream not available</h1>
            <p className="text-gray-400">
              Could not find a stream for this content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
