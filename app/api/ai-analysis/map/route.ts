import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { disasterEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { haversineKm } from "@/lib/utils";
import { streamMapBriefing } from "@/lib/gemini";
import { checkAndRecord, getClientIp } from "@/lib/rateLimit";
import { readAiCache, writeAiCache } from "@/lib/cache";
import type { DisasterEvent } from "@/types/disaster.types";

export const runtime = "nodejs";

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  regenerate: z.coerce.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { lat, lon, regenerate } = parsed.data;

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const cacheKey = `map-brief:${lat.toFixed(1)},${lon.toFixed(1)}`;
  if (!regenerate) {
    const cached = await readAiCache(cacheKey);
    if (cached) {
      return new Response(cached.analysisText, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Cache": "HIT" },
      });
    }
  }

  const rl = await checkAndRecord({
    userId,
    bucketKey: "ai-map",
    bucketSuffix: userId ? undefined : getClientIp(req),
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const rows = await db
    .select()
    .from(disasterEvents)
    .where(eq(disasterEvents.isActive, true))
    .limit(200)
    .catch(() => []);

  const nearby: DisasterEvent[] = rows
    .map((r) => ({
      id: r.id,
      type: r.type as DisasterEvent["type"],
      name: r.name,
      severity: r.severity as DisasterEvent["severity"],
      lat: r.lat,
      lon: r.lon,
      radius: r.radius,
      description: r.description,
      sourceUrl: r.sourceUrl,
      isActive: r.isActive,
      startedAt: r.startedAt?.toISOString() ?? null,
      updatedAt: r.updatedAt.toISOString(),
      distance: haversineKm(lat, lon, r.lat, r.lon),
    }))
    .filter((r) => r.distance < 500)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10);

  const stream = await streamMapBriefing(lat, lon, nearby);

  let collected = "";
  const decoder = new TextDecoder();
  const tee = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      collected += decoder.decode(chunk, { stream: true });
      controller.enqueue(chunk);
    },
    async flush() {
      if (collected) await writeAiCache(cacheKey, collected);
    },
  });

  return new Response(stream.pipeThrough(tee), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Cache": "MISS" },
  });
}
