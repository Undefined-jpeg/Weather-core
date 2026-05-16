"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
import { useUserStore } from "@/stores/useUserStore";

const DISMISS_KEY = "wc-pwa-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone,
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isAppleMobile = /iPhone|iPad|iPod/.test(ua);
  const isIPadOS =
    navigator.maxTouchPoints > 1 && /Macintosh/.test(ua);
  return isAppleMobile || isIPadOS;
}

export function PWAInstallPrompt() {
  const suppressGlobally = useUserStore((s) => s.suppressInstallPrompt);
  const [event, setEvent] = useState<BIPEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (suppressGlobally) return;
    if (isStandalone()) return;
    const stored = localStorage.getItem(DISMISS_KEY);
    if (stored && Date.now() - Number(stored) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }
    setDismissed(false);

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (isIOS()) {
      setTimeout(() => setShowIOS(true), 4000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [suppressGlobally]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
    setEvent(null);
    setShowIOS(false);
  }

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") dismiss();
  }

  if (dismissed) return null;

  const visible = Boolean(event) || showIOS;
  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed bottom-20 right-4 z-40 max-w-[320px] rounded-2xl bg-[rgba(30,36,53,0.96)] p-4 shadow-2xl ring-1 ring-[rgba(180,192,217,0.18)] backdrop-blur-xl md:bottom-6 md:right-6"
        role="dialog"
        aria-label="Install WeatherCore"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-2 top-2 rounded-full p-1 text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.08)] hover:text-[color:var(--color-text-primary)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {event ? (
          <>
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color:var(--color-primary)]/30 ring-1 ring-[color:var(--color-light)]/30">
                <Download className="h-5 w-5 text-[color:var(--color-light)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Install WeatherCore</p>
                <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
                  Get a faster, offline-capable app on your home screen.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={install}
              className="mt-3 w-full rounded-lg bg-[color:var(--color-primary)]/50 px-3 py-2 text-sm font-medium ring-1 ring-[color:var(--color-light)]/40 transition hover:bg-[color:var(--color-primary)]/70"
            >
              Install
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color:var(--color-primary)]/30 ring-1 ring-[color:var(--color-light)]/30">
                <Smartphone className="h-5 w-5 text-[color:var(--color-light)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Add to Home Screen</p>
                <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
                  Tap{" "}
                  <span className="inline-block rounded bg-[rgba(180,192,217,0.15)] px-1 py-0.5">
                    Share
                  </span>{" "}
                  then{" "}
                  <span className="inline-block rounded bg-[rgba(180,192,217,0.15)] px-1 py-0.5">
                    Add to Home Screen
                  </span>{" "}
                  in Safari.
                </p>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
