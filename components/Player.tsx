/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

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
}

export default function Player({
  id,
  file,
  isDirectFile = false,
  onTimeUpdate,
  startTime = 0,
  title = "Player",
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

    const config = {
      id: id,
      file: playerFile,
      title: title,
      start: startTime,
    };

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
  }, [id, file, isDirectFile, onTimeUpdate, startTime, title]);

  return <div id={id} className="w-full h-full" />;
}
