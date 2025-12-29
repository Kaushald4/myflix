"use client";

import { MovieCard } from "@/components/MovieCard";
import { useWatchlistStore } from "@/store/useWatchlistStore";

export default function WatchlistPage() {
  const watchlist = useWatchlistStore((state) => state.watchlist);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-20 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground neon-text">
            My Watchlist
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal collection of must-watch content
          </p>
        </header>

        {/* Content */}
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-card/30 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-muted-foreground max-w-md">
              Start adding movies and shows to track what you want to watch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {watchlist.map((movie, index) => (
              <div
                key={`${movie.id}-${index}`}
                className="animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${(index % 20) * 30}ms` }}
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
