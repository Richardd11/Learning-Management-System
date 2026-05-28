import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { TrendingUp, BookOpen, Award, CheckCircle2, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnrollments } from "@/hooks/use-enrollment";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, UserStats } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function ProgressPage() {
  const { data: enrollments, isLoading } = useEnrollments();
  const { data: stats } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => api.get<ApiResponse<UserStats>>("/users/stats"),
    select: (res) => res.data,
  });

  const active = enrollments?.filter((e) => e.status === "ACTIVE") ?? [];
  const completed = enrollments?.filter((e) => e.status === "COMPLETED") ?? [];
  const completionRate =
    (enrollments?.length ?? 0) > 0
      ? Math.round((completed.length / (enrollments?.length ?? 1)) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0f172a,#1e1b4b,#111827)" }}
      >
        {/* Radial glows */}
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-8 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Floating blobs */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-6 right-12 h-16 w-16 rounded-full bg-violet-500/10 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="pointer-events-none absolute bottom-8 right-1/3 h-10 w-10 rounded-full bg-cyan-400/10 blur-xl"
        />

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left */}
          <div className="flex items-center gap-5">
            <div className="rounded-2xl p-3.5 bg-white/10 ring-1 ring-white/15 shrink-0">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">My Progress</h1>
              <p className="text-white/60 text-sm">Track your learning journey across all courses</p>
            </div>
          </div>

          {/* Right — hero stats panel */}
          <div className="flex gap-4 shrink-0">
            <div className="rounded-2xl bg-white/8 ring-1 ring-white/10 px-5 py-3.5 text-center min-w-[90px]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-white/60 font-medium uppercase tracking-wide">XP</span>
              </div>
              <p className="text-2xl font-extrabold text-white tabular-nums">{stats?.xp ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white/8 ring-1 ring-white/10 px-5 py-3.5 text-center min-w-[90px]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-xs text-white/60 font-medium uppercase tracking-wide">Done</span>
              </div>
              <p className="text-2xl font-extrabold text-white tabular-nums">{completionRate}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Enrolled",
            value: enrollments?.length ?? 0,
            icon: BookOpen,
            color: "indigo",
            iconBg: "bg-indigo-500/10",
            iconRing: "ring-indigo-500/15",
            iconColor: "text-indigo-500",
          },
          {
            label: "In Progress",
            value: active.length,
            icon: Clock,
            color: "amber",
            iconBg: "bg-amber-500/10",
            iconRing: "ring-amber-500/15",
            iconColor: "text-amber-500",
          },
          {
            label: "Completed",
            value: completed.length,
            icon: Award,
            color: "green",
            iconBg: "bg-green-500/10",
            iconRing: "ring-green-500/15",
            iconColor: "text-green-500",
          },
          {
            label: "XP Earned",
            value: stats?.xp ?? 0,
            icon: CheckCircle2,
            color: "purple",
            iconBg: "bg-purple-500/10",
            iconRing: "ring-purple-500/15",
            iconColor: "text-purple-500",
          },
        ].map((s) => (
          <motion.div key={s.label} variants={item} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="rounded-2xl shadow-sm border-border/60 hover:shadow-md transition-shadow duration-300 h-full">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                </div>
                <span className={`rounded-xl p-2.5 ${s.iconBg} ring-1 ${s.iconRing} inline-flex shrink-0`}>
                  <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                </span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Active courses */}
      {!isLoading && active.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            In Progress ({active.length})
          </p>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {active.map((e) => (
              <motion.div
                key={e.id}
                variants={item}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="rounded-2xl shadow-sm border-border/60 hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/15 flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{e.course?.title}</p>
                      <p className="text-xs text-muted-foreground mb-2.5">
                        {e.course?.instructor?.firstName} {e.course?.instructor?.lastName}
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress value={e.progress} className="flex-1 h-1.5" />
                        <span className="text-xs font-semibold shrink-0 tabular-nums text-primary">{e.progress}%</span>
                      </div>
                    </div>
                    <Link to="/player/$slug" params={{ slug: e.course?.slug ?? "" }}>
                      <Button size="sm" className="rounded-xl shrink-0">Continue</Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Completed courses */}
      {!isLoading && completed.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Completed ({completed.length})
          </p>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {completed.map((e) => (
              <motion.div
                key={e.id}
                variants={item}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="rounded-2xl shadow-sm border-green-500/20 bg-green-500/5 hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 ring-1 ring-green-500/20 flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{e.course?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 rounded-lg text-xs font-semibold shrink-0"
                    >
                      100%
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Empty state */}
      {!isLoading && (enrollments?.length ?? 0) === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-20 gap-5"
        >
          <div className="rounded-3xl bg-muted/60 p-7 ring-1 ring-border/40">
            <TrendingUp className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-semibold text-lg">No courses enrolled yet</p>
            <p className="text-sm text-muted-foreground">Start learning today — browse the course catalog to get started.</p>
          </div>
          <Link to="/courses">
            <Button className="rounded-xl px-6">Browse Courses</Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
