"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map as MLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapStore, type MapLayerId } from "@/stores/useMapStore";
import type { DisasterEvent, DisasterType } from "@/types/disaster.types";

const DARK_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

const OWM_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

const LAYER_TILE_URLS: Partial<Record<MapLayerId, string>> = OWM_API_KEY
  ? {
      temperature: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
      precipitation: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
      wind: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
      clouds: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
    }
  : {};

const DISASTER_COLORS: Record<DisasterType, string> = {
  hurricane: "#c0392b",
  "tropical-storm": "#e67e22",
  tornado: "#c0392b",
  flood: "#3b82f6",
  blizzard: "#b4c0d9",
  "winter-storm": "#b4c0d9",
  wildfire: "#e67e22",
  earthquake: "#70735a",
  tsunami: "#3b82f6",
  drought: "#aba5af",
  volcano: "#c0392b",
  "severe-thunderstorm": "#e67e22",
};

const DISASTER_LAYER_MAP: Record<DisasterType, MapLayerId | null> = {
  hurricane: "hurricane",
  "tropical-storm": "hurricane",
  tornado: "tornado",
  flood: "flood",
  blizzard: null,
  "winter-storm": null,
  wildfire: "wildfire",
  earthquake: null,
  tsunami: "flood",
  drought: null,
  volcano: null,
  "severe-thunderstorm": "tornado",
};

export interface WeatherMapProps {
  center: [number, number];
  events: DisasterEvent[];
  onSelectEvent?: (id: string) => void;
  mode?: "full" | "radar";
  forcedLayers?: Partial<Record<MapLayerId, boolean>>;
  /** Applied on fly-to; omit to use defaults (radar vs full). */
  targetZoom?: number;
  /** Debounced (~400 ms) pan/zoom; not used for `mode=\"radar\"`. */
  onViewportChange?: (center: [number, number], zoom: number) => void;
}

export function WeatherMap({
  center,
  events,
  onSelectEvent,
  mode = "full",
  forcedLayers,
  targetZoom,
  onViewportChange,
}: WeatherMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const storeLayers = useMapStore((s) => s.layers);
  const layers = forcedLayers
    ? ({ ...storeLayers, ...forcedLayers } as typeof storeLayers)
    : storeLayers;
  const [ready, setReady] = useState(false);
  const isRadar = mode === "radar";
  const suppressViewportEmit = useRef(false);
  const viewportDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onVPCb = useRef(onViewportChange);
  onVPCb.current = onViewportChange;

  // init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const zoomInit =
      typeof targetZoom === "number" ? targetZoom : isRadar ? 7 : 5;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE_URL,
      center,
      zoom: zoomInit,
      attributionControl: false,
      interactive: true,
    });

    const scheduleViewportEmit = () => {
      if (isRadar || !onVPCb.current) return;
      if (viewportDebounce.current) clearTimeout(viewportDebounce.current);
      viewportDebounce.current = setTimeout(() => {
        if (!mapRef.current || suppressViewportEmit.current) return;
        const m = mapRef.current;
        const c = m.getCenter();
        onVPCb.current!([c.lng, c.lat], m.getZoom());
      }, 400);
    };

    if (!isRadar) {
      map.addControl(
        new maplibregl.NavigationControl({ visualizePitch: false }),
        "top-right",
      );
    }
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution:
          '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a>',
      }),
      "bottom-right",
    );

    map.on("moveend", scheduleViewportEmit);

    map.on("load", () => {
      map.addSource("user-loc", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: center },
        },
      });
      map.addLayer({
        id: "user-loc-glow",
        type: "circle",
        source: "user-loc",
        paint: {
          "circle-radius": 30,
          "circle-color": "#b4c0d9",
          "circle-opacity": 0.18,
          "circle-blur": 0.6,
        },
      });
      map.addLayer({
        id: "user-loc-dot",
        type: "circle",
        source: "user-loc",
        paint: {
          "circle-radius": 6,
          "circle-color": "#b4c0d9",
          "circle-stroke-color": "#1e2435",
          "circle-stroke-width": 2,
        },
      });

      if (!isRadar) {
        map.addSource("disasters", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "disaster-glow",
          type: "circle",
          source: "disasters",
          paint: {
            "circle-radius": ["case", ["==", ["get", "severity"], "emergency"], 16, 12],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.25,
            "circle-blur": 0.6,
          },
        });
        map.addLayer({
          id: "disaster-points",
          type: "circle",
          source: "disasters",
          paint: {
            "circle-radius": 6,
            "circle-color": ["get", "color"],
            "circle-stroke-color": "#1e2435",
            "circle-stroke-width": 2,
          },
        });
      }

      if (!isRadar)
        map.on("click", "disaster-points", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const id = (f.properties as { id?: string } | null)?.id;
          if (id && onSelectEvent) onSelectEvent(id);
          const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          const props = f.properties as { name?: string; description?: string; type?: string };
          new maplibregl.Popup({ closeButton: false, className: "wc-popup" })
            .setLngLat(coords)
            .setHTML(
              `<div style="font-family:Inter,sans-serif;font-size:12px;color:#e8ecf4;background:rgba(30,36,53,0.95);padding:8px 10px;border-radius:8px;border:1px solid rgba(180,192,217,0.2);min-width:180px">
              <div style="font-weight:600;margin-bottom:2px">${escapeHtml(props.name ?? "Event")}</div>
              <div style="color:#aba5af;margin-bottom:4px;text-transform:capitalize">${escapeHtml(props.type ?? "")}</div>
              <div style="line-height:1.4">${escapeHtml(props.description ?? "")}</div>
            </div>`,
            )
            .addTo(map);
        });
      if (!isRadar) {
        map.on("mouseenter", "disaster-points", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "disaster-points", () => {
          map.getCanvas().style.cursor = "";
        });
      }

      setReady(true);
    });
    mapRef.current = map;

    return () => {
      if (viewportDebounce.current) clearTimeout(viewportDebounce.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly when center/targetZoom props change (programmatic navigation)
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const flyZ =
      typeof targetZoom === "number" ? targetZoom : isRadar ? 7 : 6;

    suppressViewportEmit.current = true;
    mapRef.current.flyTo({
      center,
      zoom: flyZ,
      essential: true,
      duration: 1200,
    });
    const t = setTimeout(() => {
      suppressViewportEmit.current = false;
    }, 1350);

    const src = mapRef.current.getSource("user-loc") as GeoJSONSource | undefined;
    src?.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: center },
    });

    return () => clearTimeout(t);
  }, [center, ready, targetZoom, isRadar]);

  // tile layer toggles
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    for (const [id, url] of Object.entries(LAYER_TILE_URLS) as [MapLayerId, string][]) {
      const sourceId = `tile-${id}`;
      const layerId = `layer-${id}`;
      const enabled = layers[id];
      if (enabled) {
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: "raster",
            tiles: [url],
            tileSize: 256,
          });
        }
        if (!map.getLayer(layerId)) {
          const before = map.getLayer("disaster-glow") ? "disaster-glow" : undefined;
          map.addLayer(
            {
              id: layerId,
              type: "raster",
              source: sourceId,
              paint: { "raster-opacity": 0.7 },
            },
            before,
          );
        }
      } else if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    }
  }, [layers, ready]);

  // disaster events
  useEffect(() => {
    if (!ready || !mapRef.current || isRadar) return;
    const map = mapRef.current;
    const features: GeoJSON.Feature[] = events
      .filter((e) => {
        const layerId = DISASTER_LAYER_MAP[e.type];
        if (!layerId) return true;
        return layers[layerId];
      })
      .map((e) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [e.lon, e.lat] },
        properties: {
          id: e.id,
          name: e.name ?? "Event",
          type: e.type,
          description: e.description ?? "",
          severity: e.severity,
          color: DISASTER_COLORS[e.type] ?? "#c0392b",
        },
      }));
    const src = map.getSource("disasters") as GeoJSONSource | undefined;
    src?.setData({ type: "FeatureCollection", features });
  }, [events, layers, ready, isRadar]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
