"use client";

import { useQuery } from "@tanstack/react-query";
import type { NwsAlert } from "@/types/alert.types";

async function fetchAlerts(lat: number, lon: number): Promise<NwsAlert[]> {
  const res = await fetch(`/api/alerts?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("alerts fetch failed");
  const j = (await res.json()) as { alerts: NwsAlert[] };
  return j.alerts;
}

export function useAlerts(lat?: number, lon?: number) {
  return useQuery<NwsAlert[]>({
    queryKey: ["alerts", lat, lon],
    queryFn: () => fetchAlerts(lat!, lon!),
    enabled: typeof lat === "number" && typeof lon === "number",
    refetchInterval: 5 * 60 * 1000,
  });
}
