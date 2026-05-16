import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getWeatherPayload, locationKey } from "@/lib/weather";
import { streamWeatherAnalysis } from "@/lib/gemini";
import { readAiCache, writeAiCache } from "@/lib/cache";
import { checkAndRecord, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  regenerate: z.coerce.boolean().optional(),
  verbosity: z.enum(["short", "standard", "long"]).optional(),
});

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { lat, lon, regenerate, verbosity = "standard" } = parsed.data;

  const key = `analysis:v:${verbosity}:${locationKey(lat, lon)}`;

  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (!regenerate) {
    const cached = await readAiCache(key);
    if (cached) {
      return new Response(cached.analysisText, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Cache": "HIT",
        },
      });
    }
  }

  const rl = await checkAndRecord({
    userId,
    bucketKey: "ai-analysis",
    bucketSuffix: userId ? undefined : getClientIp(req),
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded — try again later.", resetAt: rl.resetAt },
      { status: 429 },
    );
  }

  const payload = await getWeatherPayload(lat, lon);
  const stream = await streamWeatherAnalysis(payload, verbosity);

  let collected = "";
  const decoder = new TextDecoder();
  const tee = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      collected += decoder.decode(chunk, { stream: true });
      controller.enqueue(chunk);
    },
    async flush() {
      const isError =
        collected.startsWith("AI analysis is") ||
        collected.startsWith("AI analysis unavailable");
      if (collected && !isError) await writeAiCache(key, collected);
    },
  });

  return new Response(stream.pipeThrough(tee), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Cache": "MISS",
      "X-RateLimit-Remaining": String(rl.remaining),
    },
  });
}
