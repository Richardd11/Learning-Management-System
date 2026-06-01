import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  BookOpen, Award, Flame, Zap, TrendingUp,
  GraduationCap, Megaphone, Layers, ArrowRight,
  CheckCircle2, Bell, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { useEnrollments } from "@/hooks/use-enrollment";
import { cn, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, UserStats, Announcement } from "@/types";
import {
  StatsCard, ProgressRing, SectionHeading, EmptyPlaceholder,
  stagger, fadeUp, accentVar, ACCENTS, type Accent,
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
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/20">
          <BookOpen className="h-8 w-8 text-brand" />
        </div>
        <h2 className="mb-2 font-display text-2xl font-bold tracking-tight">Sign in to view your dashboard</h2>
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

// Per-course progress bar accent rotation
const COURSE_ACCENTS: Accent[] = ["brand", "info", "success", "warning", "streak"];

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
    urgent: "border-l-[3px] border-l-destructive bg-destructive/5 text-foreground",
    high: "border-l-[3px] border-l-warning bg-warning/5 text-foreground",
    normal: "border-l-[3px] border-l-info bg-info/5 text-foreground",
    low: "border-l-[3px] border-l-muted-foreground bg-muted/40 text-foreground",
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* ── Hero greeting ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="lms-hero lms-hero-grid rounded-[28px] border border-white/10 p-6 shadow-2xl"
      >
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-stretch">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand">
                Student command center
              </p>
              <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                Welcome back, <span className="text-brand">{user?.firstName}</span>.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                Your courses, progress signals, streaks, and announcements — organized in one focused workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {user?.academicLevel && (
                <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white hover:bg-white/15">
                  <Layers className="mr-1 h-3 w-3 text-brand" /> {user.academicLevel.gradeLabel}
                </Badge>
              )}
              {user?.section && (
                <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white hover:bg-white/15">
                  <GraduationCap className="mr-1 h-3 w-3 text-brand" /> {user.section.name}
                </Badge>
              )}
              {user?.studentIdNumber && (
                <Badge className="rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white hover:bg-brand/25">
                  ID: {user.studentIdNumber}
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
              <span className="h-2 w-2 rounded-full bg-success" />
              Learning telemetry
            </div>
            <div className="flex items-center justify-between gap-4">
              <ProgressRing
                value={avgProgress}
                size={92}
                strokeWidth={8}
                color={accentVar.brand}
                label="Avg Progress"
              />
              <div className="space-y-3 text-right">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Active courses</p>
                  <p className="font-display text-3xl font-bold tracking-tight tabular">{active.length}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Completed</p>
                  <p className="font-display text-2xl font-bold tracking-tight text-success tabular">{completed.length}</p>
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
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatsCard label="Enrolled" value={statsLoading ? "—" : stats?.enrollments ?? 0} icon={BookOpen} accent="brand" />
        <StatsCard label="Completed" value={statsLoading ? "—" : stats?.completedCourses ?? 0} icon={CheckCircle2} accent="success" />
        <StatsCard label="Day Streak" value={statsLoading ? "—" : stats?.streak ?? 0} icon={Flame} accent="streak" />
        <StatsCard label="XP Points" value={statsLoading ? "—" : stats?.xp ?? 0} icon={Zap} accent="warning" />
      </motion.div>

      {/* ── Main content grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Continue Learning — 2/3 width */}
        <div className="space-y-4 lg:col-span-2">
          <SectionHeading
            title="Continue Learning"
            action={
              <Link to="/progress" className="flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand/80">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card className="border-border/70 bg-card">
            <CardContent className="divide-y divide-border p-0">
              {enrollLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : active.length > 0 ? (
                <motion.div variants={stagger} initial="hidden" animate="show">
                  {active.slice(0, 5).map((enrollment, idx) => {
                    const acc = COURSE_ACCENTS[idx % COURSE_ACCENTS.length];
                    return (
                      <motion.div key={enrollment.id} variants={fadeUp}>
                        <Link to="/player/$slug" params={{ slug: enrollment.course?.slug ?? "" }}>
                          <div className="group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-muted/50">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20 transition-colors group-hover:bg-brand/15">
                              <BookOpen className="h-5 w-5 text-brand" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold tracking-tight">{enrollment.course?.title}</p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className={cn("h-full rounded-full transition-all duration-500", ACCENTS[acc].bar)}
                                    style={{ width: `${enrollment.progress}%` }}
                                  />
                                </div>
                                <span className="shrink-0 font-display text-xs font-bold tabular text-foreground">{enrollment.progress}%</span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
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
              <SectionHeading title={`Completed (${completed.length})`} accent="success" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {completed.slice(0, 4).map((e) => (
                  <Card key={e.id} className="border-success/20 bg-card transition-colors hover:border-success/40">
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 ring-1 ring-success/20">
                        <Award className="h-4 w-4 text-success" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.course?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.completedAt ? formatDate(e.completedAt) : "Completed"}
                        </p>
                      </div>
                      <Badge className="shrink-0 bg-success text-[10px] text-success-foreground hover:bg-success/90">100%</Badge>
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
          <Card className="border-border/70 bg-card">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-4 pb-4">
              {[
                { href: "/courses", icon: BookOpen, label: "Browse Courses" },
                { href: "/progress", icon: TrendingUp, label: "My Progress" },
                { href: "/certificates", icon: Award, label: "My Certificates" },
                { href: "/announcements", icon: Bell, label: "Announcements" },
              ].map((l) => (
                <Link key={l.href} to={l.href}>
                  <div className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
                    <l.icon className="h-4 w-4 transition-colors group-hover:text-brand" />
                    {l.label}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Announcements */}
          {announcements && announcements.length > 0 && (
            <Card className="border-border/70 bg-card">
              <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <Megaphone className="h-4 w-4 text-brand" /> Announcements
                  </span>
                  <Link to="/announcements" className="text-xs font-medium text-brand transition-colors hover:text-brand/80">All</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                {announcements.slice(0, 4).map((ann) => (
                  <div
                    key={ann.id}
                    className={`rounded-lg border border-border px-3 py-2 text-xs ${priorityColor[ann.priority] ?? priorityColor.normal}`}
                  >
                    <p className="truncate font-semibold">{ann.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-muted-foreground">{ann.content}</p>
                    <p className="mt-1 text-muted-foreground/70">{formatDate(ann.createdAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Study stats */}
          {stats && (
            <Card className="border-border/70 bg-card">
              <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Learning Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                {[
                  { label: "Certificates earned", value: stats.certificates, icon: Award, color: "text-info" },
                  { label: "Total XP", value: stats.xp.toLocaleString(), icon: Zap, color: "text-warning" },
                  { label: "Current streak", value: `${stats.streak} days`, icon: Flame, color: "text-streak" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                      {s.label}
                    </span>
                    <span className="font-display font-bold">{s.value}</span>
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
