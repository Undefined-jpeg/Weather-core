"use client";

import { useState } from "react";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sparkles, RefreshCw } from "lucide-react";

function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.*)$/gm, '<h3 class="mt-4 text-base font-semibold text-[color:var(--color-light)]">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/^/, "<p>")
    .concat("</p>");
}

export function AIDisasterBriefing() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(regenerate = false) {
    setLoading(true);
    setText("");
    setError(null);
    try {
      const res = await fetch(
        `/api/ai-analysis/disaster${regenerate ? "?regenerate=1" : ""}`,
        { method: "POST" },
      );
      if (!res.ok) {
        setError(`AI unavailable (${res.status})`);
        setLoading(false);
        return;
      }
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        setText((t) => t + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard variant="strong">
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[color:var(--color-light)]" />
          Global disaster briefing
        </GlassCardTitle>
        {text && (
          <button
            type="button"
            onClick={() => generate(true)}
            disabled={loading}
            className="rounded-lg p-1.5 text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.08)] hover:text-[color:var(--color-text-primary)] disabled:opacity-50"
            title="Regenerate"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </GlassCardHeader>
      {!text && !loading && !error && (
        <button
          type="button"
          onClick={() => generate(false)}
          className="rounded-xl bg-[color:var(--color-primary)]/40 px-4 py-2 text-sm font-medium ring-1 ring-[color:var(--color-light)]/30 transition hover:bg-[color:var(--color-primary)]/60"
        >
          Generate briefing
        </button>
      )}
      {error && (
        <p className="text-sm text-[color:var(--color-warning)]">{error}</p>
      )}
      {loading && !text && (
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      )}
      {text && (
        <div
          className={`prose-sm max-w-none text-sm leading-relaxed text-[color:var(--color-text-primary)] [&_p]:my-2 ${loading ? "typewriter-cursor" : ""}`}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
        />
      )}
    </GlassCard>
  );
}
