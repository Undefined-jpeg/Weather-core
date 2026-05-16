import type {
  AirQuality,
  CurrentWeather,
  DailyEntry,
  HistoricalDelta,
  HourlyEntry,
  LocationInfo,
  WeatherConditionMain,
  WeatherPayload,
  WeekYearOverYearCompare,
  WeekYearOverYearDay,
} from "@/types/weather.types";

const OWM_BASE = "https://api.openweathermap.org/data/2.5";
const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_ARCHIVE = "https://archive-api.open-meteo.com/v1/archive";
const OWM_AIR = "https://api.openweathermap.org/data/2.5/air_pollution";

interface OwmCurrentResponse {
  coord: { lat: number; lon: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  dt: number;
  sys: { sunrise: number; sunset: number; country: string };
  name: string;
  timezone: number;
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    pressure_msl: number;
    cloud_cover: number;
    uv_index?: number;
    dew_point_2m?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    pressure_msl: number[];
    relative_humidity_2m: number[];
    cloud_cover: number[];
    uv_index: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    temperature_2m_mean?: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    snowfall_sum: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max?: number[];
    wind_direction_10m_dominant: number[];
    pressure_msl_max?: number[];
    cloud_cover_mean?: number[];
    relative_humidity_2m_mean?: number[];
  };
}

interface OwmAirResponse {
  list: Array<{
    main: { aqi: number };
    components: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
    };
  }>;
}

interface OpenMeteoArchiveResponse {
  daily: {
    time: string[];
    temperature_2m_mean: number[];
    precipitation_sum: number[];
  };
}

export function weatherCodeToCondition(code: number): {
  main: WeatherConditionMain;
  description: string;
  icon: string;
} {
  if (code === 0) return { main: "Clear", description: "Clear sky", icon: "01d" };
  if (code <= 3) return { main: "Clouds", description: "Partly cloudy", icon: "03d" };
  if (code <= 48) return { main: "Fog", description: "Fog", icon: "50d" };
  if (code <= 57) return { main: "Drizzle", description: "Drizzle", icon: "09d" };
  if (code <= 67) return { main: "Rain", description: "Rain", icon: "10d" };
  if (code <= 77) return { main: "Snow", description: "Snow", icon: "13d" };
  if (code <= 82) return { main: "Rain", description: "Rain showers", icon: "09d" };
  if (code <= 86) return { main: "Snow", description: "Snow showers", icon: "13d" };
  if (code <= 99) return { main: "Thunderstorm", description: "Thunderstorm", icon: "11d" };
  return { main: "Clouds", description: "Unknown", icon: "03d" };
}

function owmMainToCondition(main: string): WeatherConditionMain {
  const m = main as WeatherConditionMain;
  return m;
}

async function fetchOWMCurrent(
  lat: number,
  lon: number,
): Promise<OwmCurrentResponse | null> {
  const key = process.env.OPENWEATHERMAP_API_KEY;
  if (!key) return null;
  const res = await fetch(
    `${OWM_BASE}/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
    { next: { revalidate: 300 } },
  );
  if (!res.ok) return null;
  return res.json();
}

async function fetchOWMAir(
  lat: number,
  lon: number,
): Promise<OwmAirResponse | null> {
  const key = process.env.OPENWEATHERMAP_API_KEY;
  if (!key) return null;
  const res = await fetch(
    `${OWM_AIR}?lat=${lat}&lon=${lon}&appid=${key}`,
    { next: { revalidate: 1800 } },
  );
  if (!res.ok) return null;
  return res.json();
}

async function fetchOpenMeteo(
  lat: number,
  lon: number,
): Promise<OpenMeteoResponse | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover,uv_index,dew_point_2m",
    hourly:
      "temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,relative_humidity_2m,cloud_cover,uv_index",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,relative_humidity_2m_mean,cloud_cover_mean",
    timezone: "auto",
    forecast_days: "14",
    wind_speed_unit: "ms",
  });
  const res = await fetch(`${OPEN_METEO_BASE}?${params.toString()}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

function buildCurrent(
  owm: OwmCurrentResponse | null,
  om: OpenMeteoResponse,
): CurrentWeather {
  if (owm) {
    const w0 = owm.weather[0];
    return {
      temp: owm.main.temp,
      feelsLike: owm.main.feels_like,
      tempMin: owm.main.temp_min,
      tempMax: owm.main.temp_max,
      humidity: owm.main.humidity,
      pressure: owm.main.pressure,
      windSpeed: owm.wind.speed,
      windDeg: owm.wind.deg,
      windGust: owm.wind.gust,
      clouds: owm.clouds.all,
      visibility: owm.visibility,
      uv: om.current?.uv_index ?? 0,
      dewPoint: om.current?.dew_point_2m,
      condition: w0?.description ?? "",
      conditionMain: owmMainToCondition(w0?.main ?? "Clear"),
      iconCode: w0?.icon ?? "01d",
      sunrise: owm.sys.sunrise,
      sunset: owm.sys.sunset,
      observedAt: owm.dt,
    };
  }
  const c = om.current!;
  const cond = weatherCodeToCondition(c.weather_code);
  const todaySunrise = om.daily.sunrise[0];
  const todaySunset = om.daily.sunset[0];
  return {
    temp: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    tempMin: om.daily.temperature_2m_min[0] ?? c.temperature_2m,
    tempMax: om.daily.temperature_2m_max[0] ?? c.temperature_2m,
    humidity: c.relative_humidity_2m,
    pressure: c.pressure_msl,
    windSpeed: c.wind_speed_10m,
    windDeg: c.wind_direction_10m,
    clouds: c.cloud_cover,
    visibility: 10000,
    uv: c.uv_index ?? 0,
    dewPoint: c.dew_point_2m,
    condition: cond.description,
    conditionMain: cond.main,
    iconCode: cond.icon,
    sunrise: todaySunrise ? Math.floor(new Date(todaySunrise).getTime() / 1000) : 0,
    sunset: todaySunset ? Math.floor(new Date(todaySunset).getTime() / 1000) : 0,
    observedAt: Math.floor(new Date(c.time).getTime() / 1000),
  };
}

function buildHourly(om: OpenMeteoResponse): HourlyEntry[] {
  const h = om.hourly;
  const out: HourlyEntry[] = [];
  const now = Date.now();
  for (let i = 0; i < h.time.length && out.length < 48; i++) {
    const t = new Date(h.time[i]!).getTime();
    if (t < now - 60 * 60 * 1000) continue;
    const cond = weatherCodeToCondition(h.weather_code[i] ?? 0);
    out.push({
      time: Math.floor(t / 1000),
      temp: h.temperature_2m[i] ?? 0,
      feelsLike: h.apparent_temperature[i] ?? 0,
      pop: h.precipitation_probability[i] ?? 0,
      humidity: h.relative_humidity_2m[i] ?? 0,
      windSpeed: h.wind_speed_10m[i] ?? 0,
      windDeg: h.wind_direction_10m[i] ?? 0,
      pressure: h.pressure_msl[i] ?? 0,
      clouds: h.cloud_cover[i] ?? 0,
      uv: h.uv_index[i] ?? 0,
      precipitation: h.precipitation[i] ?? 0,
      conditionMain: cond.main,
      iconCode: cond.icon,
    });
  }
  return out;
}

function buildDaily(om: OpenMeteoResponse): DailyEntry[] {
  const d = om.daily;
  const out: DailyEntry[] = [];
  for (let i = 0; i < d.time.length; i++) {
    const cond = weatherCodeToCondition(d.weather_code[i] ?? 0);
    const max = d.temperature_2m_max[i] ?? 0;
    const min = d.temperature_2m_min[i] ?? 0;
    out.push({
      date: d.time[i] ?? "",
      tempMin: min,
      tempMax: max,
      tempAvg: d.temperature_2m_mean?.[i] ?? (max + min) / 2,
      feelsLikeMax: d.apparent_temperature_max[i] ?? max,
      feelsLikeMin: d.apparent_temperature_min[i] ?? min,
      humidity: d.relative_humidity_2m_mean?.[i] ?? 0,
      windSpeed: d.wind_speed_10m_max[i] ?? 0,
      windGust: d.wind_gusts_10m_max?.[i],
      windDeg: d.wind_direction_10m_dominant[i] ?? 0,
      precipitationSum: d.precipitation_sum[i] ?? 0,
      precipitationProbabilityMax: d.precipitation_probability_max[i] ?? 0,
      snowfallSum: d.snowfall_sum[i] ?? 0,
      uvMax: d.uv_index_max[i] ?? 0,
      sunrise: d.sunrise[i] ? Math.floor(new Date(d.sunrise[i]!).getTime() / 1000) : 0,
      sunset: d.sunset[i] ? Math.floor(new Date(d.sunset[i]!).getTime() / 1000) : 0,
      pressure: d.pressure_msl_max?.[i] ?? 1013,
      cloudCover: d.cloud_cover_mean?.[i] ?? 0,
      conditionMain: cond.main,
      iconCode: cond.icon,
    });
  }
  return out;
}

function buildAirQuality(air: OwmAirResponse | null): AirQuality | null {
  if (!air || !air.list[0]) return null;
  const a = air.list[0];
  const labels = ["Unknown", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
  return {
    aqi: a.main.aqi,
    pm25: a.components.pm2_5,
    pm10: a.components.pm10,
    no2: a.components.no2,
    o3: a.components.o3,
    co: a.components.co,
    so2: a.components.so2,
    description: labels[a.main.aqi] ?? "Unknown",
  };
}

export async function getHistoricalDelta(
  lat: number,
  lon: number,
): Promise<HistoricalDelta | null> {
  try {
    const today = new Date();
    const fromYear = today.getFullYear() - 10;
    const toYear = today.getFullYear() - 1;
    const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      start_date: `${fromYear}-${monthDay}`,
      end_date: `${toYear}-${monthDay}`,
      daily: "temperature_2m_mean,precipitation_sum",
      timezone: "auto",
    });
    const res = await fetch(`${OPEN_METEO_ARCHIVE}?${params.toString()}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OpenMeteoArchiveResponse;
    const temps = data.daily.temperature_2m_mean.filter((t) => t !== null);
    const precs = data.daily.precipitation_sum.filter((p) => p !== null);
    const tenYearTempAvg =
      temps.reduce((s, v) => s + v, 0) / Math.max(temps.length, 1);
    const tenYearPrecAvg =
      precs.reduce((s, v) => s + v, 0) / Math.max(precs.length, 1);
    return {
      temperatureDeltaC: 0,
      precipitationDeltaMm: 0,
      comparisonWindowYears: 10,
      daily: data.daily.time.map((date, i) => ({
        date,
        tempAvg: data.daily.temperature_2m_mean[i] ?? 0,
        tenYearAvg: tenYearTempAvg,
        delta: (data.daily.temperature_2m_mean[i] ?? 0) - tenYearTempAvg,
      })),
    };
  } catch {
    return null;
  }
}

export async function getWeekYearOverYearCompare(
  lat: number,
  lon: number,
): Promise<WeekYearOverYearCompare | null> {
  try {
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 6);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const rangeStart = fmt(start);
    const rangeEnd = fmt(end);

    function shiftBackOneYear(isoDay: string): string {
      const parts = isoDay.split("-").map(Number);
      const y = parts[0];
      const m = parts[1];
      const d = parts[2];
      if (
        y === undefined ||
        m === undefined ||
        d === undefined ||
        !Number.isFinite(y) ||
        !Number.isFinite(m) ||
        !Number.isFinite(d)
      ) {
        return isoDay;
      }
      const dt = new Date(Date.UTC(y, m - 1, d));
      dt.setUTCFullYear(dt.getUTCFullYear() - 1);
      return dt.toISOString().slice(0, 10);
    }

    const lyStart = shiftBackOneYear(rangeStart);
    const lyEnd = shiftBackOneYear(rangeEnd);

    const paramsThis = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      start_date: rangeStart,
      end_date: rangeEnd,
      daily: "temperature_2m_mean,precipitation_sum",
      timezone: "auto",
    });
    const paramsLast = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      start_date: lyStart,
      end_date: lyEnd,
      daily: "temperature_2m_mean,precipitation_sum",
      timezone: "auto",
    });

    const [resT, resL] = await Promise.all([
      fetch(`${OPEN_METEO_ARCHIVE}?${paramsThis}`, { next: { revalidate: 3600 } }),
      fetch(`${OPEN_METEO_ARCHIVE}?${paramsLast}`, { next: { revalidate: 3600 } }),
    ]);
    if (!resT.ok || !resL.ok) return null;
    const thisY = (await resT.json()) as OpenMeteoArchiveResponse;
    const lastY = (await resL.json()) as OpenMeteoArchiveResponse;
    const tTimes = thisY.daily.time;
    const lTimes = lastY.daily.time;
    if (!tTimes?.length || !lTimes?.length) return null;

    const days: WeekYearOverYearDay[] = [];
    const n = Math.min(tTimes.length, lTimes.length);
    for (let i = 0; i < n; i++) {
      days.push({
        date: tTimes[i] ?? "",
        tempMeanThisC: thisY.daily.temperature_2m_mean[i] ?? null,
        tempMeanLastC: lastY.daily.temperature_2m_mean[i] ?? null,
        precipMmThis: thisY.daily.precipitation_sum[i] ?? null,
        precipMmLast: lastY.daily.precipitation_sum[i] ?? null,
      });
    }

    return {
      startDate: rangeStart,
      endDate: rangeEnd,
      days,
    };
  } catch {
    return null;
  }
}

export async function getWeatherPayload(
  lat: number,
  lon: number,
  locationName?: string,
): Promise<WeatherPayload> {
  const [owm, om, air] = await Promise.all([
    fetchOWMCurrent(lat, lon),
    fetchOpenMeteo(lat, lon),
    fetchOWMAir(lat, lon),
  ]);

  if (!om) {
    throw new Error("Failed to fetch weather forecast from Open-Meteo");
  }

  const location: LocationInfo = {
    lat,
    lon,
    name: locationName || owm?.name || "Unknown Location",
    country: owm?.sys.country,
    timezone: om.timezone,
  };

  return {
    location,
    unit: "metric",
    current: buildCurrent(owm, om),
    hourly: buildHourly(om),
    daily: buildDaily(om),
    airQuality: buildAirQuality(air),
    historical: null,
    fetchedAt: Date.now(),
    source: { current: "openweathermap", forecast: "open-meteo" },
  };
}

export function locationKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}
