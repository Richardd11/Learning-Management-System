import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  BookOpen, Award, Flame, Zap, TrendingUp,
  GraduationCap, Megaphone, Layers, ArrowRight,
  CheckCircle2, Clock, Bell, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Sign in to view your dashboard</h2>
        <p className="text-muted-foreground mb-6">
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
    low: "bg-muted/50 border-border/50 border-l-[3px] border-l-muted-foreground/30 text-muted-foreground",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Hero greeting ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground shadow-lg"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-primary-foreground/75 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {user?.academicLevel && (
                <Badge className="bg-white/20 text-primary-foreground border-white/30 hover:bg-white/30">
                  <Layers className="h-3 w-3 mr-1" /> {user.academicLevel.gradeLabel}
                </Badge>
              )}
              {user?.section && (
                <Badge className="bg-white/20 text-primary-foreground border-white/30 hover:bg-white/30">
                  <GraduationCap className="h-3 w-3 mr-1" /> {user.section.name}
                </Badge>
              )}
              {user?.studentIdNumber && (
                <Badge className="bg-white/20 text-primary-foreground border-white/30 hover:bg-white/30">
                  ID: {user.studentIdNumber}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing
              value={avgProgress}
              size={72}
              strokeWidth={7}
              color="rgba(255,255,255,0.9)"
              label="Avg Progress"
            />
          </div>
        </div>
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/8 pointer-events-none" />
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
          color="text-blue-500"
        />
        <StatsCard
          label="Completed"
          value={statsLoading ? "—" : stats?.completedCourses ?? 0}
          icon={CheckCircle2}
          color="text-green-500"
        />
        <StatsCard
          label="Day Streak"
          value={statsLoading ? "—" : stats?.streak ?? 0}
          icon={Flame}
          color="text-orange-500"
        />
        <StatsCard
          label="XP Points"
          value={statsLoading ? "—" : stats?.xp ?? 0}
          icon={Zap}
          color="text-yellow-500"
        />
      </motion.div>

      {/* ── Main content grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Continue Learning — 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeading
            title="Continue Learning"
            action={
              <Link to="/progress" className="text-xs text-primary flex items-center gap-1 hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card>
            <CardContent className="p-0 divide-y">
              {enrollLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : active.length > 0 ? (
                <motion.div variants={stagger} initial="hidden" animate="show">
                  {active.slice(0, 5).map((enrollment) => (
                    <motion.div key={enrollment.id} variants={fadeUp}>
                      <Link to="/player/$slug" params={{ slug: enrollment.course?.slug ?? "" }}>
                        <div className="flex items-center gap-4 p-4 hover:bg-accent/60 transition-colors group cursor-pointer">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:from-primary/25 group-hover:to-primary/10 transition-all">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-sm tracking-[-0.01em]">{enrollment.course?.title}</p>
                            <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                              {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={enrollment.progress} className="flex-1 h-1.5" />
                              <span className="text-xs font-bold text-primary shrink-0 tabular">{enrollment.progress}%</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
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
                  <Card key={e.id} className="border-green-500/20 bg-green-500/5">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{e.course?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.completedAt ? formatDate(e.completedAt) : "Completed"}
                        </p>
                      </div>
                      <Badge className="bg-green-600 text-white text-[10px] shrink-0">100%</Badge>
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
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1">
              {[
                { href: "/courses", icon: BookOpen, label: "Browse Courses" },
                { href: "/progress", icon: TrendingUp, label: "My Progress" },
                { href: "/certificates", icon: Award, label: "My Certificates" },
                { href: "/announcements", icon: Bell, label: "Announcements" },
              ].map((l) => (
                <Link key={l.href} to={l.href}>
                  <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <l.icon className="h-4 w-4 group-hover:text-primary transition-colors" />
                    {l.label}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Announcements */}
          {announcements && announcements.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <Megaphone className="h-4 w-4 text-primary" /> Announcements
                  </span>
                  <Link to="/announcements" className="text-xs text-primary hover:underline">All</Link>
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
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Learning Stats</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {[
                  { label: "Certificates earned", value: stats.certificates, icon: Award, color: "text-yellow-500" },
                  { label: "Total XP", value: stats.xp.toLocaleString(), icon: Zap, color: "text-yellow-500" },
                  { label: "Current streak", value: `${stats.streak} days`, icon: Flame, color: "text-orange-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
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
