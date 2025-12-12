"use client";

import { useEffect, useState } from "react";
import { useMovieStore } from "@/store/useMovieStore";
import { MovieCard } from "@/components/MovieCard";
import { GENRES, ContentType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatalogPageProps {
  type: ContentType;
  title: string;
}

export function CatalogPage({ type, title }: CatalogPageProps) {
  const {
    movies,
    isLoading,
    genre,
    setGenre,
    loadMore,
    hasMore,
    setSearchQuery,
    setContentType,
  } = useMovieStore();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setContentType(type);
  }, [type, setContentType]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue, setSearchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-primary/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-100 h-100 bg-accent/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-150 h-150 bg-secondary/20 rounded-full blur-[150px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 neon-text bg-clip-text text-transparent bg-linear-to-r from-white to-white/50 uppercase">
            {title}
          </h1>
        </header>

        {/* Search Input */}
        <div className="max-w-md mx-auto mb-12 relative z-20">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-accent rounded-full blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-12 pr-4 py-6 rounded-full bg-black/50 border-white/10 backdrop-blur-xl focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 text-lg placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-3 justify-center min-w-max px-4">
            <Button
              variant={genre === null ? "default" : "outline"}
              onClick={() => setGenre(null)}
              className={cn(
                "rounded-full transition-all duration-300",
                genre === null
                  ? "bg-primary hover:bg-primary/80 shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                  : "bg-background/10 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-primary/50"
              )}
            >
              All
            </Button>
            {GENRES.map((g) => (
              <Button
                key={g}
                variant={genre === g ? "default" : "outline"}
                onClick={() => setGenre(g)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  genre === g
                    ? "bg-primary hover:bg-primary/80 shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                    : "bg-background/10 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-primary/50"
                )}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {movies.map((movie, index) => (
            <div
              key={`${movie.id}-${index}`}
              className="animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Loading State & Load More */}
        <div className="flex justify-center py-8">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">
                Loading content...
              </p>
            </div>
          ) : hasMore ? (
            <Button
              onClick={() => loadMore()}
              size="lg"
              className="bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 backdrop-blur-md text-lg px-8 py-6 rounded-full transition-all duration-300 group"
            >
              <span className="group-hover:neon-text transition-all">
                Load More
              </span>
            </Button>
          ) : (
            <p className="text-muted-foreground">No more content to load</p>
          )}
        </div>
      </div>
    </div>
  );
}
