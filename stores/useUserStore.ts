"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BriefingVerbosity } from "@/lib/gemini";
import type { LocationInfo, Unit } from "@/types/weather.types";

interface UserState {
  unit: Unit;
  setUnit: (u: Unit) => void;
  currentLocation: LocationInfo | null;
  setCurrentLocation: (l: LocationInfo | null) => void;
  savedLocations: LocationInfo[];
  addSaved: (l: LocationInfo) => void;
  removeSaved: (l: LocationInfo) => void;
  hasAskedLocation: boolean;
  setHasAskedLocation: (v: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  /** Never show Chromium PWA install / iOS Safari install hint. */
  suppressInstallPrompt: boolean;
  setSuppressInstallPrompt: (v: boolean) => void;
  briefingVerbosity: BriefingVerbosity;
  setBriefingVerbosity: (v: BriefingVerbosity) => void;
  /** Optional local alert when sustained wind exceeds this (m/s). */
  windAlertMps: number | null;
  setWindAlertMps: (v: number | null) => void;
  /** Optional frost/heat cue (°C). */
  tempAlertC: number | null;
  setTempAlertC: (v: number | null) => void;
  /** Optional probability threshold 0–1 for rain watch. */
  popAlertFraction: number | null;
  setPopAlertFraction: (v: number | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      unit: "metric",
      setUnit: (u) => set({ unit: u }),
      currentLocation: null,
      setCurrentLocation: (l) => set({ currentLocation: l }),
      savedLocations: [],
      addSaved: (l) => {
        const arr = get().savedLocations;
        if (arr.find((x) => x.lat === l.lat && x.lon === l.lon)) return;
        if (arr.length >= 5) return;
        set({ savedLocations: [...arr, l] });
      },
      removeSaved: (l) =>
        set({
          savedLocations: get().savedLocations.filter(
            (x) => !(x.lat === l.lat && x.lon === l.lon),
          ),
        }),
      hasAskedLocation: false,
      setHasAskedLocation: (v) => set({ hasAskedLocation: v }),
      reducedMotion: false,
      setReducedMotion: (v) => set({ reducedMotion: v }),
      suppressInstallPrompt: false,
      setSuppressInstallPrompt: (v) => set({ suppressInstallPrompt: v }),
      briefingVerbosity: "standard",
      setBriefingVerbosity: (v) => set({ briefingVerbosity: v }),
      windAlertMps: null,
      setWindAlertMps: (v) => set({ windAlertMps: v }),
      tempAlertC: null,
      setTempAlertC: (v) => set({ tempAlertC: v }),
      popAlertFraction: null,
      setPopAlertFraction: (v) => set({ popAlertFraction: v }),
    }),
    { name: "weathercore-user" },
  ),
);
