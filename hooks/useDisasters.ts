"use client";

import { useQuery } from "@tanstack/react-query";
import type { DisasterEvent, HurricaneStorm } from "@/types/disaster.types";

interface SevereResponse {
  events: DisasterEvent[];
  hurricanes: HurricaneStorm[];
  counts: Record<string, number>;
}

async function fetchSevere(): Promise<SevereResponse> {
  const res = await fetch("/api/severe");
  if (!res.ok) throw new Error("severe fetch failed");
  return res.json();
}

export function useDisasters() {
  return useQuery<SevereResponse>({
    queryKey: ["severe"],
    queryFn: fetchSevere,
    refetchInterval: 15 * 60 * 1000,
  });
}

async function fetchMapEvents(
  lat: number,
  lon: number,
  radius = 500,
): Promise<DisasterEvent[]> {
  const res = await fetch(
    `/api/map-events?lat=${lat}&lon=${lon}&radius=${radius}`,
  );
  if (!res.ok) throw new Error("map events failed");
  const j = (await res.json()) as { events: DisasterEvent[] };
  return j.events;
}

export function useMapEvents(lat?: number, lon?: number, radius = 500) {
  return useQuery<DisasterEvent[]>({
    queryKey: ["map-events", lat, lon, radius],
    queryFn: () => fetchMapEvents(lat!, lon!, radius),
    enabled: typeof lat === "number" && typeof lon === "number",
    refetchInterval: 5 * 60 * 1000,
  });
}
