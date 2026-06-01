import { motion } from "framer-motion";
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
    "text-emerald-300":  "bg-emerald-400/10 ring-1 ring-emerald-300/20",
    "text-emerald-400":  "bg-emerald-400/10 ring-1 ring-emerald-300/20",
  };
  return map[colorClass] ?? "bg-[#171717]";
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ label, value, icon: Icon, color = "text-emerald-300", trend, trendUp, className }: StatsCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <Card className={cn(
        "overflow-hidden group cursor-default border-[#2f3430] bg-[#101010] text-[#f5f6f7]",
        "shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300/40",
        className
      )}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8b949e]">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] tabular">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {trend && (
                <p className={cn(
                  "text-xs mt-1.5 font-medium flex items-center gap-1",
                  trendUp ? "text-emerald-300" : "text-[#8b949e]"
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
          <span className="text-sm font-bold tabular text-current">{Math.round(value)}%</span>
        </div>
      </div>
      {label && <p className="text-xs font-medium text-center">{label}</p>}
      {sublabel && <p className="text-center text-[10px] text-[#8b949e]">{sublabel}</p>}
    </div>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="border-l-[3px] border-emerald-300 pl-3 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-[#f5f6f7]">
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
      <div className="mx-auto mb-4 w-fit rounded-2xl border border-[#2f3430] bg-[#171717] p-5">
        <Icon className="h-7 w-7 text-emerald-300" />
      </div>
      <p className="mb-1 text-sm font-semibold text-[#f5f6f7]">{title}</p>
      {description && (
        <p className="mx-auto mb-4 max-w-xs text-sm leading-relaxed text-[#8b949e]">{description}</p>
      )}
      {action}
    </div>
  );
}
