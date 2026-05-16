import type { Unit, WeatherConditionMain } from "@/types/weather.types";

export function formatTemp(celsius: number, unit: Unit = "metric"): string {
  if (unit === "imperial") {
    const f = (celsius * 9) / 5 + 32;
    return `${Math.round(f)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempRaw(celsius: number, unit: Unit = "metric"): number {
  if (unit === "imperial") return Math.round((celsius * 9) / 5 + 32);
  return Math.round(celsius);
}

export function formatWind(mps: number, unit: Unit = "metric"): string {
  if (unit === "imperial") {
    const mph = mps * 2.23694;
    return `${mph.toFixed(1)} mph`;
  }
  const kmh = mps * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

export function formatWindKmh(mps: number, unit: Unit = "metric"): number {
  return unit === "imperial" ? +(mps * 2.23694).toFixed(1) : +(mps * 3.6).toFixed(1);
}

export function formatPressure(hPa: number): string {
  return `${Math.round(hPa)} hPa`;
}

export function formatVisibility(meters: number, unit: Unit = "metric"): string {
  if (unit === "imperial") {
    const mi = meters / 1609.34;
    return `${mi.toFixed(1)} mi`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatPrecip(mm: number, unit: Unit = "metric"): string {
  if (unit === "imperial") {
    const inches = mm / 25.4;
    return `${inches.toFixed(2)} in`;
  }
  return `${mm.toFixed(1)} mm`;
}

export function degreesToCardinal(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const idx = Math.round(((deg % 360) / 22.5)) % 16;
  return dirs[idx] ?? "N";
}

export function formatTime(unix: number, timezone?: string): string {
  return new Date(unix * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });
}

export function formatDate(unix: number, timezone?: string): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  });
}

export function formatDayName(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function uvLevel(uv: number): { label: string; color: string } {
  if (uv < 3) return { label: "Low", color: "var(--color-safe)" };
  if (uv < 6) return { label: "Moderate", color: "var(--color-warning)" };
  if (uv < 8) return { label: "High", color: "var(--color-warning)" };
  if (uv < 11) return { label: "Very High", color: "var(--color-danger)" };
  return { label: "Extreme", color: "var(--color-danger)" };
}

export function aqiLevel(aqi: number): { label: string; color: string } {
  switch (aqi) {
    case 1:
      return { label: "Good", color: "var(--color-safe)" };
    case 2:
      return { label: "Fair", color: "var(--color-info)" };
    case 3:
      return { label: "Moderate", color: "var(--color-warning)" };
    case 4:
      return { label: "Poor", color: "var(--color-warning)" };
    case 5:
      return { label: "Very Poor", color: "var(--color-danger)" };
    default:
      return { label: "Unknown", color: "var(--color-neutral)" };
  }
}

export interface AccentPalette {
  primary: string;
  light: string;
}

export function accentForCondition(
  main: WeatherConditionMain | undefined,
  isNight: boolean,
): AccentPalette {
  if (!main) return { primary: "#344973", light: "#b4c0d9" };
  switch (main) {
    case "Clear":
      return isNight
        ? { primary: "#2a3b5e", light: "#b4c0d9" }
        : { primary: "#4d6aa3", light: "#f3c969" };
    case "Clouds":
      return { primary: "#344973", light: "#b4c0d9" };
    case "Rain":
    case "Drizzle":
      return { primary: "#3d5a82", light: "#5b9bd5" };
    case "Thunderstorm":
      return { primary: "#2e3a55", light: "#9b6dd4" };
    case "Snow":
      return { primary: "#5a7799", light: "#ffffff" };
    case "Mist":
    case "Fog":
    case "Haze":
    case "Smoke":
    case "Dust":
    case "Sand":
    case "Ash":
      return { primary: "#4a5570", light: "#aba5af" };
    case "Tornado":
    case "Squall":
      return { primary: "#3a3a52", light: "#e67e22" };
    default:
      return { primary: "#344973", light: "#b4c0d9" };
  }
}

export function conditionGradient(main: WeatherConditionMain): string {
  switch (main) {
    case "Clear":
      return "linear-gradient(135deg, #344973 0%, #818da6 60%, #1e2435 100%)";
    case "Clouds":
      return "linear-gradient(135deg, #2a3248 0%, #818da6 70%, #1e2435 100%)";
    case "Rain":
    case "Drizzle":
      return "linear-gradient(135deg, #1e2435 0%, #344973 60%, #2a3248 100%)";
    case "Thunderstorm":
      return "linear-gradient(135deg, #161b2a 0%, #344973 50%, #1e2435 100%)";
    case "Snow":
      return "linear-gradient(135deg, #344973 0%, #b4c0d9 60%, #2a3248 100%)";
    case "Mist":
    case "Fog":
    case "Haze":
      return "linear-gradient(135deg, #2a3248 0%, #aba5af 70%, #1e2435 100%)";
    case "Tornado":
    case "Squall":
      return "linear-gradient(135deg, #161b2a 0%, #70735a 50%, #344973 100%)";
    default:
      return "linear-gradient(135deg, #344973 0%, #1e2435 100%)";
  }
}
