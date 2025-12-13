"use client";

import { useEffect, useState, Suspense } from "react";
import { MovieCard } from "@/components/MovieCard";
import { GENRES, ContentType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInfiniteContent, useSearchContent } from "@/hooks/useStreamio";
import { useInView } from "react-intersection-observer";
import { useRouter, useSearchParams } from "next/navigation";

interface CatalogPageProps {
  type: ContentType;
  title: string;
}

function CatalogContent({ type, title }: CatalogPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const genre = searchParams.get("genre");
  const initialSearch = searchParams.get("search") || "";

  const [inputValue, setInputValue] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const { ref, inView } = useInView();

  const handleGenreChange = (newGenre: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newGenre) {
      params.set("genre", newGenre);
    } else {
      params.delete("genre");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSearch = params.get("search") || "";

    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, router, searchParams]);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
  } = useInfiniteContent(type, genre || undefined);

  const { data: searchData, isLoading: isLoadingSearch } = useSearchContent(
    debouncedSearch,
    type
  );

  useEffect(() => {
    if (inView && hasNextPage && !debouncedSearch) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, debouncedSearch]);

  const movies = debouncedSearch
    ? searchData || []
    : infiniteData?.pages.flatMap((page) => page) || [];

  const isLoading = debouncedSearch ? isLoadingSearch : isLoadingInfinite;

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
              variant={!genre ? "default" : "outline"}
              onClick={() => handleGenreChange(null)}
              className={cn(
                "rounded-full transition-all duration-300",
                !genre
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
                onClick={() => handleGenreChange(g)}
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

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
              {movies.map((movie, index) => (
                <div
                  key={`${movie.id}-${index}`}
                  className="animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4"
                  style={{ animationDelay: `${(index % 20) * 50}ms` }}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>

            {/* Infinite Scroll Loader */}
            {!debouncedSearch && hasNextPage && (
              <div ref={ref} className="flex justify-center py-8">
                {isFetchingNextPage ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : (
                  <div className="h-8" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function CatalogPage(props: CatalogPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <CatalogContent {...props} />
    </Suspense>
  );
}
