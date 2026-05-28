import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3, Users, BookOpen, Plus, Star, TrendingUp,
  Layers, GraduationCap, Megaphone, Youtube, ClipboardList,
  ArrowRight, Eye, PlusCircle, ChevronRight, CheckCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useInstructorCourses } from "@/hooks/use-courses";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { ApiResponse, Announcement, AcademicLevel } from "@/types";
import { StatsCard, SectionHeading, EmptyPlaceholder, stagger, fadeUp } from "@/components/dashboard/widgets";
import { useAuthStore } from "@/stores/auth-store";

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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-700 to-purple-800 p-6 text-white shadow-lg"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/75 text-sm font-medium mb-1">Teacher Portal</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome, {user?.firstName}!
            </h1>
            <p className="text-white/75 text-sm mt-1.5 font-medium">
              Manage your courses, students, and content below.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/builder">
              <Button size="sm" className="bg-white text-purple-700 hover:bg-white/90 font-semibold">
                <Plus className="h-4 w-4 mr-1" /> New Course
              </Button>
            </Link>
            <Link to="/teacher/quiz-builder">
              <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <ClipboardList className="h-4 w-4 mr-1" /> Quiz Builder
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/8 pointer-events-none" />
      </motion.div>

      {/* ── KPI cards ─────────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard label="Total Students" value={isLoading ? "—" : totalStudents} icon={Users} color="text-blue-500" />
        <StatsCard label="Published Courses" value={isLoading ? "—" : published} icon={BookOpen} color="text-green-500" />
        <StatsCard label="Average Rating" value={isLoading ? "—" : avgRating} icon={Star} color="text-yellow-500" />
        <StatsCard label="Total Reviews" value={isLoading ? "—" : totalReviews} icon={TrendingUp} color="text-purple-500" />
      </motion.div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — chart + course list */}
        <div className="lg:col-span-2 space-y-6">

          {/* Enrollment chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Enrollment Overview
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
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar dataKey="students" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12 text-sm">No enrollment data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Course list */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> My Courses
                </CardTitle>
                <Link to="/builder">
                  <Button size="sm" variant="outline">
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y">
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
                      className="flex items-center gap-4 p-4 hover:bg-accent/60 transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:from-primary/30 transition-all">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{course.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
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
                        <Button size="sm" variant="ghost" className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  action={<Link to="/builder"><Button size="sm">Create Course</Button></Link>}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1.5">
              {[
                { href: "/builder", icon: Plus, label: "Create New Course", desc: "Build and publish content" },
                { href: "/teacher/quiz-builder", icon: ClipboardList, label: "Build a Quiz", desc: "Create assessments" },
                { href: "/teacher/students", icon: Users, label: "View Students", desc: "Monitor progress" },
                { href: "/teacher/sections", icon: Layers, label: "Manage Sections", desc: "Organize classes" },
                { href: "/admin/announcements", icon: Megaphone, label: "Post Announcement", desc: "Notify students" },
              ].map((action) => (
                <Link key={action.href} to={action.href}>
                  <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-accent transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
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
  const [metadata, setMetadata] = useState<any>(null);
  const [fetching, setFetching] = useState(false);

  const fetchMeta = async () => {
    if (!url) return;
    setFetching(true);
    try {
      const res = await api.post<ApiResponse<any>>("/youtube/fetch-metadata", { url });
      setMetadata(res.data);
    } catch {
      setMetadata(null);
      toast.error("Could not fetch video metadata");
    } finally {
      setFetching(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-500" /> YouTube Publisher
        </CardTitle>
        <CardDescription className="text-xs">Fetch metadata to create YouTube lessons</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube URL…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-sm h-8"
          />
          <Button size="sm" onClick={fetchMeta} disabled={!url || fetching} className="h-8 px-3 shrink-0">
            {fetching ? "…" : "Fetch"}
          </Button>
        </div>
        {metadata && (
          <div className="rounded-xl border p-3 space-y-1 bg-muted/40">
            {metadata.thumbnail && (
              <img src={metadata.thumbnail} alt={metadata.title} className="w-full rounded-lg object-cover aspect-video" />
            )}
            <p className="text-xs font-semibold line-clamp-2 mt-2">{metadata.title}</p>
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

  const { data: levels } = useQuery({
    queryKey: ["academicLevels"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/academic-levels"),
    select: (r) => r.data ?? [],
  });

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
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" /> Announcements
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setOpen(!open)}>
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
              className="text-sm h-8"
            />
            <Textarea
              placeholder="Write your announcement…"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={3}
              className="text-sm resize-none"
            />
            <Button
              size="sm"
              className="w-full h-8"
              disabled={!form.title || !form.content || createMutation.isPending}
              onClick={() => createMutation.mutate({ ...form, isInstitutionWide: false })}
            >
              {createMutation.isPending ? "Posting…" : "Post Announcement"}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Use the form to notify your students about upcoming events, assignments, or news.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
