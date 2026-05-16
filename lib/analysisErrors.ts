/**
 * Shared UX helpers for `/api/ai-analysis` and streaming error bodies from Gemini.
 */

export async function parseAnalysisHttpError(res: Response): Promise<string | null> {
  const ctype = res.headers.get("Content-Type") ?? "";
  try {
    if (ctype.includes("application/json")) {
      const json = (await res.json()) as Record<string, unknown>;
      const err = json?.error;
      const errStr =
        typeof err === "string"
          ? err
          : err && typeof err === "object"
            ? "Invalid request (see server logs for details)."
            : null;
      const resetAt = json?.resetAt as number | undefined;
      if (res.status === 429) {
        if (errStr?.includes?.("Rate limit")) {
          let msg =
            "This app’s hourly AI limit was reached — try again in a bit or sign in.";
          if (typeof resetAt === "number") {
            const mins = Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000));
            msg += ` (Resets in about ${mins} minute${mins !== 1 ? "s" : ""}.)`;
          }
          return msg;
        }
        return "Google Gemini returned rate limit / quota exceeded (429). Wait and retry, ensure your key is from aistudio.google.com/apikey with free tier enabled, or check billing/quota.";
      }
      return errStr ?? (res.status >= 400 ? `Request failed (${res.status}).` : null);
    }
    const txt = await res.text();
    if (txt.trim()) return txt.trim().slice(0, 500);
    if (res.status === 429) {
      return "Rate limited (429). This may be Gemini quota or WeatherCore’s per-hour limit — try later or sign in.";
    }
  } catch {
    if (res.status === 429) {
      return "Rate limited (429). Try again in a minute.";
    }
  }
  return null;
}

export function isGeminiStreamErrorPayload(text: string): boolean {
  const t = text.trim();
  return (
    t.startsWith("AI analysis is unavailable") ||
    t.startsWith("AI analysis is temporarily unavailable") ||
    t.startsWith("_Error generating analysis") ||
    /\bGEMINI_API_KEY\b/.test(t)
  );
}

export function streamErrorBannerText(fullText: string): string | null {
  if (!isGeminiStreamErrorPayload(fullText)) return null;
  return fullText.trim().replace(/\*\*/g, "").replace(/^_\s*|_$/g, "").slice(0, 520);
}
