import { NextResponse } from "next/server";
import {
  getActiveHurricanes,
  getAllActiveAlerts,
  alertsToDisasterEvents,
  getReliefWebDisasters,
} from "@/lib/noaa";
import { db } from "@/db";
import { disasterEvents } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { DisasterEvent, DisasterType } from "@/types/disaster.types";

export const runtime = "nodejs";

export async function GET() {
  const [alertsRes, hurricaneRes, reliefRes] = await Promise.allSettled([
    getAllActiveAlerts(),
    getActiveHurricanes(),
    getReliefWebDisasters(),
  ]);

  const alerts = alertsRes.status === "fulfilled" ? alertsRes.value : [];
  const hurricanes = hurricaneRes.status === "fulfilled" ? hurricaneRes.value : [];
  const relief = reliefRes.status === "fulfilled" ? reliefRes.value : [];

  const fromAlerts: DisasterEvent[] = alertsToDisasterEvents(alerts);
  const events: DisasterEvent[] = [
    ...hurricanes.map<DisasterEvent>((h) => ({ ...h })),
    ...relief,
    ...fromAlerts,
  ];

  try {
    await db.execute(sql`UPDATE ${disasterEvents} SET is_active = false WHERE updated_at < NOW() - INTERVAL '6 hours'`);
    for (const ev of events) {
      if (!ev.lat || !ev.lon) continue;
      await db
        .insert(disasterEvents)
        .values({
          externalId: ev.id,
          type: ev.type,
          name: ev.name,
          severity: ev.severity,
          lat: ev.lat,
          lon: ev.lon,
          radius: ev.radius ?? null,
          description: ev.description,
          sourceUrl: ev.sourceUrl,
          isActive: true,
          startedAt: ev.startedAt ? new Date(ev.startedAt) : null,
          rawData: ev as unknown as object,
        })
        .onConflictDoUpdate({
          target: disasterEvents.externalId,
          set: {
            severity: ev.severity,
            description: ev.description,
            lat: ev.lat,
            lon: ev.lon,
            isActive: true,
            updatedAt: new Date(),
            rawData: ev as unknown as object,
          },
        })
        .catch(() => {});
    }
  } catch {
    // tolerate DB errors
  }

  const counts: Record<DisasterType, number> = {
    hurricane: 0,
    tornado: 0,
    flood: 0,
    blizzard: 0,
    wildfire: 0,
    earthquake: 0,
    tsunami: 0,
    drought: 0,
    volcano: 0,
    "severe-thunderstorm": 0,
    "winter-storm": 0,
    "tropical-storm": 0,
  };
  for (const e of events) counts[e.type] = (counts[e.type] ?? 0) + 1;

  return NextResponse.json({ events, hurricanes, counts, fetchedAt: Date.now() });
}
