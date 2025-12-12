"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Playerjs: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pjscnfgs: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PlayerjsAsync: any;
  }
}

interface PlayerProps {
  id: string;
  file: string;
}

export default function Player({ id, file }: PlayerProps) {
  // Assuming playerjs.js is in the public folder or provide a valid URL
  //   useScript("/playerjs.js");

  useEffect(() => {
    const blobUrl = URL.createObjectURL(
      new Blob([file], { type: "application/vnd.apple.mpegurl" })
    );

    const config = {
      id: id,
      file: blobUrl + "#.m3u8",
      title: "Player",
      hlsconfig: {
        maxBufferLength: 20,
        maxMaxBufferLength: 30,
        // Limit how many segments can be downloaded at once
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

    if (window.Playerjs) {
      new window.Playerjs(config);
    } else {
      if (!window.pjscnfgs) {
        window.pjscnfgs = {};
      }
      window.pjscnfgs[config.id] = config;
    }

    // Define PlayerjsAsync if it doesn't exist (though the script should define it usually,
    // but the user snippet defines it manually in the example?)
    // The user snippet has:
    // window.PlayerjsAsync = function () { ... }
    // This usually comes from the playerjs library itself, but the user provided it as part of the code.
    // Let's include it to be safe, or rely on the loaded script.
    // Actually, the user snippet shows `Player.js` exporting `Player` and defining `window.PlayerjsAsync`.
    // So I should probably include it.

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

    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [id, file]);

  return <div id={id} className="w-full h-full"></div>;
}
