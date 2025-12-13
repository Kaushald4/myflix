"use client";

import { useState, useRef } from "react";
import { extractStreamLink } from "@/lib/streamlib/extract";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import axios from "axios";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

interface DownloadButtonProps {
  id: string;
  type: string;
  season?: number;
  episode?: number;
  title: string;
}

interface QualityOption {
  resolution: string;
  bandwidth: number;
  url: string;
}

export function DownloadButton({
  id,
  type,
  season = 1,
  episode = 1,
  title,
}: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  const loadFFmpeg = async () => {
    if (ffmpegLoaded) return;
    const baseURL =
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      console.log("FFmpeg:", message);
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setFfmpegLoaded(true);
  };

  const fetchQualities = async () => {
    setIsLoading(true);
    try {
      const m3u8Content = await extractStreamLink(id, type, season, episode);

      if (!m3u8Content || typeof m3u8Content !== "string") {
        toast.error("No download links available");
        setIsOpen(false);
        return;
      }

      const parsedQualities = parseM3U8Qualities(
        m3u8Content,
        window.location.origin
      );
      setQualities(parsedQualities);
    } catch (error) {
      console.error("Error fetching qualities:", error);
      toast.error("Failed to fetch download options");
    } finally {
      setIsLoading(false);
    }
  };

  const parseM3U8Qualities = (
    content: string,
    baseUrl: string
  ): QualityOption[] => {
    const lines = content.split("\n");
    const options: QualityOption[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("#EXT-X-STREAM-INF")) {
        const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
        const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
        const url = lines[i + 1];

        if (resolutionMatch && url) {
          // Resolve relative URL
          const absoluteUrl = new URL(url, baseUrl).toString();

          options.push({
            resolution: resolutionMatch[1],
            bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0,
            url: absoluteUrl,
          });
        }
      }
    }

    // Sort by bandwidth (quality) descending
    return options.sort((a, b) => b.bandwidth - a.bandwidth);
  };

  const startDownload = async (quality: QualityOption) => {
    setDownloading(true);
    setStatus("Initializing download...");
    setProgress(0);

    try {
      // 1. Fetch the quality playlist to get segments
      const response = await axios.get(quality.url);
      const content = response.data;
      const lines = content.split("\n");
      const segments: string[] = [];

      const baseUrl = quality.url;

      for (const line of lines) {
        if (line && !line.startsWith("#")) {
          const absoluteUrl = new URL(line, baseUrl).toString();
          segments.push(absoluteUrl);
        }
      }

      if (segments.length === 0) {
        throw new Error("No segments found");
      }

      setStatus(`Downloading ${segments.length} segments...`);

      // 2. Download segments with concurrency limit
      const blobs: Blob[] = [];
      const CONCURRENCY = 3; // Low concurrency to avoid 429
      let completed = 0;

      for (let i = 0; i < segments.length; i += CONCURRENCY) {
        const chunk = segments.slice(i, i + CONCURRENCY);
        const promises = chunk.map(async (segmentUrl) => {
          try {
            const segResponse = await axios.get(segmentUrl, {
              responseType: "blob",
              // Add delay to be nice to the server
            });
            return segResponse.data;
          } catch (e) {
            console.error("Segment download failed", e);
            return null;
          }
        });

        const results = await Promise.all(promises);
        results.forEach((blob) => {
          if (blob) blobs.push(blob);
        });

        completed += chunk.length;
        setProgress(
          Math.min(100, Math.round((completed / segments.length) * 100))
        );

        // Small delay between chunks
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // 3. Combine blobs
      setStatus("Finalizing file...");
      const finalBlob = new Blob(blobs, { type: "video/mp2t" });

      // 4. Convert to MP4 using FFmpeg
      setStatus("Converting to MP4 (this may take a moment)...");
      let mp4Blob = finalBlob; // Fallback to TS if conversion fails
      let extension = "ts";
      let mimeType = "video/mp2t";

      try {
        await loadFFmpeg();
        const ffmpeg = ffmpegRef.current;

        // Write the TS file to FFmpeg's virtual filesystem
        await ffmpeg.writeFile("input.ts", await fetchFile(finalBlob));

        // Run FFmpeg command to copy streams to MP4 container (fast, no re-encoding)
        // If this fails, we might need to re-encode, but copy is preferred for speed
        await ffmpeg.exec(["-i", "input.ts", "-c", "copy", "output.mp4"]);

        // Read the output file
        const data = await ffmpeg.readFile("output.mp4");

        // Create MP4 blob
        mp4Blob = new Blob([data as unknown as BlobPart], {
          type: "video/mp4",
        });
        extension = "mp4";
        mimeType = "video/mp4";

        // Cleanup
        await ffmpeg.deleteFile("input.ts");
        await ffmpeg.deleteFile("output.mp4");
      } catch (ffmpegError) {
        console.error(
          "FFmpeg conversion failed, falling back to TS:",
          ffmpegError
        );
        toast.error("Conversion to MP4 failed. Saving as TS instead.");
      }

      // 5. Save to IndexedDB
      // Let's store in IDB for "My Downloads" page
      await saveToDownloads(id, title, mp4Blob, quality.resolution, mimeType);

      // 6. Trigger download to device
      try {
        const url = URL.createObjectURL(mp4Blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_${
          quality.resolution
        }.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Error triggering download:", e);
      }

      toast.success("Download completed!");
      setIsOpen(false);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
      setStatus("");
    }
  };

  const saveToDownloads = async (
    contentId: string,
    title: string,
    blob: Blob,
    quality: string,
    mimeType: string = "video/mp2t"
  ) => {
    // Simple IDB wrapper
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("StreamflixDB", 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("downloads")) {
          db.createObjectStore("downloads", { keyPath: "id" });
        }
      };

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["downloads"], "readwrite");
        const store = transaction.objectStore("downloads");

        const downloadItem = {
          id: contentId,
          title: title,
          blob: blob,
          quality: quality,
          mimeType: mimeType,
          date: new Date().toISOString(),
          size: blob.size,
        };

        const addRequest = store.put(downloadItem);

        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md"
          onClick={fetchQualities}
        >
          <Download className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/90 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Download {title}</DialogTitle>
        </DialogHeader>

        {downloading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span>{status}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Please keep this window open.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : qualities.length > 0 ? (
          <div className="grid gap-2 py-4">
            {qualities.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                className="justify-between border-white/10 hover:bg-white/10 hover:text-white"
                onClick={() => startDownload(q)}
              >
                <span>{q.resolution}</span>
                <span className="text-xs text-muted-foreground">
                  {~~(q.bandwidth / 1000)} kbps
                </span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No download options found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
