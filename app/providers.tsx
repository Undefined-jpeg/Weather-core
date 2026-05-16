"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { AnalyticsAndConsentShell } from "@/components/ui/AnalyticsAndConsent";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
            networkMode: "always",
          },
        },
      }),
  );
  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        {children}
        <AnalyticsAndConsentShell />
      </QueryClientProvider>
    </SessionProvider>
  );
}
