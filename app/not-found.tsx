import Link from "next/link";
import { CloudOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-[rgba(180,192,217,0.18)] bg-[rgba(30,36,53,0.6)] p-8 text-center backdrop-blur-xl">
        <CloudOff className="mx-auto h-10 w-10 text-[color:var(--color-light)]" />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Lost in the clouds</h2>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          We couldn&apos;t find that page.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-xl bg-[color:var(--color-primary)]/40 px-4 py-2 text-sm ring-1 ring-[color:var(--color-light)]/30 hover:bg-[color:var(--color-primary)]/60"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
