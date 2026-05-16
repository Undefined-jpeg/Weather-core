"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { WeatherConditionMain } from "@/types/weather.types";
import { conditionGradient } from "@/lib/formatters";

interface Particle {
  x: number;
  y: number;
  delay: number;
  duration: number;
  scale: number;
  drift: number;
}

function pseudoRandom(seed: number, i: number, mod = 97): number {
  return ((seed * (i + 1) * 9301 + 49297) % mod) / mod;
}

function makeParticles(n: number, seed: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: pseudoRandom(seed, i, 1000),
      y: pseudoRandom(seed * 3, i, 1000),
      delay: pseudoRandom(seed * 7, i, 100) * 6,
      duration: 2 + pseudoRandom(seed * 11, i, 100) * 4,
      scale: 0.3 + pseudoRandom(seed * 13, i, 100) * 0.7,
      drift: (pseudoRandom(seed * 17, i, 100) - 0.5) * 40,
    });
  }
  return out;
}

export interface AnimatedBackgroundProps {
  condition?: WeatherConditionMain;
  iconCode?: string;
  reduced?: boolean;
}

export function AnimatedBackground({
  condition = "Clear",
  iconCode,
  reduced = false,
}: AnimatedBackgroundProps) {
  const gradient = conditionGradient(condition);
  const isNight = iconCode?.endsWith("n");

  if (reduced) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{ backgroundImage: gradient }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(30,36,53,0.95)_100%)]" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        key={`${condition}-${isNight ? "n" : "d"}`}
        className="anim-gradient absolute inset-0 opacity-70"
        style={{
          backgroundImage: gradient,
          backgroundSize: "200% 200%",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1.4 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_70%)]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${condition}-${isNight ? "n" : "d"}-layer`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {condition === "Clear" && !isNight && <SunLayer />}
          {condition === "Clear" && isNight && <StarLayer />}
          {condition === "Clouds" && <CloudLayer />}
          {(condition === "Rain" || condition === "Drizzle") && (
            <RainLayer heavy={condition === "Rain"} />
          )}
          {condition === "Thunderstorm" && <ThunderstormLayer />}
          {condition === "Snow" && <SnowLayer />}
          {(condition === "Mist" || condition === "Fog" || condition === "Haze") && (
            <FogLayer />
          )}
          {(condition === "Tornado" || condition === "Squall") && <WindLayer />}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(30,36,53,0.95)_100%)]" />
    </div>
  );
}

function SunLayer() {
  const rays = Array.from({ length: 12 });
  return (
    <>
      <div className="absolute left-1/2 top-[-15vh] h-[60vh] w-[60vh] -translate-x-1/2">
        <motion.div
          className="anim-sun absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(243,201,105,0.55) 0%, rgba(243,201,105,0.2) 30%, transparent 65%)",
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="anim-sun absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {rays.map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 h-[50vh] w-[2px] origin-top"
              style={{
                transform: `translate(-50%, 0) rotate(${(i * 360) / rays.length}deg)`,
                background:
                  "linear-gradient(180deg, rgba(243,201,105,0.35) 0%, transparent 70%)",
              }}
            />
          ))}
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[20vh]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(243,201,105,0.06) 100%)",
          backdropFilter: "blur(2px)",
        }}
        animate={{ x: [0, 4, 0], skewX: [0, 0.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function StarLayer() {
  const stars = useMemo(() => makeParticles(80, 23), []);
  return (
    <>
      <div
        className="absolute right-[10%] top-[8%] h-40 w-40 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(180,192,217,0.35) 0%, rgba(180,192,217,0.05) 40%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0">
        {stars.map((p, i) => (
          <motion.div
            key={i}
            className="anim-twinkle absolute rounded-full bg-white"
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              width: `${1 + p.scale * 2}px`,
              height: `${1 + p.scale * 2}px`,
              boxShadow: "0 0 4px rgba(255,255,255,0.6)",
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 1.5 + p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </>
  );
}

function CloudLayer() {
  const slow = useMemo(() => makeParticles(5, 31), []);
  const mid = useMemo(() => makeParticles(5, 53), []);
  const fast = useMemo(() => makeParticles(4, 71), []);

  const renderBand = (
    particles: Particle[],
    duration: number,
    sizeBase: number,
    opacity: number,
  ) =>
    particles.map((p, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-3xl"
        style={{
          top: `${p.y * 70}%`,
          width: `${sizeBase + p.scale * 300}px`,
          height: `${sizeBase * 0.4 + p.scale * 100}px`,
          background: `rgba(180,192,217,${opacity})`,
        }}
        animate={{ x: ["-40vw", "120vw"] }}
        transition={{
          duration: duration + p.duration * 5,
          delay: p.delay * 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ));

  return (
    <div className="absolute inset-0">
      {renderBand(slow, 90, 500, 0.08)}
      {renderBand(mid, 55, 380, 0.1)}
      {renderBand(fast, 35, 280, 0.12)}
    </div>
  );
}

function RainLayer({ heavy }: { heavy: boolean }) {
  const drops = useMemo(() => makeParticles(heavy ? 90 : 50, 41), [heavy]);
  const splashes = useMemo(() => makeParticles(heavy ? 14 : 0, 59), [heavy]);

  return (
    <div className="absolute inset-0">
      {drops.map((p, i) => (
        <motion.div
          key={i}
          className="absolute top-[-10%] w-px bg-gradient-to-b from-transparent via-[color:var(--color-info)] to-transparent"
          style={{
            left: `${p.x * 100}%`,
            height: `${30 + p.scale * 40}px`,
            opacity: 0.45 + p.scale * 0.4,
          }}
          animate={{ y: ["0vh", "115vh"] }}
          transition={{
            duration: 0.7 + p.duration / 5,
            delay: p.delay / 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      <div className="hidden md:block">
        {splashes.map((p, i) => (
          <motion.div
            key={`s-${i}`}
            className="absolute rounded-full border border-[color:var(--color-info)]"
            style={{
              left: `${p.x * 100}%`,
              bottom: `${5 + p.y * 6}%`,
              width: "8px",
              height: "8px",
              opacity: 0.5,
            }}
            animate={{ scale: [0, 2.4], opacity: [0.6, 0] }}
            transition={{
              duration: 1.1,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ThunderstormLayer() {
  const [flashId, setFlashId] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const next = 4000 + Math.random() * 10000;
      timeout = setTimeout(() => {
        setFlashId((x) => x + 1);
        schedule();
      }, next);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <RainLayer heavy />
      <AnimatePresence>
        <motion.div
          key={flashId}
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.55, 0.05, 0.7, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, times: [0, 0.1, 0.25, 0.45, 1] }}
        />
      </AnimatePresence>
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(180,192,217,0.08) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function SnowLayer() {
  const near = useMemo(() => makeParticles(45, 67), []);
  const far = useMemo(() => makeParticles(35, 89), []);

  const renderBand = (particles: Particle[], depth: number) =>
    particles.map((p, i) => (
      <motion.div
        key={`${depth}-${i}`}
        className="absolute top-[-5%] rounded-full bg-[color:var(--color-light)]"
        style={{
          left: `${p.x * 100}%`,
          width: `${(depth === 1 ? 3 : 5) * p.scale}px`,
          height: `${(depth === 1 ? 3 : 5) * p.scale}px`,
          opacity: depth === 1 ? 0.5 : 0.85,
        }}
        animate={{
          y: ["0vh", "110vh"],
          x: [0, p.drift, 0],
        }}
        transition={{
          duration: (depth === 1 ? 9 : 6) + p.duration,
          delay: p.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ));

  return (
    <div className="absolute inset-0">
      {renderBand(far, 1)}
      {renderBand(near, 2)}
    </div>
  );
}

function FogLayer() {
  const blobs = useMemo(() => makeParticles(6, 97), []);
  return (
    <div className="absolute inset-0" style={{ mixBlendMode: "screen" }}>
      {blobs.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            top: `${p.y * 80}%`,
            width: `${400 + p.scale * 400}px`,
            height: `${200 + p.scale * 200}px`,
            background: "rgba(180,192,217,0.18)",
          }}
          animate={{
            x: ["-30vw", "120vw"],
            rotate: [0, 360],
          }}
          transition={{
            duration: 80 + p.duration * 10,
            delay: p.delay * 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function WindLayer() {
  const streaks = useMemo(() => makeParticles(30, 113), []);
  return (
    <div className="absolute inset-0">
      <motion.div
        className="absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(112,115,90,0.18) 0%, transparent 70%)",
        }}
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      {streaks.map((p, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px]"
          style={{
            top: `${p.y * 100}%`,
            width: `${60 + p.scale * 120}px`,
            background:
              "linear-gradient(90deg, transparent, rgba(180,192,217,0.55), transparent)",
            opacity: 0.6,
          }}
          animate={{ x: ["-20vw", "120vw"] }}
          transition={{
            duration: 1.2 + p.duration / 3,
            delay: p.delay / 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
