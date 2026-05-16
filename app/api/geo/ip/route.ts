import { NextResponse } from "next/server";
import { getLocationFromIp } from "@/lib/geolocation";

export const runtime = "nodejs";

export async function GET() {
  const loc = await getLocationFromIp();
  if (!loc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(loc);
}
