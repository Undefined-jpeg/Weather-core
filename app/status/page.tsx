import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  let database = "offline";
  try {
    await db.execute(sql`select 1`);
    database = "ok";
  } catch {
    database = "offline";
  }

  const gemini = process.env.GEMINI_API_KEY ? "configured" : "missing_server_key";

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 bg-[color:var(--color-bg-dark)] px-6 py-16 text-[color:var(--color-text-primary)]">
      <h1 className="text-xl font-semibold">WeatherCore status</h1>
      <p className="text-sm text-[color:var(--color-text-muted)]">
        Lightweight health signals for uptime checks. Synthetic DB ping runs on every view.
      </p>
      <ul className="space-y-2 rounded-2xl border border-[rgba(180,192,217,0.15)] bg-[rgba(42,52,72,0.45)] px-5 py-4 text-sm">
        <li>
          Postgres / Neon:&nbsp;
          <span className="font-mono">{database}</span>
        </li>
        <li>
          Gemini key present:&nbsp;
          <span className="font-mono">{gemini}</span>
        </li>
      </ul>
      <Link
        href="/"
        className="text-sm text-[color:var(--color-light)] underline underline-offset-4 hover:text-[color:var(--color-text-primary)]"
      >
        Back to WeatherCore
      </Link>
    </main>
  );
}
