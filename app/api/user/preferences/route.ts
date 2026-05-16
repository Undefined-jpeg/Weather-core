import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, type SavedLocation } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const updateSchema = z.object({
  unit: z.enum(["metric", "imperial"]).optional(),
  savedLocations: z
    .array(
      z.object({
        name: z.string(),
        lat: z.number(),
        lon: z.number(),
        country: z.string().optional(),
      }),
    )
    .max(5)
    .optional(),
  digestEmailEnabled: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({
      preferredUnit: users.preferredUnit,
      savedLocations: users.savedLocations,
      digestEmailEnabled: users.digestEmailEnabled,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  return NextResponse.json(
    rows[0] ?? { preferredUnit: "metric", savedLocations: [], digestEmailEnabled: false },
  );
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as unknown;
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.digestEmailEnabled === true) {
    const row = await db
      .select({ token: users.digestUnsubscribeToken })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    const token = row[0]?.token ?? randomUUID();
    await db
      .update(users)
      .set({ digestEmailEnabled: true, digestUnsubscribeToken: token })
      .where(eq(users.id, session.user.id));
  } else if (parsed.data.digestEmailEnabled === false) {
    await db
      .update(users)
      .set({
        digestEmailEnabled: false,
        digestUnsubscribeToken: null,
      })
      .where(eq(users.id, session.user.id));
  }

  const updates: Partial<{
    preferredUnit: string;
    savedLocations: SavedLocation[];
  }> = {};
  if (parsed.data.unit) updates.preferredUnit = parsed.data.unit;
  if (parsed.data.savedLocations) updates.savedLocations = parsed.data.savedLocations;

  if (Object.keys(updates).length > 0) {
    await db.update(users).set(updates).where(eq(users.id, session.user.id));
  }

  return NextResponse.json({ ok: true });
}
