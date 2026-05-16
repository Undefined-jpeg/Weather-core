import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { disasterEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { streamDisasterBriefing } from "@/lib/gemini";
import { checkAndRecord, getClientIp } from "@/lib/rateLimit";
import { readAiCache, writeAiCache } from "@/lib/cache";
import type { DisasterEvent } from "@/types/disaster.types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const regenerate = url.searchParams.get("regenerate") === "1";

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const cacheKey = "disaster-brief:global";
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
    bucketKey: "ai-disaster",
    bucketSuffix: userId ? undefined : getClientIp(req),
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const rows = await db
    .select()
    .from(disasterEvents)
    .where(eq(disasterEvents.isActive, true))
    .limit(80)
    .catch(() => []);

  const events: DisasterEvent[] = rows.map((r) => ({
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
  }));

  const stream = await streamDisasterBriefing(events);
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
