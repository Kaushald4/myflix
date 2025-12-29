"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Download, HardDrive, Info, Loader2 } from "lucide-react";
import Player from "@/components/Player";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DownloadedItem {
  id: string;
  title: string;
  blob: Blob;
  quality: string;
  mimeType?: string;
  date: string;
  size: number;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDownloads = useCallback(async () => {
    try {
      const request = indexedDB.open("StreamflixDB", 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("downloads")) {
          db.createObjectStore("downloads", { keyPath: "id" });
        }
      };

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("downloads")) {
          setDownloads([]);
          setLoading(false);
          return;
        }

        const transaction = db.transaction(["downloads"], "readonly");
        const store = transaction.objectStore("downloads");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          setDownloads(getAllRequest.result);
          setLoading(false);
        };
      };
    } catch (error) {
      console.error("Error loading downloads:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDownloads();
  }, [loadDownloads]);

  const deleteDownload = (id: string) => {
    const request = indexedDB.open("StreamflixDB", 1);
    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["downloads"], "readwrite");
      const store = transaction.objectStore("downloads");
      store.delete(id);

      transaction.oncomplete = () => {
        loadDownloads();
      };
    };
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const saveToDevice = (item: DownloadedItem) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a");
    a.href = url;
    const extension = item.mimeType === "video/mp4" ? "mp4" : "ts";
    a.download = `${item.title.replace(/[^a-z0-9]/gi, "_")}_${
      item.quality
    }.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPlayableUrl = (item: DownloadedItem) => {
    if (item.mimeType === "video/mp4") {
      return URL.createObjectURL(item.blob);
    }

    const tsUrl = URL.createObjectURL(item.blob);
    const m3u8 = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10800
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10800.0,
${tsUrl}
#EXT-X-ENDLIST`;

    return m3u8;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-20 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-full bg-primary/20">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground neon-text">
              My Downloads
            </h1>
            <p className="text-muted-foreground">Manage your offline content</p>
          </div>
        </div>

        {/* Alert */}
        <Alert className="mb-8 bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/20 dark:border-blue-500/20 text-blue-200 dark:text-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Storage Tip</AlertTitle>
          <AlertDescription>
            Downloads are stored in your browser's IndexedDB. This can use up
            significant storage and potentially slow down your browser. We
            recommend deleting downloads from this list after you've saved them
            to your device to free up space.
          </AlertDescription>
        </Alert>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-card/30 dark:bg-card/30 flex items-center justify-center mb-4">
              <HardDrive className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No downloads yet
            </h2>
            <p className="text-muted-foreground max-w-md">
              Download movies and shows to watch them offline.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {downloads.map((item) => (
              <div
                key={item.id}
                className="bg-card/30 dark:bg-card/30 border border-white/10 dark:border-white/10 rounded-md overflow-hidden group hover:border-primary/50 transition-colors"
              >
                <div className="aspect-video bg-black/50 dark:bg-black/50 relative flex items-center justify-center">
                  <Play className="w-12 h-12 text-white/50 dark:text-white/50 group-hover:text-primary transition-colors" />
                  <div className="absolute bottom-2 right-2 bg-black/80 dark:bg-black/80 px-2 py-1 rounded text-xs text-white">
                    {item.quality}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{formatSize(item.size)}</span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80">
                          <Play className="w-4 h-4 mr-2" /> Play
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl bg-black dark:bg-black border-white/10 dark:border-white/10 p-0 overflow-hidden aspect-video">
                        <Player
                          id={`player-${item.id}`}
                          file={getPlayableUrl(item)}
                          isDirectFile={item.mimeType === "video/mp4"}
                          title={item.title}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => saveToDevice(item)}
                      title="Save to Device"
                      className="border-white/20 dark:border-white/20 hover:bg-white/10 dark:hover:bg-white/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteDownload(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
