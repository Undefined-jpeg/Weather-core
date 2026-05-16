"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { AlertDeltaToast } from "@/components/alerts/AlertDeltaToast";
import { OfflineRibbon } from "@/components/nav/OfflineRibbon";
import { useUserStore } from "@/stores/useUserStore";
import { useWeather } from "@/hooks/useWeather";
import { useLocation } from "@/hooks/useLocation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { accentForCondition } from "@/lib/formatters";

export function ClientShell({ children }: { children: ReactNode }) {
  useLocation();
  const loc = useUserStore((s) => s.currentLocation);
  const { data } = useWeather(loc?.lat, loc?.lon);
  const condition = data?.current?.conditionMain;
  const iconCode = data?.current?.iconCode;
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    const isNight = iconCode?.endsWith("n") ?? false;
    const palette = accentForCondition(condition, isNight);
    root.style.setProperty("--color-primary", palette.primary);
    root.style.setProperty("--color-light", palette.light);
    return () => {
      root.style.removeProperty("--color-primary");
      root.style.removeProperty("--color-light");
    };
  }, [condition, iconCode]);

  useEffect(() => {
    const root = document.documentElement;
    if (reduced) root.classList.add("reduce-motion");
    else root.classList.remove("reduce-motion");
    return () => root.classList.remove("reduce-motion");
  }, [reduced]);

  return (
    <>
      <AnimatedBackground
        condition={condition}
        iconCode={iconCode}
        reduced={reduced}
      />
      <OfflineRibbon />
      {children}
      <AlertDeltaToast />
    </>
  );
}
