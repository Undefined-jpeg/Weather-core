"use client";

import { useQuery } from "@tanstack/react-query";
import type { WeekYearOverYearCompare } from "@/types/weather.types";

async function fetchWeekYoY(
  lat: number,
  lon: number,
): Promise<WeekYearOverYearCompare | null> {
  const res = await fetch(`/api/historical/week-over-year?lat=${lat}&lon=${lon}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("week YoY fetch failed");
  return res.json() as Promise<WeekYearOverYearCompare>;
}

export function useWeekYearCompare(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ["historical-week-yoy", lat, lon],
    queryFn: () => fetchWeekYoY(lat!, lon!),
    enabled: typeof lat === "number" && typeof lon === "number",
    staleTime: 6 * 60 * 60 * 1000,
  });
}
