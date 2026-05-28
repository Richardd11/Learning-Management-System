import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Users, BookOpen, Plus, Star, TrendingUp,
  Layers, Megaphone, Youtube, ClipboardList,
  Eye, PlusCircle, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Hero bar ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[28px] border border-[#2f3430] bg-[#101010] p-6 text-[#f5f6f7] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(0,217,146,0.22),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:46px_46px] opacity-30" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="space-y-6">
            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Instructor operations</p>
              <h1 className="max-w-3xl text-4xl font-normal leading-[1.02] tracking-[-0.055em] md:text-5xl">
                Ship stronger courses, <span className="text-emerald-300">{user?.firstName}</span>.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#bdbdbd] md:text-base">
                A command-center dashboard for content publishing, student telemetry, and classroom announcements.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/builder">
                <Button size="sm" className="bg-emerald-300 text-[#101010] hover:bg-emerald-200">
                  <Plus className="h-4 w-4 mr-1" /> New Course
                </Button>
              </Link>
              <Link to="/teacher/quiz-builder">
                <Button size="sm" variant="outline" className="border-[#3d3a39] bg-[#101010] text-[#f5f6f7] hover:bg-emerald-300/10 hover:text-emerald-200">
                  <ClipboardList className="h-4 w-4 mr-1" /> Quiz Builder
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2f3430] bg-black/35 p-4 font-mono shadow-inner">
            <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#8b949e]">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              course pipeline
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Published", value: published },
                { label: "Students", value: totalStudents },
                { label: "Reviews", value: totalReviews },
                { label: "Rating", value: avgRating },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl border border-[#2f3430] bg-[#171717] p-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#8b949e]">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#f5f6f7] tabular">{isLoading ? "—" : metric.value}</p>
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard label="Total Students" value={isLoading ? "—" : totalStudents} icon={Users} color="text-emerald-300" />
        <StatsCard label="Published Courses" value={isLoading ? "—" : published} icon={BookOpen} color="text-emerald-300" />
        <StatsCard label="Average Rating" value={isLoading ? "—" : avgRating} icon={Star} color="text-emerald-300" />
        <StatsCard label="Total Reviews" value={isLoading ? "—" : totalReviews} icon={TrendingUp} color="text-emerald-300" />
      </motion.div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — chart + course list */}
        <div className="lg:col-span-2 space-y-6">

          {/* Enrollment chart */}
          <Card className="border-[#2f3430] bg-[#101010] text-[#f5f6f7] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-emerald-300" /> Enrollment Overview
              </CardTitle>
              <CardDescription className="text-[#8b949e]">Students enrolled per course</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3430" opacity={0.7} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8b949e" }} stroke="#3d3a39" />
                    <YAxis tick={{ fontSize: 10, fill: "#8b949e" }} stroke="#3d3a39" />
                    <Tooltip
                      contentStyle={{
                        background: "#101010",
                        border: "1px solid #2f3430",
                        color: "#f5f6f7",
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar dataKey="students" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-[#8b949e]">No enrollment data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Course list */}
          <Card className="border-[#2f3430] bg-[#101010] text-[#f5f6f7] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-300" /> My Courses
                </CardTitle>
                <Link to="/builder">
                  <Button size="sm" variant="outline" className="border-[#3d3a39] bg-[#101010] text-[#f5f6f7] hover:bg-emerald-300/10 hover:text-emerald-200">
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-[#2f3430] p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : courses && courses.length > 0 ? (
                <motion.div variants={stagger} initial="hidden" animate="show">
                  {courses.map((course) => (
                    <motion.div
                      key={course.id}
                      variants={fadeUp}
                      className="group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-emerald-300/5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 transition-all group-hover:bg-emerald-300/15">
                        <BookOpen className="h-4 w-4 text-emerald-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{course.title}</p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-[#8b949e]">
                          <span>{course._count?.enrollments ?? 0} students</span>
                          <span>·</span>
                          <span>{course._count?.modules ?? 0} modules</span>
                          <span>·</span>
                          <span>⭐ {course.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <Badge
                        variant={course.status === "PUBLISHED" ? "default" : "secondary"}
                        className="shrink-0 capitalize"
                      >
                        {course.status.toLowerCase()}
                      </Badge>
                      <Link to="/builder" className="shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 px-2 opacity-0 transition-opacity hover:bg-emerald-300/10 hover:text-emerald-200 group-hover:opacity-100">
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
          <Card className="border-[#2f3430] bg-[#101010] text-[#f5f6f7] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b949e]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1.5">
              {[
                { href: "/builder", icon: Plus, label: "Create New Course", desc: "Build and publish content" },
                { href: "/builder", icon: BookOpen, label: "Add Content", desc: "Create topics and materials" },
                { href: "/teacher/quiz-builder", icon: ClipboardList, label: "Build a Quiz", desc: "Create assessments" },
                { href: "/teacher/students", icon: Users, label: "View Students", desc: "Monitor progress" },
                { href: "/teacher/sections", icon: Layers, label: "Manage Sections", desc: "Organize classes" },
                { href: "/admin/announcements", icon: Megaphone, label: "Post Announcement", desc: "Notify students" },
              ].map((action) => (
                <Link key={action.href} to={action.href}>
                  <div className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-emerald-300/5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-300/10 transition-colors group-hover:bg-emerald-300/15">
                      <action.icon className="h-4 w-4 text-emerald-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{action.label}</p>
                      <p className="text-xs text-[#8b949e]">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-[#8b949e] transition-colors group-hover:text-emerald-300" />
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
    <Card className="border-[#2f3430] bg-[#101010] text-[#f5f6f7] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Youtube className="h-4 w-4 text-emerald-300" /> YouTube Publisher
        </CardTitle>
        <CardDescription className="text-xs text-[#8b949e]">Fetch metadata to create YouTube lessons</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube URL…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 border-[#2f3430] bg-[#171717] text-sm text-[#f5f6f7] placeholder:text-[#8b949e]"
          />
          <Button size="sm" onClick={fetchMeta} disabled={!url || fetching} className="h-8 shrink-0 bg-emerald-300 px-3 text-[#101010] hover:bg-emerald-200">
            {fetching ? "…" : "Fetch"}
          </Button>
        </div>
        {metadata && (
          <div className="space-y-1 rounded-xl border border-[#2f3430] bg-[#171717] p-3">
            {metadata.thumbnail && (
              <img src={metadata.thumbnail} alt={metadata.title} className="w-full rounded-lg object-cover aspect-video" />
            )}
            <p className="text-xs font-semibold line-clamp-2 mt-2">{metadata.title}</p>
            <p className="text-[10px] text-[#8b949e]">{metadata.channel}</p>
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
    <Card className="border-[#2f3430] bg-[#101010] text-[#f5f6f7] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-emerald-300" /> Announcements
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 border-[#3d3a39] bg-[#101010] px-2 text-xs text-[#f5f6f7] hover:bg-emerald-300/10 hover:text-emerald-200" onClick={() => setOpen(!open)}>
            {open ? "Cancel" : <><Plus className="h-3 w-3 mr-1" /> New</>}
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
              className="h-8 border-[#2f3430] bg-[#171717] text-sm text-[#f5f6f7] placeholder:text-[#8b949e]"
            />
            <Textarea
              placeholder="Write your announcement…"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={3}
              className="resize-none border-[#2f3430] bg-[#171717] text-sm text-[#f5f6f7] placeholder:text-[#8b949e]"
            />
            <Button
              size="sm"
              className="h-8 w-full bg-emerald-300 text-[#101010] hover:bg-emerald-200"
              disabled={!form.title || !form.content || createMutation.isPending}
              onClick={() => createMutation.mutate({ ...form, isInstitutionWide: false })}
            >
              {createMutation.isPending ? "Posting…" : "Post Announcement"}
            </Button>
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-[#8b949e]">
            Use the form to notify your students about upcoming events, assignments, or news.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
