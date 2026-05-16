"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useAlerts } from "@/hooks/useAlerts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { locationKey } from "@/lib/weather";

const LS_PREFIX = "wc:last-alert-ids:";

export function AlertDeltaToast() {
  const loc = useUserStore((s) => s.currentLocation);
  const reduced = useReducedMotion();
  const alerts = useAlerts(loc?.lat, loc?.lon);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [plural, setPlural] = useState(false);

  useEffect(() => {
    setOpen(false);
    setMessage(null);
  }, [loc?.lat, loc?.lon]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !loc ||
      alerts.isLoading ||
      !alerts.data
    ) {
      return;
    }

    const lk = locationKey(loc.lat, loc.lon);
    const storageKey = LS_PREFIX + lk;
    const incoming = alerts.data.map((a) => a.id).sort();
    const serialized = JSON.stringify(incoming);

    const prevRaw = window.localStorage.getItem(storageKey);
    if (!prevRaw) {
      window.localStorage.setItem(storageKey, serialized);
      return;
    }

    let prevArr: string[] = [];
    try {
      prevArr = JSON.parse(prevRaw) as string[];
    } catch {
      prevArr = [];
    }
    const prevSet = new Set(prevArr);

    const newOnes = alerts.data.filter((a) => !prevSet.has(a.id));
    if (newOnes.length === 0) {
      return;
    }

    const first = newOnes[0];
    const line =
      newOnes.length === 1
        ? `${first?.event ?? "Alert"} · ${truncate(first?.headline ?? "", 80)}`
        : `${newOnes.length} new NWS alerts (${first?.event ?? "severe weather"}…)`;

    setMessage(line);
    setPlural(newOnes.length > 1);
    setOpen(true);
    window.localStorage.setItem(storageKey, serialized);
  }, [loc, alerts.data, alerts.dataUpdatedAt, alerts.isLoading]);

  function dismiss() {
    setOpen(false);
    setMessage(null);
  }

  if (!loc) return null;

  return (
    <AnimatePresence>
      {open && message && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            y: reduced ? 0 : 12,
          }}
          transition={
            reduced ? { duration: 0.08 } : { type: "spring", stiffness: 360, damping: 28 }
          }
          className="fixed bottom-[5.25rem] left-4 right-4 z-[95] md:bottom-6 md:left-auto md:right-6 md:max-w-md"
          role="status"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-[rgba(180,192,217,0.2)] bg-[rgba(30,36,53,0.96)] p-4 shadow-xl backdrop-blur-xl">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-warning)]" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-warning)]">
                {plural ? "New NWS alerts" : "New NWS alert"}
              </p>
              <p className="mt-1 text-sm text-[color:var(--color-text-primary)]">
                {message}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/alerts"
                  onClick={dismiss}
                  className="inline-flex rounded-lg bg-[color:var(--color-primary)]/45 px-3 py-1.5 text-xs font-medium ring-1 ring-[color:var(--color-light)]/30 hover:bg-[color:var(--color-primary)]/60"
                >
                  View alerts
                </Link>
                <button
                  type="button"
                  onClick={dismiss}
                  className="text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={dismiss}
              className="shrink-0 rounded-full p-1 text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.08)] hover:text-[color:var(--color-text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function truncate(s: string, len: number) {
  if (s.length <= len) return s;
  return s.slice(0, len).trimEnd() + "…";
}
