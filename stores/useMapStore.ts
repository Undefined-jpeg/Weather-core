"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MapLayerId =
  | "temperature"
  | "precipitation"
  | "wind"
  | "clouds"
  | "tornado"
  | "hurricane"
  | "wildfire"
  | "flood";

export interface MapViewport {
  key: string;
  center: [number, number];
  zoom: number;
}

interface MapState {
  layers: Record<MapLayerId, boolean>;
  toggleLayer: (id: MapLayerId) => void;
  setLayer: (id: MapLayerId, value: boolean) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  mapViewport: MapViewport | null;
  setMapViewport: (v: MapViewport | null) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      layers: {
        temperature: false,
        precipitation: true,
        wind: false,
        clouds: false,
        tornado: true,
        hurricane: true,
        wildfire: true,
        flood: true,
      },
      toggleLayer: (id) =>
        set((s) => ({ layers: { ...s.layers, [id]: !s.layers[id] } })),
      setLayer: (id, value) => set((s) => ({ layers: { ...s.layers, [id]: value } })),
      selectedEventId: null,
      setSelectedEventId: (id) => set({ selectedEventId: id }),
      sidebarOpen: true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      mapViewport: null,
      setMapViewport: (v) => set({ mapViewport: v }),
    }),
    {
      name: "weathercore-map-viewport",
      partialize: (s) => ({ mapViewport: s.mapViewport }),
    },
  ),
);
