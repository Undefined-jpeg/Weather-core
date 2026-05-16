import type { ReactNode } from "react";

/** Minimal chrome for dock / Shortcut windows. */
export default function WidgetRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[color:var(--color-bg-dark)] text-[color:var(--color-text-primary)]">
      {children}
    </div>
  );
}
