"use client";

import { useState } from "react";
import { Check, Download, Share2 } from "lucide-react";

const FILE_NAME = "weathercore-today.png";

async function captureTarget(): Promise<{
  dataUrl: string;
  blob: Blob;
} | null> {
  const el = document.querySelector<HTMLElement>("[data-share-target]");
  if (!el) return null;
  const { toPng, toBlob } = await import("html-to-image");
  const options = {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#1e2435",
  };
  const [dataUrl, blob] = await Promise.all([
    toPng(el, options),
    toBlob(el, options),
  ]);
  if (!blob) return null;
  return { dataUrl, blob };
}

export function ShareTodayButton() {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">(
    "idle",
  );

  async function handleClick() {
    setState("working");
    try {
      const result = await captureTarget();
      if (!result) {
        setState("error");
        setTimeout(() => setState("idle"), 1800);
        return;
      }

      const canShareFile =
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({
          files: [new File([result.blob], FILE_NAME, { type: "image/png" })],
        });

      if (canShareFile) {
        await navigator.share({
          title: "Today's weather",
          files: [new File([result.blob], FILE_NAME, { type: "image/png" })],
        });
      } else {
        const a = document.createElement("a");
        a.href = result.dataUrl;
        a.download = FILE_NAME;
        a.click();
      }
      setState("done");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "working"}
      className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(30,36,53,0.55)] px-3 py-1.5 text-xs font-medium ring-1 ring-[rgba(180,192,217,0.2)] backdrop-blur transition hover:bg-[rgba(30,36,53,0.8)] disabled:opacity-60"
      aria-label="Share today's weather"
    >
      {state === "done" ? (
        <>
          <Check className="h-3.5 w-3.5" /> Saved
        </>
      ) : state === "working" ? (
        <>
          <Download className="h-3.5 w-3.5 animate-pulse" /> Rendering…
        </>
      ) : state === "error" ? (
        <>Try again</>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" /> Share
        </>
      )}
    </button>
  );
}
