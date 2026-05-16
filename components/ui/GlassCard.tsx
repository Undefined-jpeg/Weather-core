import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong";
  padded?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", padded = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl shadow-2xl shadow-black/30 transition",
        variant === "strong" ? "glass-strong" : "glass",
        padded && "p-5",
        className,
      )}
      {...props}
    />
  ),
);
GlassCard.displayName = "GlassCard";

export function GlassCardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-3 flex items-center justify-between", className)}
      {...props}
    />
  );
}

export function GlassCardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-sm font-medium uppercase tracking-wider text-[color:var(--color-text-muted)]",
        className,
      )}
      {...props}
    />
  );
}
