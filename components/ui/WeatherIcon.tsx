"use client";

import { motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplet,
  Moon,
  Snowflake,
  Sun,
  Tornado,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { WeatherConditionMain } from "@/types/weather.types";

export interface WeatherIconProps {
  condition?: WeatherConditionMain;
  iconCode?: string;
  className?: string;
  animated?: boolean;
  size?: number;
}

function pickIcon(
  condition?: WeatherConditionMain,
  iconCode?: string,
): { Icon: LucideIcon; color: string } {
  const isNight = iconCode?.endsWith("n");
  const c = condition || "Clear";
  switch (c) {
    case "Clear":
      return isNight
        ? { Icon: Moon, color: "var(--color-light)" }
        : { Icon: Sun, color: "#f3c969" };
    case "Clouds":
      return isNight
        ? { Icon: CloudMoon, color: "var(--color-light)" }
        : { Icon: CloudSun, color: "var(--color-light)" };
    case "Rain":
      return { Icon: CloudRain, color: "var(--color-info)" };
    case "Drizzle":
      return { Icon: CloudDrizzle, color: "var(--color-info)" };
    case "Thunderstorm":
      return { Icon: CloudLightning, color: "var(--color-warning)" };
    case "Snow":
      return { Icon: CloudSnow, color: "var(--color-light)" };
    case "Mist":
    case "Fog":
    case "Haze":
    case "Smoke":
    case "Dust":
    case "Sand":
    case "Ash":
      return { Icon: CloudFog, color: "var(--color-neutral)" };
    case "Tornado":
      return { Icon: Tornado, color: "var(--color-danger)" };
    case "Squall":
      return { Icon: Wind, color: "var(--color-warning)" };
    default:
      return { Icon: Cloud, color: "var(--color-light)" };
  }
}

interface MotionConfig {
  animate: Record<string, number | string | number[] | string[]>;
  transition: Transition;
}

function getMotionConfig(
  condition?: WeatherConditionMain,
  iconCode?: string,
): MotionConfig | null {
  const isNight = iconCode?.endsWith("n");
  const c = condition || "Clear";
  switch (c) {
    case "Clear":
      if (isNight) {
        return {
          animate: { y: [0, -6, 0] },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        };
      }
      return {
        animate: { rotate: 360, scale: [1, 1.04, 1] },
        transition: {
          rotate: { duration: 40, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        },
      };
    case "Clouds":
      return {
        animate: { x: [-4, 4, -4] },
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
      };
    case "Rain":
    case "Drizzle":
      return {
        animate: { y: [-2, 2, -2] },
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      };
    case "Snow":
      return {
        animate: { y: [-2, 2, -2] },
        transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
      };
    case "Thunderstorm":
      return {
        animate: { x: [-1, 1, -1, 1, 0], filter: ["brightness(1)", "brightness(1.8)", "brightness(1)"] },
        transition: {
          x: { duration: 0.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" },
          filter: { duration: 0.5, repeat: Infinity, repeatDelay: 4, ease: "easeOut" },
        },
      };
    case "Mist":
    case "Fog":
    case "Haze":
    case "Smoke":
    case "Dust":
    case "Sand":
    case "Ash":
      return {
        animate: { opacity: [0.65, 1, 0.65] },
        transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
      };
    case "Tornado":
      return {
        animate: { rotate: 360 },
        transition: { duration: 4, repeat: Infinity, ease: "linear" },
      };
    case "Squall":
      return {
        animate: { x: [0, 6, 0] },
        transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
      };
    default:
      return null;
  }
}

function FallingAccents({
  condition,
  size,
}: {
  condition?: WeatherConditionMain;
  size: number;
}) {
  if (condition !== "Rain" && condition !== "Drizzle" && condition !== "Snow") {
    return null;
  }
  const isSnow = condition === "Snow";
  const positions = [0.25, 0.5, 0.75];
  return (
    <div
      className="pointer-events-none absolute left-0 right-0"
      style={{ top: `${size * 0.72}px`, height: `${size * 0.4}px` }}
    >
      {positions.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${p * 100}%`, transform: "translateX(-50%)" }}
          animate={{
            y: [0, size * 0.35],
            opacity: [0, 1, 0],
            rotate: isSnow ? [0, 180] : 0,
          }}
          transition={{
            duration: 1.3,
            delay: i * 0.35,
            repeat: Infinity,
            ease: isSnow ? "easeInOut" : "easeIn",
          }}
        >
          {isSnow ? (
            <Snowflake
              size={size * 0.14}
              style={{ color: "var(--color-light)" }}
              strokeWidth={2}
            />
          ) : (
            <Droplet
              size={size * 0.12}
              style={{ color: "var(--color-info)", fill: "var(--color-info)" }}
              strokeWidth={1.5}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function WeatherIcon({
  condition,
  iconCode,
  className,
  animated = true,
  size = 64,
}: WeatherIconProps) {
  const { Icon, color } = pickIcon(condition, iconCode);
  const motionCfg = animated ? getMotionConfig(condition, iconCode) : null;

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <motion.div
        animate={motionCfg?.animate}
        transition={motionCfg?.transition}
        style={{ width: size, height: size, transformOrigin: "50% 50%" }}
      >
        <Icon
          width={size}
          height={size}
          style={{ color }}
          strokeWidth={1.5}
          className={cn(
            animated && "drop-shadow-[0_4px_12px_rgba(180,192,217,0.25)]",
            className,
          )}
        />
      </motion.div>
      {animated && <FallingAccents condition={condition} size={size} />}
    </div>
  );
}

export { Snowflake, CloudHail };
