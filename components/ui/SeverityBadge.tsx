import { cn } from "@/lib/utils";
import type { Severity } from "@/types/disaster.types";

const SEVERITY_CLASSES: Record<Severity, string> = {
  emergency: "bg-[color:var(--color-danger)]/20 text-[color:var(--color-danger)] border-[color:var(--color-danger)]/50",
  warning: "bg-[color:var(--color-warning)]/20 text-[color:var(--color-warning)] border-[color:var(--color-warning)]/50",
  watch: "bg-[color:var(--color-earth)]/30 text-[color:var(--color-light)] border-[color:var(--color-earth)]/60",
  advisory: "bg-[color:var(--color-info)]/15 text-[color:var(--color-info)] border-[color:var(--color-info)]/40",
};

export function SeverityBadge({
  severity,
  className,
  label,
}: {
  severity: Severity;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        SEVERITY_CLASSES[severity],
        className,
      )}
    >
      {label ?? severity}
    </span>
  );
}
