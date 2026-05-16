import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getWeekYearOverYearCompare } from "@/lib/weather";

export const runtime = "nodejs";

const qs = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export async function GET(req: NextRequest) {
  const parsed = qs.safeParse({
    lat: req.nextUrl.searchParams.get("lat"),
    lon: req.nextUrl.searchParams.get("lon"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const result = await getWeekYearOverYearCompare(parsed.data.lat, parsed.data.lon);
  if (!result) return NextResponse.json({ error: "no_data" }, { status: 404 });
  return NextResponse.json(result);
}
