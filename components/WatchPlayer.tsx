"use client";

import Player from "@/components/Player";
import { useWatchHistoryStore } from "@/store/useWatchHistoryStore";
import { useCallback, useEffect, useState } from "react";

interface WatchPlayerProps {
  id: string;
  file: string;
  contentId: string;
  meta: {
    metaId: string;
    type: string;
    title: string;
    poster: string;
    season?: number;
    episode?: number;
  };
}

export function WatchPlayer({ id, file, contentId, meta }: WatchPlayerProps) {
  const updateProgress = useWatchHistoryStore((state) => state.updateProgress);
  const getProgress = useWatchHistoryStore((state) => state.getProgress);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    setStartTime(getProgress(contentId));
  }, [contentId, getProgress]);

  const handleTimeUpdate = useCallback(
    (time: number) => {
      updateProgress(contentId, time, meta);
    },
    [contentId, updateProgress, meta]
  );

  if (startTime === null) {
    return <div className="w-full h-full bg-black" />;
  }

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
