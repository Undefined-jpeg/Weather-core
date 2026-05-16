import { db } from "@/db";
import { aiAnalysisCache, weatherCache } from "@/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

const WEATHER_TTL_MS = 10 * 60 * 1000;
const AI_TTL_MS = 6 * 60 * 60 * 1000;

function roundCoord(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function readWeatherCache(lat: number, lon: number) {
  const rLat = roundCoord(lat);
  const rLon = roundCoord(lon);
  try {
    const rows = await db
      .select()
      .from(weatherCache)
      .where(
        and(
          eq(weatherCache.lat, rLat),
          eq(weatherCache.lon, rLon),
          gt(weatherCache.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function writeWeatherCache(
  lat: number,
  lon: number,
  locationName: string | null,
  currentData: unknown,
  forecastData: unknown,
) {
  const rLat = roundCoord(lat);
  const rLon = roundCoord(lon);
  try {
    await db
      .delete(weatherCache)
      .where(and(eq(weatherCache.lat, rLat), eq(weatherCache.lon, rLon)));
    await db.insert(weatherCache).values({
      lat: rLat,
      lon: rLon,
      locationName,
      currentData: currentData as object,
      forecastData: forecastData as object,
      expiresAt: new Date(Date.now() + WEATHER_TTL_MS),
    });
  } catch {
    // swallow — caching is non-critical
  }
}

export async function readAiCache(key: string) {
  try {
    const rows = await db
      .select()
      .from(aiAnalysisCache)
      .where(
        and(
          eq(aiAnalysisCache.locationKey, key),
          gt(aiAnalysisCache.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function writeAiCache(key: string, text: string) {
  try {
    await db
      .insert(aiAnalysisCache)
      .values({
        locationKey: key,
        analysisText: text,
        expiresAt: new Date(Date.now() + AI_TTL_MS),
      })
      .onConflictDoUpdate({
        target: aiAnalysisCache.locationKey,
        set: {
          analysisText: text,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + AI_TTL_MS),
        },
      });
  } catch {
    // swallow
  }
}

export async function purgeExpiredAiCache() {
  try {
    await db
      .delete(aiAnalysisCache)
      .where(sql`${aiAnalysisCache.expiresAt} < NOW()`);
  } catch {
    // ignore
  }
}
