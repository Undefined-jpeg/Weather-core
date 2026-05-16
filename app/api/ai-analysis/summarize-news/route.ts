import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { summarizeNewsArticle } from "@/lib/gemini";
import { readAiCache, writeAiCache } from "@/lib/cache";
import { checkAndRecord, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

const schema = z.object({
  headline: z.string().min(1).max(500),
  source: z.string().min(1).max(200),
  url: z.string().url(),
  excerpt: z.string().max(2000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { headline, source, url, excerpt } = parsed.data;

  const cacheKey = `news-summary:${url}`;
  const cached = await readAiCache(cacheKey);
  if (cached) {
    return NextResponse.json({ summary: cached.analysisText, cached: true });
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const rl = await checkAndRecord({
    userId,
    bucketKey: "ai-news",
    bucketSuffix: userId ? undefined : getClientIp(req),
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const summary = await summarizeNewsArticle(headline, source, excerpt ?? null);
  await writeAiCache(cacheKey, summary);
  return NextResponse.json({ summary, cached: false });
}
