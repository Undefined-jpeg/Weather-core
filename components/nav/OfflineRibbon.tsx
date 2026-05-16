"use client";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineRibbon() {
  const online = useNetworkStatus();

  if (online) return null;

  return (
    <div className="border-b border-[rgba(192,57,43,0.35)] bg-[rgba(192,57,43,0.12)] px-4 py-1.5 text-center text-[11px] text-[color:var(--color-danger)]">
      You&apos;re offline. Showing cached dashboard data where the service worker has it.
    </div>
  );
}
