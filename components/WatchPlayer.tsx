"use client";

import Player from "@/components/Player";
import { useWatchHistoryStore } from "@/store/useWatchHistoryStore";
import { useCallback, useEffect, useState } from "react";

interface WatchPlayerProps {
  id: string;
  file: string;
  contentId: string;
}

export function WatchPlayer({ id, file, contentId }: WatchPlayerProps) {
  const updateProgress = useWatchHistoryStore((state) => state.updateProgress);
  const getProgress = useWatchHistoryStore((state) => state.getProgress);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    setStartTime(getProgress(contentId));
  }, [contentId, getProgress]);

  const handleTimeUpdate = useCallback(
    (time: number) => {
      updateProgress(contentId, time);
    },
    [contentId, updateProgress]
  );

  if (startTime === null) {
    return <div className="w-full h-full bg-black" />;
  }

  return (
    <Player
      id={id}
      file={file}
      onTimeUpdate={handleTimeUpdate}
      startTime={startTime}
    />
  );
}
