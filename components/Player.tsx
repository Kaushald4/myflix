/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { Video } from "@/lib/api";

declare global {
  interface Window {
    Playerjs: any;
    pjscnfgs: any;
    PlayerjsAsync: any;
  }
}

interface PlayerProps {
  id: string;
  file: string;
  isDirectFile?: boolean;
  onTimeUpdate?: (time: number) => void;
  startTime?: number;
  title?: string;
  subtitle?: string | null;
  videos?: Video[];
  currentSeason?: number;
  currentEpisode?: number;
  metaId?: string;
}

export default function Player({
  id,
  file,
  isDirectFile = false,
  onTimeUpdate,
  startTime = 0,
  title = "Player",
  subtitle = null,
  videos,
  currentSeason,
  currentEpisode,
  metaId,
}: PlayerProps) {
  useEffect(() => {
    let blobUrl: string | null = null;
    let playerFile = file;

    if (!isDirectFile) {
      blobUrl = URL.createObjectURL(
        new Blob([file], { type: "application/vnd.apple.mpegurl" })
      );
      playerFile = blobUrl + "#.m3u8";
    }

    const config: any = {
      id: id,
      file: playerFile,
      title: title,
      start: startTime,
    };

    if (subtitle) {
      config.subtitle = subtitle;
    }

    // Add episodes for series
    if (
      videos &&
      videos.length > 0 &&
      currentSeason !== undefined &&
      currentEpisode !== undefined &&
      metaId
    ) {
      // Group videos by season
      const seasonsMap = new Map<number, Video[]>();
      videos.forEach((video) => {
        if (!seasonsMap.has(video.season)) {
          seasonsMap.set(video.season, []);
        }
        seasonsMap.get(video.season)!.push(video);
      });

      // Create Player.js format for episodes
      const seasons: any[] = [];
      seasonsMap.forEach((episodes, seasonNum) => {
        const seasonEpisodes: any[] = episodes
          .sort((a, b) => a.episode - b.episode)
          .map((ep) => ({
            title: ep.name || `Episode ${ep.episode}`,
            file: `/watch/series/${metaId}?season=${ep.season}&episode=${ep.episode}`,
            poster: ep.thumbnail || "",
          }));

        seasons.push({
          title: `Season ${seasonNum}`,
          file: seasonEpisodes,
        });
      });

      if (seasons.length > 0) {
        config.file = seasons;
        config.title = title;
      }
    }

    let playerInstance: any = null;

    if (window.Playerjs) {
      playerInstance = new window.Playerjs(config);
    } else {
      if (!window.pjscnfgs) {
        window.pjscnfgs = {};
      }
      window.pjscnfgs[config.id] = config;
    }

    if (!window.PlayerjsAsync) {
      window.PlayerjsAsync = function () {
        if (window.pjscnfgs) {
          Object.entries(window.pjscnfgs).map(([, value]) => {
            return new window.Playerjs(value);
          });
        }
        window.pjscnfgs = {};
      };
    }

    // Polling for time updates
    let interval: NodeJS.Timeout;
    if (onTimeUpdate) {
      interval = setInterval(() => {
        try {
          if (!playerInstance && window.Playerjs) {
            const element: any = document.getElementById(id);
            if (element && element.api) {
              const currentTime = element.api("time");
              if (typeof currentTime === "number") {
                onTimeUpdate(currentTime);
              }
            }
          } else if (playerInstance && playerInstance.api) {
            const currentTime = playerInstance.api("time");
            if (typeof currentTime === "number") {
              onTimeUpdate(currentTime);
            }
          }
        } catch (e) {
          console.log(e);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [
    id,
    file,
    isDirectFile,
    onTimeUpdate,
    startTime,
    title,
    subtitle,
    videos,
    currentSeason,
    currentEpisode,
    metaId,
  ]);

  return <div id={id} className="w-full h-full" />;
}
