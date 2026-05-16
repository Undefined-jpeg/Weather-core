import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse("Missing token.", { status: 400 });
  }

  await db
    .update(users)
    .set({ digestEmailEnabled: false, digestUnsubscribeToken: null })
    .where(eq(users.digestUnsubscribeToken, token));

  return new NextResponse(
    "You're unsubscribed from WeatherCore email digests. You can opt in again from Settings.",
    { status: 200, headers: { "Content-Type": "text/plain;charset=utf-8" } },
  );
}
