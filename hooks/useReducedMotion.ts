"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";

export function useReducedMotion(): boolean {
  const store = useUserStore((s) => s.reducedMotion);
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefers(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return store || prefers;
}
