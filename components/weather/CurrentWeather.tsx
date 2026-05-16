"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { Eye, Droplets, Gauge, Wind } from "lucide-react";
import { WeatherIcon } from "@/components/ui/WeatherIcon";
import { ShareTodayButton } from "@/components/weather/ShareTodayButton";
import { useUserStore } from "@/stores/useUserStore";
import {
  conditionGradient,
  degreesToCardinal,
  formatPressure,
  formatTemp,
  formatVisibility,
  formatWind,
} from "@/lib/formatters";
import type { CurrentWeather as CurrentWeatherType, LocationInfo, Unit } from "@/types/weather.types";

export interface CurrentWeatherProps {
  current: CurrentWeatherType;
  location: LocationInfo;
}

export function CurrentWeather({ current, location }: CurrentWeatherProps) {
  const unit = useUserStore((s) => s.unit);

  return (
    <motion.section
      key={current.conditionMain}
      data-share-target
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="anim-gradient relative overflow-hidden rounded-3xl border border-[rgba(180,192,217,0.18)] p-6 md:p-10"
      style={{
        backgroundImage: conditionGradient(current.conditionMain),
        backgroundSize: "200% 200%",
      }}
    >
      <div className="absolute inset-0 bg-[rgba(30,36,53,0.55)]" />
      <ShineSweep />
      <div className="absolute right-4 top-4 z-20">
        <ShareTodayButton />
      </div>
      <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
            Current conditions
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            {location.name}
            {location.country && (
              <span className="ml-2 text-[color:var(--color-text-muted)]">
                {location.country}
              </span>
            )}
          </h1>
          <div className="mt-6 flex items-end gap-4">
            <AnimatedTemperature celsius={current.temp} unit={unit} />
            <div className="pb-2 text-sm text-[color:var(--color-text-muted)]">
              <p>Feels like {formatTemp(current.feelsLike, unit)}</p>
              <p className="capitalize">{current.condition}</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <Stat icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${current.humidity}%`} />
            <Stat
              icon={<Wind className="h-4 w-4" />}
              label="Wind"
              value={`${formatWind(current.windSpeed, unit)} ${degreesToCardinal(current.windDeg)}`}
            />
            <Stat
              icon={<Gauge className="h-4 w-4" />}
              label="Pressure"
              value={formatPressure(current.pressure)}
            />
            <Stat
              icon={<Eye className="h-4 w-4" />}
              label="Visibility"
              value={formatVisibility(current.visibility, unit)}
            />
          </div>
        </div>
        <div className="flex items-center justify-center md:pl-8">
          <WeatherIcon
            condition={current.conditionMain}
            iconCode={current.iconCode}
            size={140}
          />
        </div>
      </div>
    </motion.section>
  );
}

function AnimatedTemperature({ celsius, unit }: { celsius: number; unit: Unit }) {
  const target = unit === "imperial" ? (celsius * 9) / 5 + 32 : celsius;
  const symbol = unit === "imperial" ? "°F" : "°C";
  const mv = useMotionValue(target);
  const rounded = useTransform(mv, (v) => `${Math.round(v)}`);

  useEffect(() => {
    const controls = animate(mv, target, {
      duration: 0.9,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [mv, target]);

  return (
    <span className="text-7xl font-light tracking-tighter md:text-8xl">
      <motion.span>{rounded}</motion.span>
      <span className="text-5xl md:text-6xl text-[color:var(--color-text-muted)] align-top ml-1">
        {symbol}
      </span>
    </span>
  );
}

function ShineSweep() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute top-0 h-full w-[40%]"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
          mixBlendMode: "screen",
        }}
        initial={{ x: "-120%" }}
        animate={{ x: "260%" }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 8,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-xl bg-[rgba(30,36,53,0.45)] p-3 ring-1 ring-[rgba(180,192,217,0.1)]"
    >
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[color:var(--color-text-muted)]">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-base font-medium">{value}</div>
    </motion.div>
  );
}
