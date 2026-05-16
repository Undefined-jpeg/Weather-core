"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MapBookmark {
  id: string;
  label: string;
  center: [number, number];
  zoom: number;
  savedAt: number;
}

interface State {
  bookmarks: MapBookmark[];
  addBookmark: (input: { label: string; center: [number, number]; zoom: number }) => void;
  removeBookmark: (id: string) => void;
}

export const useMapBookmarksStore = create<State>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      addBookmark: (input) =>
        set((s) => {
          if (s.bookmarks.length >= 12) return s;
          const id = crypto.randomUUID();
          return {
            bookmarks: [
              ...s.bookmarks,
              {
                id,
                label: input.label.slice(0, 48),
                center: input.center,
                zoom: input.zoom,
                savedAt: Date.now(),
              },
            ],
          };
        }),
      removeBookmark: (id) =>
        set({ bookmarks: get().bookmarks.filter((x) => x.id !== id) }),
    }),
    { name: "weathercore-map-bookmarks" },
  ),
);
