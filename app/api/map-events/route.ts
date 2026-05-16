import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { disasterEvents } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { haversineKm } from "@/lib/utils";

export const runtime = "nodejs";

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(20000).default(500),
});

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse({
    lat: req.nextUrl.searchParams.get("lat"),
    lon: req.nextUrl.searchParams.get("lon"),
    radius: req.nextUrl.searchParams.get("radius") || 500,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { lat, lon, radius } = parsed.data;

  const rows = await db
    .select()
    .from(disasterEvents)
    .where(eq(disasterEvents.isActive, true))
    .limit(500)
    .catch(() => []);

  const events = rows
    .map((r) => ({ row: r, distance: haversineKm(lat, lon, r.lat, r.lon) }))
    .filter((x) => x.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .map(({ row, distance }) => ({
      id: row.id,
      externalId: row.externalId,
      type: row.type,
      name: row.name,
      severity: row.severity,
      lat: row.lat,
      lon: row.lon,
      radius: row.radius,
      description: row.description,
      sourceUrl: row.sourceUrl,
      isActive: row.isActive,
      startedAt: row.startedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
      distanceKm: Math.round(distance),
    }));

  return NextResponse.json({ events, fetchedAt: Date.now() });
}
