/**
 * Shared dashboard widgets used across Student, Instructor and Admin dashboards.
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

// ── Animation variants ────────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

// ── Icon background helper ────────────────────────────────────────
function iconBg(colorClass: string): string {
  const map: Record<string, string> = {
    "text-blue-500":    "bg-blue-500/10",
    "text-green-500":   "bg-green-500/10",
    "text-orange-500":  "bg-orange-500/10",
    "text-yellow-500":  "bg-yellow-500/10",
    "text-purple-500":  "bg-purple-500/10",
    "text-red-500":     "bg-red-500/10",
    "text-pink-500":    "bg-pink-500/10",
    "text-primary":     "bg-primary/10",
  };
  return map[colorClass] ?? "bg-muted";
}

// ── StatsCard ─────────────────────────────────────────────────────
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  /** Tailwind color class for the icon, e.g. "text-blue-500" */
  color?: string;
  /** Optional small trend label, e.g. "+12% this week" */
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ label, value, icon: Icon, color = "text-primary", trend, trendUp, className }: StatsCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <Card className={cn(
        "overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default",
        "border-b-2 border-b-transparent hover:border-b-primary/20",
        className
      )}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider truncate">
                {label}
              </p>
              <p className="text-2xl font-bold mt-1.5 tabular tracking-tight">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {trend && (
                <p className={cn(
                  "text-xs mt-1.5 font-medium flex items-center gap-1",
                  trendUp ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                )}>
                  {trendUp ? "↑" : "→"} {trend}
                </p>
              )}
            </div>
            <div className={cn("p-3 rounded-2xl shrink-0", iconBg(color))}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── ProgressRing (SVG circle) ─────────────────────────────────────
interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string; // hex or CSS color
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = "hsl(var(--primary))",
  label,
  sublabel,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

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
          <span className="text-sm font-bold tabular">{Math.round(value)}%</span>
        </div>
      </div>
      {label && <p className="text-xs font-medium text-center">{label}</p>}
      {sublabel && <p className="text-[10px] text-muted-foreground text-center">{sublabel}</p>}
    </div>
  );
}

// ── SectionHeading ────────────────────────────────────────────────
export function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground border-l-[3px] border-primary pl-3">
        {title}
      </h2>
      {action}
    </div>
  );
}

// ── EmptyPlaceholder ──────────────────────────────────────────────
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
      <div className="p-5 rounded-2xl bg-muted/60 border border-border/50 mx-auto w-fit mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground/80 mb-4 max-w-xs mx-auto leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}
