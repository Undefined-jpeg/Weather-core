export function buildMapDeepLink(
  origin: string,
  input: {
    center: [number, number]; // lng, lat
    zoom: number;
    event?: string | null;
  },
): string {
  const url = new URL("/map", origin);
  url.searchParams.set("lat", String(+input.center[1].toFixed(5)));
  url.searchParams.set("lon", String(+input.center[0].toFixed(5)));
  const zClamped = Math.min(18, Math.max(2, Math.round(input.zoom * 100) / 100));
  url.searchParams.set("z", String(zClamped));
  if (input.event) url.searchParams.set("event", input.event);
  return url.toString();
}
