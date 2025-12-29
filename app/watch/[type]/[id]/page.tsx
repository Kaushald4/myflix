import { extractStreamLink } from "@/lib/streamlib/extract";
import { WatchPlayer } from "@/components/WatchPlayer";
import { ArrowLeft, Info, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchMetaDetails } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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
    background: meta?.background || meta?.poster || "",
    season: type === "series" ? parseInt(season) : undefined,
    episode: type === "series" ? parseInt(episode) : undefined,
    description: meta?.description || "",
    year: meta?.year || "",
    runtime: meta?.runtime || "",
    imdbRating: meta?.imdbRating || "",
    genre: meta?.genre || [],
    imdbId: meta?.imdb_id || "",
  };

  const episodeInfo =
    type === "series" && meta?.videos
      ? meta.videos.find(
          (v) =>
            v.season === parseInt(season) && v.episode === parseInt(episode)
        )
      : null;

  const episodeTitle = episodeInfo?.name || `Episode ${episode}`;
  const episodeDescription =
    episodeInfo?.overview || episodeInfo?.description || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Player Section */}
      <div className="relative w-full bg-black">
        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 dark:from-black/80 to-transparent">
          <Link href={`/${type}/${id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/10 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/10"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Player Container */}
        <div className="w-full aspect-video md:aspect-[21/9] bg-black">
          {streamLink ? (
            <WatchPlayer
              id="player"
              file={streamLink}
              contentId={contentId}
              meta={metaInfo}
              videos={[]}
              // videos={meta?.videos || []}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white dark:text-white">
              <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Stream not available</h1>
              <p className="text-gray-400 dark:text-gray-400 text-center max-w-md">
                Could not find a stream for this content. Please try again later
                or select a different episode.
              </p>
              <Link href={`/${type}/${id}`} className="mt-6">
                <Button
                  variant="outline"
                  className="border-white/20 dark:border-white/20 text-white dark:text-white dark:hover:bg-white/10 bg-primary/20 hover:text-white hover:bg-primary/50"
                >
                  Back to Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content Info Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="hidden md:block relative w-32 h-48 shrink-0 rounded-md overflow-hidden shadow-lg">
            <Image
              src={metaInfo.poster}
              alt={metaInfo.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {metaInfo.title}
            </h1>

            {type === "series" && (
              <p className="text-lg text-muted-foreground mb-4">
                S{season} E{episode} • {episodeTitle}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              {metaInfo.imdbRating && (
                <div className="flex items-center gap-1 text-green-400 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{metaInfo.imdbRating} Match</span>
                </div>
              )}
              {metaInfo.year && (
                <span className="text-muted-foreground">{metaInfo.year}</span>
              )}
              {metaInfo.runtime && type === "movie" && (
                <span className="text-muted-foreground">
                  {metaInfo.runtime}
                </span>
              )}
              {episodeInfo?.released && type === "series" && (
                <span className="text-muted-foreground">
                  {new Date(episodeInfo.released).toLocaleDateString()}
                </span>
              )}
              {metaInfo.genre?.slice(0, 2).map((g) => (
                <Badge
                  key={g}
                  variant="secondary"
                  className="bg-white/10 dark:bg-white/10 text-foreground border-white/10 dark:border-white/10 text-xs"
                >
                  {g}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm md:text-base line-clamp-3 mb-4">
              {type === "series" && episodeDescription
                ? episodeDescription
                : metaInfo.description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href={`/${type}/${id}`}>
                <Button
                  variant="outline"
                  className="border-white/20 dark:border-white/20 bg-white/5 dark:bg-white/5 text-foreground hover:bg-white/10 dark:hover:bg-white/10"
                >
                  <Info className="w-4 h-4 mr-2" />
                  More Info
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section for Series */}
      {type === "series" && meta?.videos && meta.videos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 border-t border-white/10 dark:border-white/10">
          <h2 className="text-xl font-bold text-foreground mb-4">Episodes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {meta.videos
              .filter((v) => v.season === parseInt(season))
              .sort((a, b) => a.episode - b.episode)
              .map((ep) => {
                const isCurrentEpisode = ep.episode === parseInt(episode);
                const episodeId = `${id}-s${season}-e${ep.episode}`;
                const href = `/watch/${type}/${id}?season=${season}&episode=${ep.episode}`;

                return (
                  <Link
                    key={ep.id || episodeId}
                    href={href}
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${
                      isCurrentEpisode
                        ? "bg-white/10 dark:bg-white/10 border border-white/20 dark:border-white/20"
                        : "bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-24 aspect-video rounded overflow-hidden bg-black/50 dark:bg-black/50 shrink-0">
                      {ep.thumbnail ? (
                        <Image
                          src={ep.thumbnail}
                          alt={ep.name || `Episode ${ep.episode}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <span className="text-xs">{ep.episode}</span>
                        </div>
                      )}
                      {isCurrentEpisode && (
                        <div className="absolute inset-0 bg-black/50 dark:bg-black/50 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-white/20 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {ep.episode}.
                        </span>
                        <span className="text-sm text-muted-foreground truncate">
                          {ep.name || `Episode ${ep.episode}`}
                        </span>
                      </div>
                      {ep.released && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(ep.released).toLocaleDateString()}
                        </p>
                      )}
                      {isCurrentEpisode && (
                        <Badge
                          variant="secondary"
                          className="mt-2 bg-primary/20 text-primary border-primary/20 text-xs"
                        >
                          Playing
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
