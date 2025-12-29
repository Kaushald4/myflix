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
    <div className="min-h-screen bg-background text-foreground pb-20 pt-20 px-4 md:px-8 lg:px-12">
      {/* Header */}
      <header className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground neon-text">
            {title}
          </h1>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full pl-10 py-2 bg-card/30 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Genre Filter */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            <Button
              variant={!genre ? "default" : "outline"}
              onClick={() => handleGenreChange(null)}
              size="sm"
              className={cn(
                "rounded-full transition-all duration-300",
                !genre
                  ? "bg-primary text-primary-foreground hover:bg-primary/80"
                  : "bg-card/30 text-foreground border-white/10 hover:bg-card/50"
              )}
            >
              All
            </Button>
            {GENRES.map((g) => (
              <Button
                key={g}
                variant={genre === g ? "default" : "outline"}
                onClick={() => handleGenreChange(g)}
                size="sm"
                className={cn(
                  "rounded-full transition-all duration-300 whitespace-nowrap",
                  genre === g
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "bg-card/30 text-foreground border-white/10 hover:bg-card/50"
                )}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-lg mb-4">
            {debouncedSearch
              ? `No results found for "${debouncedSearch}"`
              : genre
              ? `No ${genre} ${title.toLowerCase()} found`
              : `No ${title.toLowerCase()} found`}
          </p>
          {genre && (
            <Button
              variant="outline"
              onClick={() => handleGenreChange(null)}
              className="border-white/20 hover:bg-white/10"
            >
              View All {title}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie, index) => (
              <div
                key={`${movie.id}-${index}`}
                className="animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${(index % 20) * 30}ms` }}
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
  );
}

export function CatalogPage(props: CatalogPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <CatalogContent {...props} />
    </Suspense>
  );
}
