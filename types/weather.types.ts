export type Unit = "metric" | "imperial";

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LocationInfo extends Coordinates {
  name: string;
  country?: string;
  region?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  clouds: number;
  visibility: number;
  uv: number;
  dewPoint?: number;
  condition: string;
  conditionMain: WeatherConditionMain;
  iconCode: string;
  sunrise: number;
  sunset: number;
  observedAt: number;
}

export type WeatherConditionMain =
  | "Clear"
  | "Clouds"
  | "Rain"
  | "Drizzle"
  | "Thunderstorm"
  | "Snow"
  | "Mist"
  | "Fog"
  | "Haze"
  | "Smoke"
  | "Dust"
  | "Sand"
  | "Ash"
  | "Squall"
  | "Tornado";

export interface HourlyEntry {
  time: number;
  temp: number;
  feelsLike: number;
  pop: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  pressure: number;
  clouds: number;
  uv: number;
  precipitation: number;
  conditionMain: WeatherConditionMain;
  iconCode: string;
}

export interface DailyEntry {
  date: string;
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  feelsLikeMax: number;
  feelsLikeMin: number;
  humidity: number;
  windSpeed: number;
  windGust?: number;
  windDeg: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  snowfallSum: number;
  uvMax: number;
  sunrise: number;
  sunset: number;
  pressure: number;
  cloudCover: number;
  conditionMain: WeatherConditionMain;
  iconCode: string;
}

export interface AirQuality {
  aqi: number; // 1-5 (OWM scale)
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number;
  so2: number;
  description: string;
}

export interface WidgetWeatherCompact {
  cached: boolean;
  fetchedAt: number;
  location: Pick<LocationInfo, "name" | "lat" | "lon" | "timezone" | "country">;
  current: Pick<CurrentWeather, "temp" | "feelsLike" | "condition" | "conditionMain" | "iconCode">;
  nextPopMax?: number;
}

export interface HistoricalDelta {
  temperatureDeltaC: number;
  precipitationDeltaMm: number;
  comparisonWindowYears: number;
  daily: Array<{ date: string; tempAvg: number; tenYearAvg: number; delta: number }>;
}

/** Rolling 7-day window: this year vs same calendar dates last year (archive). */
export interface WeekYearOverYearDay {
  date: string;
  tempMeanThisC: number | null;
  tempMeanLastC: number | null;
  precipMmThis: number | null;
  precipMmLast: number | null;
}

export interface WeekYearOverYearCompare {
  startDate: string;
  endDate: string;
  days: WeekYearOverYearDay[];
}

/** Server may attach when serving stale DB-backed cache rows. */
export interface WeatherPayload {
  cached?: boolean;
  location: LocationInfo;
  unit: Unit;
  current: CurrentWeather;
  hourly: HourlyEntry[]; // 48 entries
  daily: DailyEntry[]; // 14 entries
  airQuality?: AirQuality | null;
  historical?: HistoricalDelta | null;
  fetchedAt: number;
  source: {
    current: "openweathermap";
    forecast: "open-meteo";
  };
}
