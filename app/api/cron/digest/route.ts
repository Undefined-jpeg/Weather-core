import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";

async function digestBodyForLocation(
  base: string,
  lat: number,
  lon: number,
  name: string,
): Promise<string> {
  const w = await fetch(`${base}/api/weather?lat=${lat}&lon=${lon}&minimal=1`, {
    next: { revalidate: 0 },
    cache: "no-store",
  });
  let weatherLine = `${name}`;
  if (w.ok) {
    const j = (await w.json()) as {
      current?: { temp?: number };
      cached?: boolean;
      nextPopMax?: number;
    };
    weatherLine = `${name}: ${Math.round(j.current?.temp ?? 0)}°C model · pop≤12h ~${Math.round((j.nextPopMax ?? 0) * 100)}%${j.cached ? " (cached tier)" : ""}`;
  }

  const a = await fetch(`${base}/api/alerts?lat=${lat}&lon=${lon}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  let alertsLine = "No headline alerts fetched.";
  if (a.ok) {
    const j = (await a.json()) as { alerts?: Array<{ event?: string }> };
    const n = j.alerts?.length ?? 0;
    alertsLine =
      n === 0 ? "Local NWS: no headline warnings in feed." : `Local NWS: ${n} active item(s)`;
    if (n > 0 && j.alerts?.[0]) {
      alertsLine += ` (${j.alerts[0].event})`;
    }
  }

  return `${weatherLine}\n${alertsLine}`;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHdr = req.headers.get("authorization")?.trim() ?? "";
  const token = /^Bearer\s+(.+)$/i.exec(authHdr)?.[1]?.trim();
  if (!cronSecret || token !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const baseRaw =
    process.env.AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (!resendKey || !emailFrom || !baseRaw) {
    return NextResponse.json({ error: "Missing email/env config" }, { status: 500 });
  }

  const base = baseRaw.replace(/\/$/, "");
  const resend = new Resend(resendKey);

  const subs = await db
    .select()
    .from(users)
    .where(eq(users.digestEmailEnabled, true));

  let delivered = 0;

  for (const u of subs) {
    if (!u.email || !u.digestUnsubscribeToken) continue;
    const locs = (u.savedLocations ?? []) as { name: string; lat: number; lon: number }[];
    const spot = locs[0];
    if (!spot) continue;

    try {
      const text = await digestBodyForLocation(base, spot.lat, spot.lon, spot.name);
      const unsub = `${base}/api/digest/unsubscribe?token=${encodeURIComponent(u.digestUnsubscribeToken)}`;

      await resend.emails.send({
        from: emailFrom,
        to: u.email,
        subject: `WeatherCore digest • ${spot.name}`,
        html: `<pre style="font-family:ui-monospace,Menlo,monospace">${text.replace(/</g, "&lt;")}</pre><p><a href="${unsub}">Unsubscribe digest</a></p>`,
        text: `${text}\n\nUnsubscribe: ${unsub}`,
      });

      await db
        .update(users)
        .set({ lastDigestSentAt: new Date() })
        .where(eq(users.id, u.id));

      delivered++;
    } catch {
      /** skip user */
    }
  }

  return NextResponse.json({ ok: true, recipients: delivered });
}
