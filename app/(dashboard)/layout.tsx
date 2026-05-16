import type { ReactNode } from "react";
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
      </main>
      <BottomTabBar />
      <CommandPalette />
      <PWAInstallPrompt />
    </ClientShell>
  );
}
