import { NextRequest, NextResponse } from "next/server";
import { forwardGeocode } from "@/lib/geolocation";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const results = await forwardGeocode(q);
  return NextResponse.json({ results });
}
