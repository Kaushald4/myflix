import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WatchHistoryState {
  history: Record<string, number>; // key: videoId (or episodeId), value: timestamp in seconds
  updateProgress: (id: string, time: number) => void;
  getProgress: (id: string) => number;
}

export const useWatchHistoryStore = create<WatchHistoryState>()(
  persist(
    (set, get) => ({
      history: {},
      updateProgress: (id, time) => {
        set((state) => ({
          history: { ...state.history, [id]: time },
        }));
      },
      getProgress: (id) => {
        return get().history[id] || 0;
      },
    }),
    {
      name: "watch-history-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
