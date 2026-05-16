"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const allowDevSw = process.env.NEXT_PUBLIC_ENABLE_SW_DEV === "1";
    if (process.env.NODE_ENV !== "production" && !allowDevSw) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
