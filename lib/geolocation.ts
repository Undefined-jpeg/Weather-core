import type { LocationInfo } from "@/types/weather.types";

export async function getLocationFromIp(): Promise<LocationInfo | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      headers: { "User-Agent": "WeatherCore/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      latitude?: number;
      longitude?: number;
      city?: string;
      country_name?: string;
      region?: string;
      timezone?: string;
    };
    if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
      return null;
    }
    return {
      lat: data.latitude,
      lon: data.longitude,
      name: data.city || "Unknown",
      country: data.country_name,
      region: data.region,
      timezone: data.timezone,
    };
  } catch {
    return null;
  }
}

export async function getLocationFromBrowser(): Promise<{
  lat: number;
  lon: number;
} | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 1000 * 60 * 30 },
    );
  });
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<LocationInfo | null> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{
      name: string;
      country?: string;
      state?: string;
    }>;
    const first = arr[0];
    if (!first) return null;
    return {
      lat,
      lon,
      name: first.name,
      country: first.country,
      region: first.state,
    };
  } catch {
    return null;
  }
}

export async function forwardGeocode(query: string): Promise<LocationInfo[]> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const arr = (await res.json()) as Array<{
      name: string;
      lat: number;
      lon: number;
      country?: string;
      state?: string;
    }>;
    return arr.map((a) => ({
      lat: a.lat,
      lon: a.lon,
      name: a.name,
      country: a.country,
      region: a.state,
    }));
  } catch {
    return [];
  }
}
