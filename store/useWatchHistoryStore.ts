import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface HistoryItem {
  id: string;
  metaId: string;
  type: string;
  title: string;
  poster: string;
  season?: number;
  episode?: number;
  timestamp: number;
  duration?: number;
  lastWatchedAt: number;
}

interface WatchHistoryState {
  history: Record<string, HistoryItem>;
  updateProgress: (
    id: string,
    time: number,
    meta?: Partial<HistoryItem>
  ) => void;
  getProgress: (id: string) => number;
  removeFromHistory: (id: string) => void;
  importHistory: (history: Record<string, HistoryItem>) => void;
}

export const useWatchHistoryStore = create<WatchHistoryState>()(
  persist(
    (set, get) => ({
      history: {},
      updateProgress: (id, time, meta) => {
        set((state) => {
          const existing = state.history[id];
          return {
            history: {
              ...state.history,
              [id]: {
                ...(existing || {}),
                ...meta,
                id,
                timestamp: time,
                lastWatchedAt: Date.now(),
              } as HistoryItem,
            },
          };
        });
      },
      getProgress: (id) => {
        const item = get().history[id];
        return item?.timestamp || 0;
      },
      removeFromHistory: (id) => {
        set((state) => {
          const newHistory = { ...state.history };
          delete newHistory[id];
          return { history: newHistory };
        });
      },
      importHistory: (newHistory) => {
        set((state) => ({
          history: { ...state.history, ...newHistory },
        }));
      },
    }),
    {
      name: "watch-history-storage-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
