"use client";

import { useWatchHistoryStore } from "@/store/useWatchHistoryStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Clock, Download, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { history, removeFromHistory, importHistory } = useWatchHistoryStore();
  const [mounted, setMounted] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const historyItems = Object.values(history).sort(
    (a, b) => b.lastWatchedAt - a.lastWatchedAt
  );

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(history, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `myflix_history_${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("History exported successfully");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Failed to export history");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        importHistory(parsed);
        toast.success("History imported successfully");
      } catch (error) {
        console.error("Import failed", error);
        toast.error("Failed to import history. Invalid file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Watch History</h1>
              <p className="text-muted-foreground">
                Continue where you left off
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none"
            >
              <Upload className="w-4 h-4 mr-2" /> Import
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex-1 md:flex-none"
            >
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        {historyItems.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No watch history yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {historyItems.map((item) => {
              const progressPercentage = Math.min(
                (item.timestamp /
                  (item.duration || (item.type === "movie" ? 7200 : 1500))) *
                  100,
                100
              );

              const href =
                item.type === "movie"
                  ? `/watch/movie/${item.metaId}`
                  : `/watch/series/${item.metaId}?season=${item.season}&episode=${item.episode}`;

              return (
                <Card
                  key={item.id}
                  className="bg-card/30 border-white/10 overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-0">
                    <div className="aspect-video relative bg-black/50">
                      {item.poster ? (
                        <Image
                          src={item.poster}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Play className="w-12 h-12 opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="icon"
                          className="rounded-full bg-primary hover:bg-primary/90"
                          onClick={() => {
                            setLoadingId(item.id);
                            router.push(href);
                          }}
                          disabled={loadingId === item.id}
                        >
                          {loadingId === item.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Play className="w-5 h-5 fill-current" />
                          )}
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold truncate mb-1">{item.title}</h3>
                      {item.type === "series" && (
                        <p className="text-sm text-muted-foreground mb-3">
                          S{item.season} E{item.episode}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.lastWatchedAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromHistory(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
