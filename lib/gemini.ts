import { GoogleGenerativeAI } from "@google/generative-ai";
import type { WeatherPayload } from "@/types/weather.types";
import type { DisasterEvent } from "@/types/disaster.types";

const MODEL = "gemini-2.0-flash";

export type BriefingVerbosity = "short" | "standard" | "long";

function getClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

async function streamFromPrompt(prompt: string): Promise<ReadableStream<Uint8Array>> {
  const client = getClient();
  const encoder = new TextEncoder();

  if (!client) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            "AI analysis is unavailable — GEMINI_API_KEY is not configured.",
          ),
        );
        controller.close();
      },
    });
  }

  const model = client.getGenerativeModel({ model: MODEL });

  let result: Awaited<ReturnType<typeof model.generateContentStream>>;
  try {
    result = await model.generateContentStream(prompt);
  } catch (e) {
    const msg = friendlyError(e);
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(msg));
        controller.close();
      },
    });
  }

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (e) {
        controller.enqueue(encoder.encode(`\n\n${friendlyError(e)}`));
        controller.close();
      }
    },
  });
}

function friendlyError(e: unknown): string {
  const msg = (e as Error).message ?? String(e);
  if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
    return "AI analysis is temporarily unavailable — Gemini API quota exceeded. Please wait a minute and try again, or create a free API key at aistudio.google.com/apikey.";
  }
  if (msg.includes("404") || msg.includes("not found")) {
    return "AI analysis is unavailable — the configured Gemini model is not accessible with this API key.";
  }
  if (msg.includes("401") || msg.includes("403") || msg.includes("API key")) {
    return "AI analysis is unavailable — invalid or unauthorised Gemini API key.";
  }
  return `AI analysis is temporarily unavailable. Please try again later.`;
}

export function buildWeatherAnalysisPrompt(
  payload: WeatherPayload,
  verbosity: BriefingVerbosity = "standard",
): string {
  const compact = {
    location: `${payload.location.name}, ${payload.location.country ?? ""}`,
    current: {
      temp: payload.current.temp,
      feelsLike: payload.current.feelsLike,
      humidity: payload.current.humidity,
      windSpeed: payload.current.windSpeed,
      windGust: payload.current.windGust,
      uv: payload.current.uv,
      pressure: payload.current.pressure,
      visibility: payload.current.visibility,
      condition: payload.current.condition,
      dewPoint: payload.current.dewPoint,
    },
    next24h: payload.hourly.slice(0, 24).map((h) => ({
      t: new Date(h.time * 1000).toISOString().slice(11, 16),
      temp: h.temp,
      pop: h.pop,
      wind: h.windSpeed,
      cond: h.conditionMain,
    })),
    next7d: payload.daily.slice(0, 7).map((d) => ({
      date: d.date,
      lo: d.tempMin,
      hi: d.tempMax,
      precip: d.precipitationSum,
      popMax: d.precipitationProbabilityMax,
      snow: d.snowfallSum,
      uvMax: d.uvMax,
      cond: d.conditionMain,
    })),
    airQuality: payload.airQuality
      ? { aqi: payload.airQuality.aqi, desc: payload.airQuality.description, pm25: payload.airQuality.pm25 }
      : null,
    historicalDelta: payload.historical
      ? { tempDeltaC: payload.historical.temperatureDeltaC, precipDeltaMm: payload.historical.precipitationDeltaMm }
      : null,
  };
  const wordCap =
    verbosity === "short" ? 140 : verbosity === "long" ? 700 : 400;
  const sectionHint =
    verbosity === "short"
      ? "## Outlook\n\n## Risks\n\n(one short paragraph each; no bullets)"
      : verbosity === "long"
        ? `SECTIONS (markdown, prose — short bullets allowed sparingly):
## Overall Outlook
## Risks & Alerts
## Outdoor & Activity Advice
## Health Considerations
## Pressure & Moisture Signals
## 3-Day Highlight`
        : `SECTIONS (markdown, prose only — no bullet lists):
## Overall Outlook
## Risks & Alerts
## Outdoor & Activity Advice
## Health Considerations
## 3-Day Highlight`;

  return `You are WeatherCore's meteorology AI. Write a concise professional weather briefing.

DATA:
${JSON.stringify(compact)}

${sectionHint}

Max ~${wordCap} words (soft cap — stay tight). Metric units.`.trim();
}

export async function streamWeatherAnalysis(
  payload: WeatherPayload,
  verbosity: BriefingVerbosity = "standard",
): Promise<ReadableStream<Uint8Array>> {
  return streamFromPrompt(buildWeatherAnalysisPrompt(payload, verbosity));
}

export async function streamMapBriefing(
  userLat: number,
  userLon: number,
  events: DisasterEvent[],
): Promise<ReadableStream<Uint8Array>> {
  const slim = events.slice(0, 8).map((e) => ({
    type: e.type,
    name: e.name,
    severity: e.severity,
    desc: e.description?.slice(0, 80),
  }));
  const prompt = `WeatherCore map AI. User at ${userLat.toFixed(2)},${userLon.toFixed(2)}.
Nearby events: ${JSON.stringify(slim)}
Write exactly 2 sentences (~40 words) summarizing nearby conditions. No markdown.`.trim();
  return streamFromPrompt(prompt);
}

export async function streamDisasterBriefing(
  events: DisasterEvent[],
): Promise<ReadableStream<Uint8Array>> {
  const slim = events.slice(0, 15).map((e) => ({
    type: e.type,
    name: e.name,
    severity: e.severity,
    desc: e.description?.slice(0, 100),
  }));
  const prompt = `WeatherCore senior meteorologist. Global severe-weather briefing, most significant first.

Events: ${JSON.stringify(slim)}

Sections (markdown prose):
## Global Headline
## Atlantic / Pacific Basins
## North America
## Rest of World
## Outlook 24-48h

~350 words. Authoritative tone.`.trim();
  return streamFromPrompt(prompt);
}

export async function summarizeNewsArticle(
  headline: string,
  source: string,
  excerpt: string | null,
): Promise<string> {
  const client = getClient();
  if (!client) return "";
  const model = client.getGenerativeModel({ model: MODEL });
  const prompt = `Summarize in 2 sentences (weather news): "${headline}" — ${source}. ${excerpt ? `Excerpt: ${excerpt.slice(0, 200)}` : ""}. Facts only, no preamble.`.trim();
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return "";
  }
}
