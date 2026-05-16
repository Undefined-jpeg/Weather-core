"use client";

import { useQuery } from "@tanstack/react-query";
import type { WeatherPayload } from "@/types/weather.types";

async function fetchWeather(lat: number, lon: number): Promise<WeatherPayload> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  return res.json();
}

export function useWeather(lat?: number, lon?: number) {
  return useQuery<WeatherPayload>({
    queryKey: ["weather", lat, lon],
    queryFn: () => fetchWeather(lat!, lon!),
    enabled: typeof lat === "number" && typeof lon === "number",
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
  });
}
