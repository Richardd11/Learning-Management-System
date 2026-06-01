import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

// ── Semantic accent system (all colors via CSS variables) ─────────
export type Accent = "brand" | "success" | "warning" | "info" | "streak" | "primary";

interface AccentTokens {
  text: string;
  chip: string;
  ring: string;
  bar: string;
}

export const ACCENTS: Record<Accent, AccentTokens> = {
  brand: { text: "text-brand", chip: "bg-brand/10", ring: "ring-brand/25", bar: "bg-brand" },
  success: { text: "text-success", chip: "bg-success/10", ring: "ring-success/25", bar: "bg-success" },
  warning: { text: "text-warning", chip: "bg-warning/10", ring: "ring-warning/25", bar: "bg-warning" },
  info: { text: "text-info", chip: "bg-info/10", ring: "ring-info/25", bar: "bg-info" },
  streak: { text: "text-streak", chip: "bg-streak/10", ring: "ring-streak/25", bar: "bg-streak" },
  primary: { text: "text-primary", chip: "bg-primary/10", ring: "ring-primary/25", bar: "bg-primary" },
};

// Map an accent name to a runtime CSS color (for SVG strokes / chart fills)
export const accentVar: Record<Accent, string> = {
  brand: "hsl(var(--lms-brand))",
  success: "hsl(var(--lms-success))",
  warning: "hsl(var(--lms-warning))",
  info: "hsl(var(--lms-info))",
  streak: "hsl(var(--lms-streak))",
  primary: "hsl(var(--primary))",
};

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: Accent;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
  trend,
  trendUp,
  className,
}: StatsCardProps) {
  const a = ACCENTS[accent];
  return (
    <motion.div variants={fadeUp}>
      <Card
        className={cn(
          "group relative overflow-hidden border-border/70 bg-card cursor-default",
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-lg",
          className
        )}
      >
        {/* Accent wash that intensifies on hover */}
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity duration-200 group-hover:opacity-100",
            a.bar
          )}
        />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold leading-none tracking-tight tabular">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {trend && (
                <span
                  className={cn(
                    "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    trendUp ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  )}
                >
                  {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                  {trend}
                </span>
              )}
            </div>
            <div className={cn("shrink-0 rounded-2xl p-3 ring-1", a.chip, a.ring)}>
              <Icon className={cn("h-5 w-5", a.text)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = "hsl(var(--lms-brand))",
  label,
  sublabel,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-base font-bold tabular text-current">
            {Math.round(value)}%
          </span>
        </div>
      </div>
      {label && <p className="text-center text-xs font-medium">{label}</p>}
      {sublabel && <p className="text-center text-[11px] text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

export function SectionHeading({
  title,
  action,
  accent = "brand",
}: {
  title: string;
  action?: React.ReactNode;
  accent?: Accent;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-3 font-display text-lg font-bold tracking-tight text-foreground">
        <span className={cn("h-5 w-1.5 rounded-full", ACCENTS[accent].bar)} />
        {title}
      </h2>
      {action}
    </div>
  );
}

export function EmptyPlaceholder({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto mb-4 w-fit rounded-2xl border border-border bg-muted/40 p-5">
        <Icon className="h-7 w-7 text-brand" />
      </div>
      <p className="mb-1 font-display text-sm font-bold text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mb-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
