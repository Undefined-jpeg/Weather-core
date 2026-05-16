import type { ReactNode } from "react";
import Image from "next/image";
import { TopNav } from "@/components/nav/TopNav";
import { BottomTabBar } from "@/components/nav/BottomTabBar";
import { CommandPalette } from "@/components/nav/CommandPalette";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import { ClientShell } from "./_shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ClientShell>
      <TopNav />
      <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-4 md:px-6 md:pb-12 md:pt-6">
        {children}
        <footer className="mt-14 flex justify-center border-t border-[rgba(180,192,217,0.08)] pt-10 pb-2 md:mt-16 md:pt-12">
          <Image
            src="/branding/weathercore-banner.png"
            alt="WeatherCore — Atmospheric Intelligence"
            width={680}
            height={280}
            className="h-auto max-h-14 w-auto max-w-[min(100%,520px)] object-contain opacity-90 md:max-h-[4.25rem]"
          />
        </footer>
      </main>
      <BottomTabBar />
      <CommandPalette />
      <PWAInstallPrompt />
    </ClientShell>
  );
}
