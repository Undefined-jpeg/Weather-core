import type { DisasterEvent, DisasterType, HurricaneStorm, Severity } from "@/types/disaster.types";
import type { NwsAlert } from "@/types/alert.types";

const NWS_BASE = "https://api.weather.gov";
const NWS_HEADERS = {
  "User-Agent": "WeatherCore (contact@weathercore.app)",
  Accept: "application/geo+json",
};
const NHC_CURRENT = "https://www.nhc.noaa.gov/CurrentStorms.json";
const RELIEFWEB_BASE = "https://api.reliefweb.int/v1/disasters";

function severityFromNws(input: string | undefined): Severity {
  switch ((input || "").toLowerCase()) {
    case "extreme":
      return "emergency";
    case "severe":
      return "warning";
    case "moderate":
      return "watch";
    case "minor":
    default:
      return "advisory";
  }
}

function disasterTypeFromEvent(event: string): DisasterType {
  const e = event.toLowerCase();
  if (e.includes("tornado")) return "tornado";
  if (e.includes("hurricane")) return "hurricane";
  if (e.includes("tropical")) return "tropical-storm";
  if (e.includes("flood")) return "flood";
  if (e.includes("blizzard") || e.includes("winter")) return "winter-storm";
  if (e.includes("fire")) return "wildfire";
  if (e.includes("thunderstorm")) return "severe-thunderstorm";
  return "severe-thunderstorm";
}

interface NwsAlertsResponse {
  features: Array<{
    id: string;
    properties: {
      id: string;
      event: string;
      headline: string;
      description: string;
      instruction: string | null;
      severity: string;
      certainty: string;
      urgency: string;
      areaDesc: string;
      effective: string;
      expires: string;
      senderName: string;
      status: string;
      messageType: string;
      category: string;
    };
    geometry: { type: string; coordinates: number[][][] } | null;
  }>;
}

export async function getActiveAlertsByPoint(
  lat: number,
  lon: number,
): Promise<NwsAlert[]> {
  try {
    const url = `${NWS_BASE}/alerts/active?point=${lat},${lon}`;
    const res = await fetch(url, { headers: NWS_HEADERS, next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as NwsAlertsResponse;
    return data.features.map((f) => ({
      id: f.properties.id,
      event: f.properties.event,
      headline: f.properties.headline,
      description: f.properties.description,
      instruction: f.properties.instruction,
      severity: severityFromNws(f.properties.severity),
      certainty: f.properties.certainty,
      urgency: f.properties.urgency,
      areaDesc: f.properties.areaDesc,
      effective: f.properties.effective,
      expires: f.properties.expires,
      senderName: f.properties.senderName,
      status: f.properties.status,
      messageType: f.properties.messageType,
      category: f.properties.category,
    }));
  } catch {
    return [];
  }
}

export async function getAllActiveAlerts(): Promise<NwsAlert[]> {
  try {
    const res = await fetch(`${NWS_BASE}/alerts/active`, {
      headers: NWS_HEADERS,
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as NwsAlertsResponse;
    return data.features.slice(0, 500).map((f) => ({
      id: f.properties.id,
      event: f.properties.event,
      headline: f.properties.headline,
      description: f.properties.description,
      instruction: f.properties.instruction,
      severity: severityFromNws(f.properties.severity),
      certainty: f.properties.certainty,
      urgency: f.properties.urgency,
      areaDesc: f.properties.areaDesc,
      effective: f.properties.effective,
      expires: f.properties.expires,
      senderName: f.properties.senderName,
      status: f.properties.status,
      messageType: f.properties.messageType,
      category: f.properties.category,
    }));
  } catch {
    return [];
  }
}

export function alertsToDisasterEvents(alerts: NwsAlert[]): DisasterEvent[] {
  return alerts
    .filter((a) => {
      const e = a.event.toLowerCase();
      return (
        e.includes("tornado") ||
        e.includes("hurricane") ||
        e.includes("flood") ||
        e.includes("blizzard") ||
        e.includes("fire") ||
        e.includes("thunderstorm") ||
        e.includes("winter") ||
        e.includes("tropical")
      );
    })
    .map<DisasterEvent>((a) => ({
      id: a.id,
      type: disasterTypeFromEvent(a.event),
      name: a.event,
      severity: a.severity,
      lat: 0,
      lon: 0,
      radius: 50,
      description: a.headline,
      sourceUrl: `https://alerts.weather.gov/cap/wwacapget.php?x=${encodeURIComponent(a.id)}`,
      isActive: true,
      startedAt: a.effective,
      updatedAt: new Date().toISOString(),
    }));
}

interface NhcStormResponse {
  activeStorms: Array<{
    id: string;
    binNumber: string;
    name: string;
    classification: string;
    intensity: string;
    pressure: string;
    latitudeNumeric: number;
    longitudeNumeric: number;
    movementDir: number;
    movementSpeed: number;
    lastUpdate: string;
    publicAdvisory?: { url: string };
    forecastTrack?: { kmzFile: string };
  }>;
}

export async function getActiveHurricanes(): Promise<HurricaneStorm[]> {
  try {
    const res = await fetch(NHC_CURRENT, { next: { revalidate: 900 } });
    if (!res.ok) return [];
    const data = (await res.json()) as NhcStormResponse;
    return (data.activeStorms || []).map<HurricaneStorm>((s) => {
      const windSpeedKt = parseInt(s.intensity, 10) || 0;
      let category: HurricaneStorm["category"] = "TS";
      if (windSpeedKt >= 137) category = 5;
      else if (windSpeedKt >= 113) category = 4;
      else if (windSpeedKt >= 96) category = 3;
      else if (windSpeedKt >= 83) category = 2;
      else if (windSpeedKt >= 64) category = 1;
      else if (windSpeedKt >= 34) category = "TS";
      else category = "TD";
      const isHurricane = typeof category === "number";
      return {
        id: s.id,
        type: isHurricane ? "hurricane" : "tropical-storm",
        name: s.name,
        severity: typeof category === "number" && category >= 3 ? "emergency" : "warning",
        lat: s.latitudeNumeric,
        lon: s.longitudeNumeric,
        radius: 300,
        description: `${s.classification} ${s.name} — ${windSpeedKt}kt`,
        sourceUrl: s.publicAdvisory?.url || "https://www.nhc.noaa.gov",
        isActive: true,
        startedAt: s.lastUpdate,
        updatedAt: new Date().toISOString(),
        category,
        windSpeedKnots: windSpeedKt,
        pressureMb: parseInt(s.pressure, 10) || 0,
        movementDirection: String(s.movementDir),
        movementSpeedKnots: s.movementSpeed,
        projectedLandfall: null,
        trackHistory: [],
        forecastCone: [],
      };
    });
  } catch {
    return [];
  }
}

interface ReliefWebResponse {
  data: Array<{
    id: string;
    fields: {
      name: string;
      status: string;
      description?: string;
      type?: Array<{ name: string }>;
      country?: Array<{ name: string; iso3: string; location?: { lat: number; lon: number } }>;
      date?: { created: string; changed: string };
      url_alias?: string;
    };
  }>;
}

export async function getReliefWebDisasters(): Promise<DisasterEvent[]> {
  try {
    const url = `${RELIEFWEB_BASE}?appname=weathercore&profile=list&limit=50&filter[field]=status&filter[value]=current&sort[]=date.changed:desc`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const data = (await res.json()) as ReliefWebResponse;
    return data.data.flatMap<DisasterEvent>((d) => {
      const country = d.fields.country?.[0];
      const loc = country?.location;
      if (!loc) return [];
      const typeName = d.fields.type?.[0]?.name?.toLowerCase() || "";
      let type: DisasterType = "severe-thunderstorm";
      if (typeName.includes("flood")) type = "flood";
      else if (typeName.includes("storm") || typeName.includes("cyclone") || typeName.includes("hurricane")) type = "hurricane";
      else if (typeName.includes("fire")) type = "wildfire";
      else if (typeName.includes("earthquake")) type = "earthquake";
      else if (typeName.includes("drought")) type = "drought";
      else if (typeName.includes("tsunami")) type = "tsunami";
      else if (typeName.includes("volcano")) type = "volcano";
      else if (typeName.includes("snow") || typeName.includes("blizzard")) type = "blizzard";

      return [{
        id: d.id,
        type,
        name: d.fields.name,
        severity: "warning",
        lat: loc.lat,
        lon: loc.lon,
        radius: 200,
        description: d.fields.description ?? d.fields.name,
        sourceUrl: d.fields.url_alias ?? null,
        isActive: d.fields.status === "current",
        startedAt: d.fields.date?.created ?? null,
        updatedAt: d.fields.date?.changed ?? new Date().toISOString(),
      }];
    });
  } catch {
    return [];
  }
}
