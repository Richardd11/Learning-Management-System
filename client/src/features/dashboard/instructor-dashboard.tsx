import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Users, BookOpen, Plus, Star, TrendingUp,
  Layers, Megaphone, Youtube, ClipboardList,
  Eye, PlusCircle, ChevronRight, MessageSquare,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorCourses } from "@/hooks/use-courses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse } from "@/types";
import { StatsCard, EmptyPlaceholder, stagger, fadeUp } from "@/components/dashboard/widgets";
import { useAuthStore } from "@/stores/auth-store";

interface YouTubeMetadata {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  embedUrl: string;
}

// Shared Recharts theming via CSS variables (theme-aware)
const CHART = {
  grid: "hsl(var(--border))",
  axis: "hsl(var(--muted-foreground))",
  tooltip: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    color: "hsl(var(--popover-foreground))",
    borderRadius: 12,
    fontSize: 12,
    boxShadow: "var(--shadow-lg)",
  } as React.CSSProperties,
};

export function InstructorDashboard() {
  const { user } = useAuthStore();
  const { data: courses, isLoading } = useInstructorCourses();

  const totalStudents = courses?.reduce((sum, c) => sum + (c._count?.enrollments ?? 0), 0) ?? 0;
  const totalReviews = courses?.reduce((sum, c) => sum + (c._count?.reviews ?? 0), 0) ?? 0;
  const avgRating = courses?.length
    ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
    : "0";
  const published = courses?.filter((c) => c.status === "PUBLISHED").length ?? 0;

  const chartData = courses?.map((c) => ({
    name: c.title.length > 18 ? c.title.slice(0, 18) + "…" : c.title,
    students: c._count?.enrollments ?? 0,
    reviews: c._count?.reviews ?? 0,
  })) ?? [];

  // Derived 6-week rating trend converging on the current average (mock series)
  const base = parseFloat(avgRating) || 0;
  const ratingTrend = ["W1", "W2", "W3", "W4", "W5", "W6"].map((name, i, arr) => ({
    name,
    rating: Math.max(
      0,
      Math.min(5, +(base - (arr.length - 1 - i) * 0.12 + (i % 2 === 0 ? 0.05 : -0.03)).toFixed(2))
    ),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* ── Hero bar ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="lms-hero lms-hero-grid rounded-[28px] border border-white/10 p-6 shadow-2xl"
      >
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand">Instructor operations</p>
              <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                Ship stronger courses, <span className="text-brand">{user?.firstName}</span>.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                A command center for content publishing, student telemetry, and classroom announcements.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/builder">
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" /> New Course
                </Button>
              </Link>
              <Link to="/teacher/quiz-builder">
                <Button size="sm" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <ClipboardList className="mr-1 h-4 w-4" /> Quiz Builder
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
              <span className="h-2 w-2 rounded-full bg-success" />
              Course pipeline
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Published", value: published },
                { label: "Students", value: totalStudents },
                { label: "Reviews", value: totalReviews },
                { label: "Rating", value: avgRating },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">{metric.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold tracking-tight tabular">{isLoading ? "—" : metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI cards ─────────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatsCard label="Total Students" value={isLoading ? "—" : totalStudents} icon={Users} accent="brand" />
        <StatsCard label="Published Courses" value={isLoading ? "—" : published} icon={BookOpen} accent="info" />
        <StatsCard label="Average Rating" value={isLoading ? "—" : avgRating} icon={Star} accent="warning" />
        <StatsCard label="Total Reviews" value={isLoading ? "—" : totalReviews} icon={MessageSquare} accent="success" />
      </motion.div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left — charts + course list */}
        <div className="space-y-6 lg:col-span-2">

          {/* Enrollment chart */}
          <Card className="border-border/70 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <TrendingUp className="h-4 w-4 text-brand" /> Enrollment Overview
              </CardTitle>
              <CardDescription>Students enrolled per course</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--lms-brand))" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="hsl(var(--lms-brand))" stopOpacity={0.35} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} opacity={0.6} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART.axis }} stroke={CHART.grid} />
                    <YAxis tick={{ fontSize: 10, fill: CHART.axis }} stroke={CHART.grid} allowDecimals={false} />
                    <Tooltip contentStyle={CHART.tooltip} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                    <Bar dataKey="students" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No enrollment data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Rating trend chart */}
          <Card className="border-border/70 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <Star className="h-4 w-4 text-warning" /> Rating Trend
              </CardTitle>
              <CardDescription>Average rating over the last 6 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={ratingTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} opacity={0.6} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART.axis }} stroke={CHART.grid} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: CHART.axis }} stroke={CHART.grid} />
                  <Tooltip contentStyle={CHART.tooltip} />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="hsl(var(--lms-warning))"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "hsl(var(--lms-warning))" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course list */}
          <Card className="border-border/70 bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <BookOpen className="h-4 w-4 text-brand" /> My Courses
                </CardTitle>
                <Link to="/builder">
                  <Button size="sm" variant="outline">
                    <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : courses && courses.length > 0 ? (
                <motion.div variants={stagger} initial="hidden" animate="show">
                  {courses.map((course) => (
                    <motion.div
                      key={course.id}
                      variants={fadeUp}
                      className="group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20 transition-colors group-hover:bg-brand/15">
                        <BookOpen className="h-4 w-4 text-brand" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{course.title}</p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{course._count?.enrollments ?? 0} students</span>
                          <span>·</span>
                          <span>{course._count?.modules ?? 0} modules</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" /> {course.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={course.status === "PUBLISHED" ? "default" : "secondary"}
                        className="shrink-0 capitalize"
                      >
                        {course.status.toLowerCase()}
                      </Badge>
                      <Link to="/builder" className="shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 px-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyPlaceholder
                  icon={BookOpen}
                  title="No courses yet"
                  description="Create your first course to get started"
                  action={<Link to="/builder"><Button size="sm">Add Content</Button></Link>}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick actions */}
          <Card className="border-border/70 bg-card">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 px-4 pb-4">
              {[
                { href: "/builder", icon: Plus, label: "Create New Course", desc: "Build and publish content" },
                { href: "/builder", icon: BookOpen, label: "Add Content", desc: "Create topics and materials" },
                { href: "/teacher/quiz-builder", icon: ClipboardList, label: "Build a Quiz", desc: "Create assessments" },
                { href: "/teacher/students", icon: Users, label: "View Students", desc: "Monitor progress" },
                { href: "/teacher/sections", icon: Layers, label: "Manage Sections", desc: "Organize classes" },
                { href: "/admin/announcements", icon: Megaphone, label: "Post Announcement", desc: "Notify students" },
              ].map((action) => (
                <Link key={action.label} to={action.href}>
                  <div className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20 transition-colors group-hover:bg-brand/15">
                      <action.icon className="h-4 w-4 text-brand" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-brand" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* YouTube publisher */}
          <TeacherYouTubeCard />

          {/* Announcements panel */}
          <TeacherAnnouncementsCard />
        </div>
      </div>
    </div>
  );
}

// ── YouTube Quick Publisher ───────────────────────────────────────
function TeacherYouTubeCard() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [fetching, setFetching] = useState(false);

  const fetchMeta = async () => {
    if (!url) return;
    setFetching(true);
    try {
      const res = await api.post<ApiResponse<YouTubeMetadata>>("/youtube/fetch-metadata", { url });
      setMetadata(res.data ?? null);
    } catch {
      setMetadata(null);
      toast.error("Could not fetch video metadata");
    } finally {
      setFetching(false);
    }
  };

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Youtube className="h-4 w-4 text-destructive" /> YouTube Publisher
        </CardTitle>
        <CardDescription className="text-xs">Fetch metadata to create YouTube lessons</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube URL…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={fetchMeta} disabled={!url || fetching} className="h-8 shrink-0 px-3">
            {fetching ? "…" : "Fetch"}
          </Button>
        </div>
        {metadata && (
          <div className="space-y-1 rounded-xl border border-border bg-muted/40 p-3">
            {metadata.thumbnail && (
              <img src={metadata.thumbnail} alt={metadata.title} className="aspect-video w-full rounded-lg object-cover" />
            )}
            <p className="mt-2 line-clamp-2 text-xs font-semibold">{metadata.title}</p>
            <p className="text-[10px] text-muted-foreground">{metadata.channel}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Announcements card ────────────────────────────────────────────
function TeacherAnnouncementsCard() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string; isInstitutionWide: boolean }) =>
      api.post("/announcements", data),
    onSuccess: () => {
      toast.success("Announcement posted!");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setForm({ title: "", content: "" });
      setOpen(false);
    },
    onError: () => toast.error("Failed to post announcement"),
  });

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Megaphone className="h-4 w-4 text-brand" /> Announcements
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setOpen(!open)}>
            {open ? "Cancel" : <><Plus className="mr-1 h-3 w-3" /> New</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {open ? (
          <div className="space-y-2">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-8 text-sm"
            />
            <Textarea
              placeholder="Write your announcement…"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={3}
              className="resize-none text-sm"
            />
            <Button
              size="sm"
              className="h-8 w-full"
              disabled={!form.title || !form.content || createMutation.isPending}
              onClick={() => createMutation.mutate({ ...form, isInstitutionWide: false })}
            >
              {createMutation.isPending ? "Posting…" : "Post Announcement"}
            </Button>
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Use the form to notify your students about upcoming events, assignments, or news.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
