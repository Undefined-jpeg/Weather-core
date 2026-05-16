"use client";

import { useEffect, useState } from "react";

function hasConsentCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("wc_analytics=1");
}

function setConsent(enabled: boolean) {
  const maxAge = 60 * 60 * 24 * 395;
  if (enabled) {
    document.cookie = `wc_analytics=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie =
      "wc_analytics=0; Path=/; Max-Age=0; SameSite=Lax";
  }
}

function privacyNoTrack(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return (
    nav.doNotTrack === "1" ||
    nav.globalPrivacyControl === true
  );
}

export function AnalyticsAndConsentShell() {
  const domain =
    typeof process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN === "string"
      ? process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN.trim()
      : "";

  const [visible, setVisible] = useState(false);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!domain || privacyNoTrack()) return;
    if (document.cookie.includes("wc_analytics=0")) {
      setVisible(false);
      return;
    }
    if (document.cookie.includes("wc_analytics=1")) {
      setConsented(true);
      return;
    }
    setVisible(true);
  }, [domain]);

  useEffect(() => {
    if (!domain || typeof document === "undefined") return;
    if (!consented || privacyNoTrack() || !hasConsentCookie()) return;
    const s = document.createElement("script");
    s.defer = true;
    s.dataset.domain = domain;
    s.src = "https://plausible.io/js/script.js";
    document.head.appendChild(s);
    return () => {
      s.remove();
    };
  }, [domain, consented]);

  function accept() {
    setConsent(true);
    setConsented(true);
    setVisible(false);
  }

  function decline() {
    setConsent(false);
    setConsented(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-28 left-3 right-3 z-[100] max-h-[220px] overflow-y-auto rounded-2xl bg-[rgba(30,36,53,0.97)] p-4 text-xs shadow-2xl ring-1 ring-[rgba(180,192,217,0.2)] backdrop-blur-xl md:right-auto md:w-[340px]">
      <p className="font-medium text-[color:var(--color-text-primary)]">Analytics</p>
      <p className="mt-2 text-[color:var(--color-text-muted)]">
        Optional telemetry via Plausible (no cookies unless you consent).
        NEXT_PUBLIC_PLAUSIBLE_DOMAIN must match your site hostname in Plausible.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={accept}
          className="flex-1 rounded-lg bg-[color:var(--color-primary)]/50 py-2 text-[11px] font-medium ring-1 ring-[color:var(--color-light)]/30"
        >
          Accept analytics
        </button>
        <button
          type="button"
          onClick={decline}
          className="rounded-lg px-3 py-2 text-[11px] text-[color:var(--color-text-muted)] ring-1 ring-[rgba(180,192,217,0.15)] hover:text-[color:var(--color-text-primary)]"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
