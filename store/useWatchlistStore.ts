import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Meta } from "@/lib/api";

interface WatchlistState {
  watchlist: Meta[];
  addToWatchlist: (item: Meta) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: (item) => {
        const { watchlist } = get();
        if (!watchlist.some((i) => i.id === item.id)) {
          set({ watchlist: [...watchlist, item] });
        }
      },
      removeFromWatchlist: (id) => {
        const { watchlist } = get();
        set({ watchlist: watchlist.filter((i) => i.id !== id) });
      },
      isInWatchlist: (id) => {
        const { watchlist } = get();
        return watchlist.some((i) => i.id === id);
      },
    }),
    {
      name: "watchlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
