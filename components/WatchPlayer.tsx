"use client";

import Player from "@/components/Player";
import { useWatchHistoryStore } from "@/store/useWatchHistoryStore";
import { useCallback } from "react";

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
  };
}

export function WatchPlayer({ id, file, contentId, meta }: WatchPlayerProps) {
  const updateProgress = useWatchHistoryStore((state) => state.updateProgress);
  const getProgress = useWatchHistoryStore((state) => state.getProgress);
  const startTime = getProgress(contentId);

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
    />
  );
}
