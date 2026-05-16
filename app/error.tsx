"use client";

import { useEffect } from "react";
import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-[rgba(180,192,217,0.18)] bg-[rgba(30,36,53,0.6)] p-8 text-center backdrop-blur-xl">
        <AlertOctagon className="mx-auto h-10 w-10 text-[color:var(--color-warning)]" />
        <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          {error.message || "Unexpected error."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-[color:var(--color-primary)]/40 px-4 py-2 text-sm ring-1 ring-[color:var(--color-light)]/30 hover:bg-[color:var(--color-primary)]/60"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
