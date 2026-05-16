import { db } from "@/db";
import { aiRateLimit } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

const HOURLY_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

interface CheckArgs {
  userId: string | null;
  bucketKey: string;
  bucketSuffix?: string;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkAndRecord({
  userId,
  bucketKey,
  bucketSuffix,
}: CheckArgs): Promise<RateLimitResult> {
  const since = new Date(Date.now() - WINDOW_MS);
  const effectiveBucket = bucketSuffix
    ? `${bucketKey}:${bucketSuffix}`
    : bucketKey;

  try {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiRateLimit)
      .where(
        and(
          userId
            ? eq(aiRateLimit.userId, userId)
            : eq(aiRateLimit.bucketKey, effectiveBucket),
          gte(aiRateLimit.requestedAt, since),
        ),
      );

    const used = rows[0]?.count ?? 0;
    if (used >= HOURLY_LIMIT) {
      return {
        ok: false,
        remaining: 0,
        resetAt: Date.now() + WINDOW_MS,
      };
    }

    await db.insert(aiRateLimit).values({
      userId: userId ?? null,
      bucketKey: effectiveBucket,
    });

    return {
      ok: true,
      remaining: HOURLY_LIMIT - used - 1,
      resetAt: Date.now() + WINDOW_MS,
    };
  } catch {
    return { ok: true, remaining: HOURLY_LIMIT, resetAt: Date.now() + WINDOW_MS };
  }
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
