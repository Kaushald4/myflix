"use client";

import { useWatchHistoryStore } from "@/store/useWatchHistoryStore";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, Film, Tv } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { history } = useWatchHistoryStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const historyItems = Object.values(history)
    .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero / Welcome */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight neon-text">
            Welcome to MyFlix
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal library for bookmarking and exploring. Discover movies
            and TV shows, track your progress, and download for offline viewing.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/movies">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                <Film className="mr-2 h-5 w-5" /> Browse Movies
              </Button>
            </Link>
            <Link href="/series">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                <Tv className="mr-2 h-5 w-5" /> Browse TV Shows
              </Button>
            </Link>
          </div>
        </div>

        {/* Continue Watching Section */}
        {historyItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Play className="w-5 h-5 text-primary fill-current" />
                Continue Watching
              </h2>
              <Link href="/history">
                <Button
                  variant="ghost"
                  className="text-primary hover:text-primary/80"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Link href={href}>
                            <Button
                              size="icon"
                              className="rounded-full bg-primary hover:bg-primary/90"
                            >
                              <Play className="w-5 h-5 fill-current" />
                            </Button>
                          </Link>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold truncate text-sm mb-1">
                          {item.title}
                        </h3>
                        {item.type === "series" && (
                          <p className="text-xs text-muted-foreground">
                            S{item.season} E{item.episode}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
