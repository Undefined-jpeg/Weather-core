import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActiveAlertsByPoint } from "@/lib/noaa";

export const runtime = "nodejs";

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse({
    lat: req.nextUrl.searchParams.get("lat"),
    lon: req.nextUrl.searchParams.get("lon"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const alerts = await getActiveAlertsByPoint(parsed.data.lat, parsed.data.lon);
  return NextResponse.json({ alerts, fetchedAt: Date.now() });
}
