/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";

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
      hlsconfig: {
        maxBufferLength: 20,
        maxMaxBufferLength: 30,
        maxLoadingDelay: 4,
        fragLoadingMaxRetry: 2,
        // Start with a lower quality to reduce initial request size
        // startLevel: 0,
        // xhrSetup: function (xhr: XMLHttpRequest) {
        //   //   xhr.withCredentials = false;
        //   //   xhr.setRequestHeader("Origin", "tmstr4.thrumbleandjaxon.com");
        //   //   xhr.setRequestHeader("Authorization", file);
        // },
      },
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
          // Try to get the player instance if it wasn't created immediately
          if (!playerInstance && window.Playerjs) {
            // This is tricky because we don't have a reference if created via Async
            // But PlayerJS usually puts the API on the element or we can try to find it
            // For now, let's assume if we created it, we have it.
            // If created via Async, we might miss it.
            // However, PlayerJS usually exposes `window.Playerjs` instances if we track them.
            // A common pattern is `document.getElementById(id).api("time")` if the library supports it.
            // Let's try accessing via the element ID which PlayerJS often attaches to.
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
  }, [id, file, isDirectFile, onTimeUpdate, startTime]);

  return <div id={id} className="w-full h-full"></div>;
}
