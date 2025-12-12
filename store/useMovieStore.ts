import { create } from "zustand";
import { fetchContent, searchContent, Meta, ContentType } from "@/lib/api";

interface MovieStore {
  movies: Meta[];
  isLoading: boolean;
  genre: string | null;
  searchQuery: string;
  skip: number;
  hasMore: boolean;
  contentType: ContentType;

  setGenre: (genre: string | null) => void;
  setSearchQuery: (query: string) => void;
  setContentType: (type: ContentType) => void;
  loadMovies: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useMovieStore = create<MovieStore>((set, get) => ({
  movies: [],
  isLoading: false,
  genre: null,
  searchQuery: "",
  skip: 0,
  hasMore: true,
  contentType: "movie",

  setGenre: (genre) => {
    set({ genre, searchQuery: "", skip: 0, movies: [], hasMore: true });
    get().loadMovies(true);
  },

  setSearchQuery: (query) => {
    set({
      searchQuery: query,
      genre: null,
      skip: 0,
      movies: [],
      hasMore: true,
    });
    get().loadMovies(true);
  },

  setContentType: (type) => {
    set({
      contentType: type,
      genre: null,
      searchQuery: "",
      skip: 0,
      movies: [],
      hasMore: true,
    });
    get().loadMovies(true);
  },

  loadMovies: async (reset = false) => {
    const { genre, skip, movies, searchQuery, contentType } = get();
    set({ isLoading: true });

    try {
      let newMovies: Meta[] = [];

      if (searchQuery) {
        newMovies = await searchContent(searchQuery, contentType);
        set({ hasMore: false });
      } else {
        newMovies = await fetchContent({
          type: contentType,
          skip,
          genre: genre || undefined,
        });
        if (newMovies.length === 0) {
          set({ hasMore: false });
        }
      }

      set({
        movies: reset ? newMovies : [...movies, ...newMovies],
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const { isLoading, hasMore } = get();
    if (isLoading || !hasMore) return;

    // Increment skip by typical page size (Cinemeta usually returns around 50-100 items, let's assume we just add to the skip)
    // The user prompt example showed `skip=45`, `skip=49`. It seems to be an offset.
    // Let's increment by 50 for now as a safe bet for "next page" logic based on typical API behaviors,
    // or we can just track the length of current movies if the API supports exact offsets.
    // However, the prompt example `skip=45` suggests it might be index-based.

    const currentCount = get().movies.length;
    set({ skip: currentCount });
    await get().loadMovies();
  },
}));
