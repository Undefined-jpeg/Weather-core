export type DisasterType =
  | "hurricane"
  | "tornado"
  | "flood"
  | "blizzard"
  | "wildfire"
  | "earthquake"
  | "tsunami"
  | "drought"
  | "volcano"
  | "severe-thunderstorm"
  | "winter-storm"
  | "tropical-storm";

export type Severity = "watch" | "warning" | "emergency" | "advisory";

export interface DisasterEvent {
  id: string;
  type: DisasterType;
  name: string | null;
  severity: Severity;
  lat: number;
  lon: number;
  radius: number | null;
  description: string | null;
  sourceUrl: string | null;
  isActive: boolean;
  startedAt: string | null;
  updatedAt: string;
}

export interface HurricaneStorm extends DisasterEvent {
  type: "hurricane" | "tropical-storm";
  category: 1 | 2 | 3 | 4 | 5 | "TS" | "TD";
  windSpeedKnots: number;
  pressureMb: number;
  movementDirection: string;
  movementSpeedKnots: number;
  projectedLandfall: string | null;
  trackHistory: Array<{ lat: number; lon: number; time: string; intensity: string }>;
  forecastCone: Array<{ lat: number; lon: number }>;
}
