import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getWeatherPayload } from "@/lib/weather";
import { readWeatherCache, writeWeatherCache } from "@/lib/cache";
import { reverseGeocode } from "@/lib/geolocation";
import type { WeatherPayload } from "@/types/weather.types";

export const runtime = "nodejs";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  name: z.string().optional(),
  minimal: z
    .string()
    .optional()
    .transform((v) => v === "1" || v === "true"),
});

export async function GET(req: NextRequest) {
  const params = querySchema.safeParse({
    lat: req.nextUrl.searchParams.get("lat"),
    lon: req.nextUrl.searchParams.get("lon"),
    name: req.nextUrl.searchParams.get("name") || undefined,
    minimal: req.nextUrl.searchParams.get("minimal") ?? undefined,
  });
  if (!params.success) {
    return NextResponse.json({ error: params.error.flatten() }, { status: 400 });
  }
  const { lat, lon, name, minimal } = params.data;

  const cached = await readWeatherCache(lat, lon);
  if (cached) {
    const merged = {
      ...(cached.currentData as Partial<WeatherPayload>),
      ...(cached.forecastData as Partial<WeatherPayload>),
      cached: true,
    } satisfies Partial<WeatherPayload> & { cached: boolean };

    if (minimal) {
      const nextPopMax = merged.hourly
        ?.slice(0, 12)
        .reduce((m, h) => Math.max(m, h.pop ?? 0), 0);

      return NextResponse.json({
        cached: merged.cached,
        fetchedAt: merged.fetchedAt ?? Date.now(),
        location: {
          name: merged.location?.name ?? "Unknown",
          lat: merged.location?.lat ?? lat,
          lon: merged.location?.lon ?? lon,
          timezone: merged.location?.timezone,
          country: merged.location?.country,
        },
        current: {
          temp: merged.current!.temp,
          feelsLike: merged.current!.feelsLike,
          condition: merged.current!.condition,
          conditionMain: merged.current!.conditionMain,
          iconCode: merged.current!.iconCode,
        },
        nextPopMax,
      });
    }

    return NextResponse.json({
      ...(cached.currentData as Partial<WeatherPayload>),
      ...(cached.forecastData as Partial<WeatherPayload>),
      cached: true,
    });
  }

  let resolvedName = name;
  if (!resolvedName) {
    const rev = await reverseGeocode(lat, lon);
    resolvedName = rev?.name;
  }

  const payload = await getWeatherPayload(lat, lon, resolvedName);
  await writeWeatherCache(
    lat,
    lon,
    payload.location.name,
    { location: payload.location, current: payload.current, airQuality: payload.airQuality },
    {
      hourly: payload.hourly,
      daily: payload.daily,
      historical: payload.historical,
      unit: payload.unit,
      source: payload.source,
      fetchedAt: payload.fetchedAt,
    },
  );

  if (minimal) {
    const nextPopMax = payload.hourly
      .slice(0, 12)
      .reduce((m, h) => Math.max(m, h.pop ?? 0), 0);
    return NextResponse.json({
      cached: false,
      fetchedAt: payload.fetchedAt,
      location: {
        name: payload.location.name,
        lat: payload.location.lat,
        lon: payload.location.lon,
        timezone: payload.location.timezone,
        country: payload.location.country,
      },
      current: {
        temp: payload.current.temp,
        feelsLike: payload.current.feelsLike,
        condition: payload.current.condition,
        conditionMain: payload.current.conditionMain,
        iconCode: payload.current.iconCode,
      },
      nextPopMax,
    });
  }

  return NextResponse.json({ ...payload, cached: false });
}
