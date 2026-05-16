"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useMapStore, type MapLayerId } from "@/stores/useMapStore";
import {
  Cloud,
  CloudRain,
  Flame,
  Layers,
  Snowflake,
  Thermometer,
  Tornado,
  Wind,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MAP_LAYER_PRESETS } from "@/lib/mapLayerPresets";

const LAYERS: Array<{ id: MapLayerId; label: string; Icon: LucideIcon }> = [
  { id: "temperature", label: "Temperature", Icon: Thermometer },
  { id: "precipitation", label: "Precipitation", Icon: CloudRain },
  { id: "wind", label: "Wind", Icon: Wind },
  { id: "clouds", label: "Clouds", Icon: Cloud },
  { id: "tornado", label: "Tornado", Icon: Tornado },
  { id: "hurricane", label: "Hurricane", Icon: Snowflake },
  { id: "wildfire", label: "Wildfire", Icon: Flame },
  { id: "flood", label: "Flood", Icon: Waves },
];

export function LayerToggle() {
  const layers = useMapStore((s) => s.layers);
  const toggle = useMapStore((s) => s.toggleLayer);
  const setLayer = useMapStore((s) => s.setLayer);
  return (
    <GlassCard variant="strong" className="min-w-[14rem]">
      <div className="mb-2 flex flex-wrap gap-1">
        {Object.entries(MAP_LAYER_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              Object.entries(preset.layers).forEach(([id, active]) =>
                setLayer(id as MapLayerId, !!active),
              );
            }}
            className="rounded-md bg-[rgba(180,192,217,0.08)] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[color:var(--color-text-muted)] ring-1 ring-[rgba(180,192,217,0.12)] hover:bg-[rgba(180,192,217,0.14)] hover:text-[color:var(--color-text-primary)]"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-[color:var(--color-text-muted)]">
        <Layers className="h-3.5 w-3.5" /> Layers
      </div>
      <ul className="space-y-1">
        {LAYERS.map(({ id, label, Icon }) => {
          const active = layers[id];
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => toggle(id)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
                  active
                    ? "bg-[color:var(--color-primary)]/40 text-[color:var(--color-text-primary)]"
                    : "text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.06)]"
                }`}
                aria-pressed={active}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <span
                  className={`block h-3 w-6 rounded-full transition ${
                    active ? "bg-[color:var(--color-light)]" : "bg-[rgba(180,192,217,0.2)]"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
