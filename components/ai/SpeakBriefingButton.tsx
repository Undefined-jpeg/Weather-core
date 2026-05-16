"use client";

import { Volume2 } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

interface SpeakBriefingButtonProps {
  text: string;
  className?: string;
}

export function SpeakBriefingButton({ text, className = "" }: SpeakBriefingButtonProps) {
  const reducedMotion = useUserStore((s) => s.reducedMotion);

  function stripForSpeech(raw: string) {
    return raw
      .replace(/^#{1,6}\s+.*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  function speak() {
    const plain = stripForSpeech(text);
    if (!plain || typeof window === "undefined" || reducedMotion) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(plain.slice(0, 8000));
    u.rate = 1;
    window.speechSynthesis.speak(u);
  }

  return (
    <button
      type="button"
      onClick={speak}
      disabled={!stripForSpeech(text) || reducedMotion}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-[color:var(--color-text-muted)] ring-1 ring-[rgba(180,192,217,0.15)] hover:bg-[rgba(180,192,217,0.08)] hover:text-[color:var(--color-text-primary)] disabled:opacity-40 ${className}`}
    >
      <Volume2 className="h-3.5 w-3.5" />
      Speak
    </button>
  );
}
