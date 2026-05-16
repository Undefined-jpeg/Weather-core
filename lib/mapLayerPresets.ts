import type { MapLayerId } from "@/stores/useMapStore";

export const MAP_LAYER_PRESETS: Record<
  string,
  { label: string; layers: Partial<Record<MapLayerId, boolean>> }
> = {
  stormChase: {
    label: "Storm chase",
    layers: {
      precipitation: true,
      wind: true,
      tornado: true,
      hurricane: true,
      wildfire: true,
      flood: true,
      temperature: false,
      clouds: false,
    },
  },
  dailyCommute: {
    label: "Daily commute",
    layers: {
      temperature: true,
      clouds: true,
      precipitation: true,
      wind: false,
      tornado: false,
      hurricane: false,
      wildfire: false,
      flood: false,
    },
  },
};
