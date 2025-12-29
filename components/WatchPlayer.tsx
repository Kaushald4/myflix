"use client";

import Player from "@/components/Player";
import { useWatchHistoryStore } from "@/store/useWatchHistoryStore";
import { useCallback, useEffect, useState } from "react";
import { Video } from "@/lib/api";

interface WatchPlayerProps {
  id: string;
  file: string;
  contentId: string;
  meta: {
    metaId: string;
    type: string;
    title: string;
    poster: string;
    background?: string;
    season?: number;
    episode?: number;
    imdbId?: string;
  };
  videos?: Video[];
}

export function WatchPlayer({
  id,
  file,
  contentId,
  meta,
  videos = [],
}: WatchPlayerProps) {
  const updateProgress = useWatchHistoryStore((state) => state.updateProgress);
  const getProgress = useWatchHistoryStore((state) => state.getProgress);
  const startTime = getProgress(contentId);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);

  // Fetch subtitles
  useEffect(() => {
    const fetchSubtitles = async () => {
      if (!meta.imdbId) return;

      try {
        const params = new URLSearchParams({
          imdbid: meta.imdbId,
          type: meta.type,
        });

        if (meta.type === "series" && meta.season && meta.episode) {
          params.append("season", meta.season.toString());
          params.append("episode", meta.episode.toString());
        }

        const response = await fetch(`/api/subtitles?${params.toString()}`);
        const data = await response.json();

        if (data.subtitleUrl) {
          setSubtitleUrl(data.subtitleUrl);
        }
      } catch (error) {
        console.error("Error fetching subtitles:", error);
      }
    };

    fetchSubtitles();
  }, [meta.imdbId, meta.type, meta.season, meta.episode]);

  const handleTimeUpdate = useCallback(
    (time: number) => {
      updateProgress(contentId, time, meta);
    },
    [contentId, updateProgress, meta]
  );

  const playerTitle =
    meta.type === "series" && meta.season && meta.episode
      ? `${meta.title} - S${meta.season} E${meta.episode}`
      : meta.title;

  return (
    <Player
      id={id}
      file={file}
      onTimeUpdate={handleTimeUpdate}
      startTime={startTime}
      title={playerTitle}
      subtitle={subtitleUrl}
      videos={meta.type === "series" ? videos : undefined}
      currentSeason={meta.season}
      currentEpisode={meta.episode}
      metaId={meta.metaId}
    />
  );
}
