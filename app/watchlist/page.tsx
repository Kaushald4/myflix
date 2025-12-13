"use client";

import { useState, useEffect } from "react";
import { MovieCard } from "@/components/MovieCard";
import { useWatchlistStore } from "@/store/useWatchlistStore";

export default function WatchlistPage() {
  const watchlist = useWatchlistStore((state) => state.watchlist);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading watchlist...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-primary/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-100 h-100 bg-accent/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-150 h-150 bg-secondary/20 rounded-full blur-[150px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="mb-12 text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 neon-text bg-clip-text text-transparent bg-linear-to-r from-white to-white/50 uppercase">
            Watchlist
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto glass p-4 rounded-full">
            Your personal collection of must-watch content.
          </p>
        </header>

        {watchlist.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">
              Your watchlist is empty.
            </p>
            <p className="text-muted-foreground mt-2">
              Start adding movies and shows to track what you want to watch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {watchlist.map((movie, index) => (
              <div
                key={`${movie.id}-${index}`}
                className="animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
