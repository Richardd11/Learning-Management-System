import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  BookOpen, Award, Flame, Zap, TrendingUp,
  GraduationCap, Megaphone, Layers, ArrowRight,
  CheckCircle2, Bell, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { useEnrollments } from "@/hooks/use-enrollment";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, UserStats, Announcement } from "@/types";
import {
  StatsCard, ProgressRing, SectionHeading, EmptyPlaceholder,
  stagger, fadeUp,
} from "@/components/dashboard/widgets";
import { InstructorDashboard } from "./instructor-dashboard";
import { AdminPanel } from "@/features/admin";

// ── Role router ──────────────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return <GuestHero />;
  if (user.role === "TEACHER") return <InstructorDashboard />;
  if (user.role === "ADMIN") return <AdminPanel />;
  return <StudentDashboard />;
}

// ── Guest hero ────────────────────────────────────────────────────
function GuestHero() {
  return (
    <div className="max-w-lg mx-auto min-h-[60vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-300/10">
          <BookOpen className="h-8 w-8 text-emerald-300" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Sign in to view your dashboard</h2>
        <p className="mb-6 text-muted-foreground">
          Track your courses, streaks, and certificates — all in one place.
        </p>
        <Link to="/login">
          <Button size="lg">Log in to continue</Button>
        </Link>
      </motion.div>
    </div>
  );
}

// ── Student Dashboard ─────────────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuthStore();
  const { data: enrollments, isLoading: enrollLoading } = useEnrollments();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => api.get<ApiResponse<UserStats>>("/users/stats"),
    select: (res) => res.data,
  });

  const { data: announcements } = useQuery({
    queryKey: ["studentAnnouncements"],
    queryFn: () => api.get<ApiResponse<Announcement[]>>("/announcements/my"),
    select: (res) => res.data,
    enabled: user?.role === "STUDENT",
  });

  const active = enrollments?.filter((e) => e.status === "ACTIVE") ?? [];
  const completed = enrollments?.filter((e) => e.status === "COMPLETED") ?? [];
  const avgProgress = active.length
    ? Math.round(active.reduce((s, e) => s + e.progress, 0) / active.length)
    : 0;

  const priorityColor: Record<string, string> = {
    urgent: "bg-red-500/8 border-red-500/20 border-l-[3px] border-l-red-500 text-red-700 dark:text-red-400",
    high: "bg-orange-500/8 border-orange-500/20 border-l-[3px] border-l-orange-500 text-orange-700 dark:text-orange-400",
    normal: "bg-blue-500/8 border-blue-500/20 border-l-[3px] border-l-blue-500 text-blue-700 dark:text-blue-400",
    low: "bg-[#171717] border-[#2f3430] border-l-[3px] border-l-[#8b949e] text-[#bdbdbd]",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Hero greeting ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[28px] border border-[#2f3430] bg-[#101010] p-6 text-[#f5f6f7] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_10%,rgba(0,217,146,0.20),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:46px_46px] opacity-30" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-stretch">
          <div className="space-y-6">
            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Student command center</p>
              <h1 className="max-w-3xl text-4xl font-normal leading-[1.02] tracking-[-0.055em] md:text-5xl">
                Welcome back, <span className="text-emerald-300">{user?.firstName}</span>.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#bdbdbd] md:text-base">
                Your courses, progress signals, streaks, and announcements are organized in a terminal-native workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {user?.academicLevel && (
                <Badge className="rounded-full border border-[#3d3a39] bg-[#171717] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#f5f6f7] hover:bg-[#1f1f1f]">
                  <Layers className="mr-1 h-3 w-3 text-emerald-300" /> {user.academicLevel.gradeLabel}
                </Badge>
              )}
              {user?.section && (
                <Badge className="rounded-full border border-[#3d3a39] bg-[#171717] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#f5f6f7] hover:bg-[#1f1f1f]">
                  <GraduationCap className="mr-1 h-3 w-3 text-emerald-300" /> {user.section.name}
                </Badge>
              )}
              {user?.studentIdNumber && (
                <Badge className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-emerald-200 hover:bg-emerald-300/15">
                  ID: {user.studentIdNumber}
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2f3430] bg-black/35 p-4 font-mono shadow-inner">
            <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#8b949e]">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              learning telemetry
            </div>
            <div className="flex items-center justify-between gap-4">
              <ProgressRing
                value={avgProgress}
                size={92}
                strokeWidth={8}
                color="#00d992"
                label="Avg Progress"
              />
              <div className="space-y-3 text-right">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#8b949e]">Active courses</p>
                  <p className="text-3xl font-semibold tracking-[-0.05em] text-[#f5f6f7] tabular">{active.length}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#8b949e]">Completed</p>
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-emerald-300 tabular">{completed.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats row ────────────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          label="Enrolled"
          value={statsLoading ? "—" : stats?.enrollments ?? 0}
          icon={BookOpen}
          color="text-emerald-300"
        />
        <StatsCard
          label="Completed"
          value={statsLoading ? "—" : stats?.completedCourses ?? 0}
          icon={CheckCircle2}
          color="text-emerald-300"
        />
        <StatsCard
          label="Day Streak"
          value={statsLoading ? "—" : stats?.streak ?? 0}
          icon={Flame}
          color="text-emerald-300"
        />
        <StatsCard
          label="XP Points"
          value={statsLoading ? "—" : stats?.xp ?? 0}
          icon={Zap}
          color="text-emerald-300"
        />
      </motion.div>

      {/* ── Main content grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Continue Learning — 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeading
            title="Continue Learning"
            action={
              <Link to="/progress" className="flex items-center gap-1 text-xs text-emerald-300 hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card className="border-[#2f3430] bg-[#101010] text-[#f5f6f7] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <CardContent className="divide-y divide-[#2f3430] p-0">
              {enrollLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : active.length > 0 ? (
                <motion.div variants={stagger} initial="hidden" animate="show">
                  {active.slice(0, 5).map((enrollment) => (
                    <motion.div key={enrollment.id} variants={fadeUp}>
                      <Link to="/player/$slug" params={{ slug: enrollment.course?.slug ?? "" }}>
                        <div className="group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-emerald-300/5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 transition-all group-hover:bg-emerald-300/15">
                            <BookOpen className="h-5 w-5 text-emerald-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-sm tracking-[-0.01em]">{enrollment.course?.title}</p>
                            <p className="mt-0.5 truncate text-xs text-[#8b949e]">
                              {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={enrollment.progress} className="flex-1 h-1.5" />
                              <span className="shrink-0 font-mono text-xs font-bold text-emerald-300 tabular">{enrollment.progress}%</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-[#8b949e] transition-all group-hover:translate-x-0.5 group-hover:text-emerald-300" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyPlaceholder
                  icon={BookOpen}
                  title="No active courses yet"
                  description="Browse our catalog and start learning today!"
                  action={<Link to="/courses"><Button size="sm">Browse Courses</Button></Link>}
                />
              )}
            </CardContent>
          </Card>

          {/* Completed courses strip */}
          {completed.length > 0 && (
            <>
              <SectionHeading title={`Completed (${completed.length})`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {completed.slice(0, 4).map((e) => (
                  <Card key={e.id} className="border-emerald-300/20 bg-[#101010] text-[#f5f6f7]">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-300/10">
                        <Award className="h-4 w-4 text-emerald-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{e.course?.title}</p>
                        <p className="text-xs text-[#8b949e]">
                          {e.completedAt ? formatDate(e.completedAt) : "Completed"}
                        </p>
                      </div>
                      <Badge className="shrink-0 bg-emerald-300 text-[10px] text-[#101010]">100%</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-4">

          {/* Quick links */}
          <Card className="border-[#2f3430] bg-[#101010] text-[#f5f6f7] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b949e]">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-4 pb-4">
              {[
                { href: "/courses", icon: BookOpen, label: "Browse Courses" },
                { href: "/progress", icon: TrendingUp, label: "My Progress" },
                { href: "/certificates", icon: Award, label: "My Certificates" },
                { href: "/announcements", icon: Bell, label: "Announcements" },
              ].map((l) => (
                <Link key={l.href} to={l.href}>
                  <div className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-[#bdbdbd] transition-colors hover:bg-emerald-300/5 hover:text-[#f5f6f7]">
                    <l.icon className="h-4 w-4 transition-colors group-hover:text-emerald-300" />
                    {l.label}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Announcements */}
          {announcements && announcements.length > 0 && (
            <Card className="border-[#2f3430] bg-[#101010] text-[#f5f6f7] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <Megaphone className="h-4 w-4 text-emerald-300" /> Announcements
                  </span>
                  <Link to="/announcements" className="text-xs text-emerald-300 hover:underline">All</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {announcements.slice(0, 4).map((ann) => (
                  <div
                    key={ann.id}
                    className={`rounded-lg border px-3 py-2 text-xs ${priorityColor[ann.priority] ?? priorityColor.normal}`}
                  >
                    <p className="font-semibold truncate">{ann.title}</p>
                    <p className="mt-0.5 line-clamp-2 opacity-80">{ann.content}</p>
                    <p className="mt-1 opacity-60">{formatDate(ann.createdAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Study stats */}
          {stats && (
            <Card className="border-[#2f3430] bg-[#101010] text-[#f5f6f7] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
              <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b949e]">Learning Stats</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {[
                  { label: "Certificates earned", value: stats.certificates, icon: Award, color: "text-yellow-500" },
                  { label: "Total XP", value: stats.xp.toLocaleString(), icon: Zap, color: "text-yellow-500" },
                  { label: "Current streak", value: `${stats.streak} days`, icon: Flame, color: "text-orange-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#8b949e]">
                      <s.icon className="h-3.5 w-3.5 text-emerald-300" />
                      {s.label}
                    </span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
