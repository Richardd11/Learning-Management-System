import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield, Users, BookOpen, TrendingUp, Ban, Megaphone, Layers,
  GraduationCap, Plus, Pencil, Trash2, Upload, Search, Filter,
  Youtube, FileText, BarChart3, UserPlus, School, Activity,
  AlertTriangle, CheckCircle2, type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import type { ApiResponse, AdminStats, AcademicLevel, AcademicLevelType, Section, Role, Announcement, PaginatedResponse } from "@/types";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isBanned: boolean;
  xp: number;
  avatar: string | null;
  studentIdNumber: string | null;
  academicLevelId: string | null;
  sectionId: string | null;
  academicLevel?: AcademicLevel;
  section?: Section;
  createdAt: string;
  _count: { enrollments: number; courses: number };
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };

function adminIconBg(colorClass: string): string {
  const map: Record<string, string> = {
    "text-brand": "bg-brand/10 ring-brand/20",
    "text-success": "bg-success/10 ring-success/20",
    "text-warning": "bg-warning/10 ring-warning/20",
    "text-info": "bg-info/10 ring-info/20",
    "text-streak": "bg-streak/10 ring-streak/20",
    "text-destructive": "bg-destructive/10 ring-destructive/20",
  };
  return map[colorClass] ?? "bg-brand/10 ring-brand/20";
}

const PATH_TO_TAB: Record<string, string> = {
  "/admin/users": "users",
  "/admin/levels": "levels",
  "/admin/courses": "courses",
  "/admin/announcements": "announcements",
  "/admin/youtube": "youtube",
  "/admin/analytics": "analytics",
};

const TAB_TO_PATH: Record<string, string> = {
  overview: "/admin",
  users: "/admin/users",
  levels: "/admin/levels",
  courses: "/admin/courses",
  announcements: "/admin/announcements",
  youtube: "/admin/youtube",
  analytics: "/admin/analytics",
};

export function AdminPanel() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = PATH_TO_TAB[location.pathname] ?? "overview";

  function handleTabChange(tab: string) {
    const path = TAB_TO_PATH[tab] ?? "/admin";
    navigate({ to: path });
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Hero banner ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        className="lms-hero lms-hero-grid relative overflow-hidden rounded-[1.75rem] border border-white/10 p-6 md:p-7 shadow-2xl"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <motion.div
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-info/15 blur-3xl"
          animate={{ x: [0, 12, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.3, ease: "easeOut" }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur"
            >
              <Shield className="h-3.5 w-3.5 text-brand" />
              Institution Control Center
            </motion.div>
            <h1 className="max-w-xl font-display text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Welcome back, {user?.firstName ?? "Admin"}.
            </h1>
            <p className="mt-3 max-w-xl text-sm md:text-base text-white/68 leading-relaxed">
              Monitor institution health, manage students and staff, publish announcements, and keep your learning ecosystem running smoothly.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/15">
                <Activity className="mr-1 h-3 w-3 text-success" /> Live system
              </Badge>
              <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/15">
                <CheckCircle2 className="mr-1 h-3 w-3 text-info" /> Role-based access
              </Badge>
            </div>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-xl shadow-2xl shadow-black/10"
          >
            <AdminQuickStats />
          </motion.div>
        </div>
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="sticky top-[4.75rem] z-20 flex flex-wrap gap-1 w-full h-auto rounded-2xl bg-background/80 border border-border/70 p-1.5 shadow-sm backdrop-blur-xl">
          <TabsTrigger value="overview" className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
            <TrendingUp className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
            <Users className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="levels" className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
            <Layers className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Levels</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
            <BookOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
            <Megaphone className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Announce</span>
          </TabsTrigger>
          <TabsTrigger value="youtube" className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
            <Youtube className="h-3.5 w-3.5" /> <span className="hidden sm:inline">YouTube</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
            <BarChart3 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="levels"><LevelsTab /></TabsContent>
        <TabsContent value="courses"><CoursesTab /></TabsContent>
        <TabsContent value="announcements"><AnnouncementsTab /></TabsContent>
        <TabsContent value="youtube"><YouTubeTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ── Admin quick stats (inline in hero) ───────────────────────────
function AdminQuickStats() {
  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => api.get<ApiResponse<AdminStats>>("/admin/stats"),
    select: (r) => r.data,
  });

  const items = [
    { label: "Users", value: stats?.totalUsers ?? "—", icon: Users },
    { label: "Courses", value: stats?.totalCourses ?? "—", icon: BookOpen },
    { label: "Enrollments", value: stats?.totalEnrollments ?? "—", icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
      {items.map((s) => (
        <motion.div
          key={s.label}
          variants={item}
          whileHover={{ y: -2, scale: 1.01 }}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/12">
            <s.icon className="h-4 w-4 text-white/75" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none tabular-nums">
              {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
            </p>
            <p className="text-white/58 text-[10px] uppercase tracking-wider">{s.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────
function OverviewTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => api.get<ApiResponse<AdminStats>>("/admin/stats"),
    select: (res) => res.data,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-brand" },
    { label: "Total Students", value: stats?.totalStudents ?? 0, icon: GraduationCap, color: "text-success" },
    { label: "Total Teachers", value: stats?.totalTeachers ?? 0, icon: School, color: "text-info" },
    { label: "Total Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "text-warning" },
    { label: "Enrollments", value: stats?.totalEnrollments ?? 0, icon: TrendingUp, color: "text-streak" },
    { label: "Academic Levels", value: stats?.totalAcademicLevels ?? 0, icon: Layers, color: "text-info" },
    { label: "Sections", value: stats?.totalSections ?? 0, icon: GraduationCap, color: "text-brand" },
    { label: "Avg Completion", value: `${stats?.averageCompletionRate ?? 0}%`, icon: BarChart3, color: "text-success" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-muted/35">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.12)_0%,_transparent_55%)] pointer-events-none" />
          <CardContent className="relative p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                  <Activity className="h-3.5 w-3.5" /> Institution snapshot
                </div>
                <h2 className="mt-4 font-display text-2xl md:text-3xl font-bold tracking-tight text-balance">
                  {stats?.totalUsers?.toLocaleString() ?? 0} people across your learning ecosystem
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground leading-relaxed">
                  Students, teachers, sections, enrollments, and completion data are consolidated here so admins can act quickly.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 md:min-w-[260px]">
                {[
                  { label: "Students", value: stats?.totalStudents ?? 0, color: "text-success" },
                  { label: "Teachers", value: stats?.totalTeachers ?? 0, color: "text-info" },
                  { label: "Courses", value: stats?.totalCourses ?? 0, color: "text-warning" },
                ].map((summary) => (
                  <motion.div
                    key={summary.label}
                    whileHover={{ y: -3 }}
                    className="rounded-2xl border bg-background/70 p-3 text-center shadow-sm"
                  >
                    <p className={`font-display text-2xl font-bold tabular-nums ${summary.color}`}>
                      {summary.value.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{summary.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-xl bg-success/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              System Signals
            </CardTitle>
            <CardDescription>Operational indicators for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Completion rate", value: `${stats?.averageCompletionRate ?? 0}%`, icon: BarChart3, color: "text-success" },
              { label: "Active sections", value: stats?.totalSections ?? 0, icon: Layers, color: "text-info" },
              { label: "Total enrollments", value: stats?.totalEnrollments ?? 0, icon: TrendingUp, color: "text-streak" },
            ].map((signal) => (
              <motion.div
                key={signal.label}
                variants={item}
                whileHover={{ x: 3 }}
                className="flex items-center justify-between rounded-2xl border bg-muted/25 px-3 py-3"
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <span className={`rounded-xl p-2 ring-1 ${adminIconBg(signal.color)}`}>
                    <signal.icon className={`h-4 w-4 ${signal.color}`} />
                  </span>
                  {signal.label}
                </span>
                <span className="font-bold tabular-nums">{typeof signal.value === "number" ? signal.value.toLocaleString() : signal.value}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={item} whileHover={{ y: -4 }}>
            <Card className="group overflow-hidden rounded-2xl hover:shadow-lg transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-muted-foreground/75 uppercase tracking-wider truncate">{stat.label}</p>
                    <p className="font-display text-2xl font-bold mt-2 tabular-nums tracking-tight">
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl ring-1 ${adminIconBg(stat.color)}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-brand/50"
                    initial={{ width: 0 }}
                    animate={{ width: "58%" }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" /> Enrollment by Academic Level
              </CardTitle>
              <CardDescription>Distribution across configured levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.enrollmentByLevel?.map((level) => {
                  const percentage = Math.min(100, (level.count / (stats.totalEnrollments || 1)) * 100);
                  return (
                    <div key={level.level} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{level.level}</span>
                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{level.count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-brand to-info"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                }) || <p className="text-muted-foreground text-sm">No enrollment data yet</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" /> Recent Enrollments
              </CardTitle>
              <CardDescription>Latest students joining courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.recentEnrollments?.map((enrollment) => (
                  <motion.div
                    key={enrollment.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 px-3 py-3 text-sm transition-colors hover:bg-accent/40"
                  >
                    <span className="font-semibold truncate">{enrollment.user.firstName} {enrollment.user.lastName}</span>
                    <span className="text-muted-foreground truncate text-right">{enrollment.course.title}</span>
                  </motion.div>
                )) || <p className="text-muted-foreground text-sm">No recent enrollments</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Users Tab ──────────────────────────────────────────────────────
function UsersTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["adminUsers", searchQuery, roleFilter, levelFilter],
    queryFn: () => {
      let url = `/admin/users?search=${searchQuery}`;
      if (roleFilter !== "ALL") url += `&role=${roleFilter}`;
      if (levelFilter !== "ALL") url += `&academicLevelId=${levelFilter}`;
      return api.get<ApiResponse<PaginatedResponse<AdminUser>>>(url);
    },
    select: (res) => res.data,
  });

  const { data: levels } = useQuery({
    queryKey: ["academicLevels"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/levels/levels"),
    select: (res) => res.data,
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) =>
      api.put(`/admin/users/${userId}/ban`, { isBanned }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); toast.success("User status updated"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); toast.success("User deleted"); },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/admin/users/${userId}/reset-password`),
    onSuccess: () => { toast.success("Password reset email sent"); },
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-3xl border bg-card/70 p-3 shadow-sm">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="STUDENT">Students</SelectItem>
              <SelectItem value="TEACHER">Teachers</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              {levels?.map((level) => (
                <SelectItem key={level.id} value={level.id}>{level.gradeLabel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" /> Create User</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <CreateUserForm onClose={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <motion.div variants={container} className="space-y-2">
          {usersData?.data?.map((user) => (
            <motion.div key={user.id} variants={item} whileHover={{ y: -2 }}>
            <Card className="group overflow-hidden rounded-2xl hover:shadow-md transition-all duration-200">
              <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                  <AvatarFallback className="font-semibold">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold tracking-[-0.01em]">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={user.role === "ADMIN" ? "default" : user.role === "TEACHER" ? "secondary" : "outline"}>
                      {user.role}
                    </Badge>
                    {user.academicLevel && (
                      <Badge variant="outline" className="text-xs">{user.academicLevel.gradeLabel}</Badge>
                    )}
                    {user.section && (
                      <Badge variant="outline" className="text-xs">{user.section.name}</Badge>
                    )}
                    {user.studentIdNumber && (
                      <span className="text-xs text-muted-foreground">ID: {user.studentIdNumber}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button variant="outline" size="sm" onClick={() => resetPasswordMutation.mutate(user.id)}>
                    Reset Pwd
                  </Button>
                  <Button
                    variant={user.isBanned ? "default" : "outline"}
                    size="sm"
                    onClick={() => banMutation.mutate({ userId: user.id, isBanned: !user.isBanned })}
                  >
                    <Ban className="h-3 w-3 mr-1" /> {user.isBanned ? "Unban" : "Ban"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => { if (confirm("Delete this user?")) deleteMutation.mutate(user.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
          {usersData?.data?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Create User Form ───────────────────────────────────────────────
function CreateUserForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();

  const { data: levels } = useQuery({
    queryKey: ["academicLevels"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/levels/levels"),
    select: (res) => res.data,
  });

  const [form, setForm] = useState({
    email: "", password: "", firstName: "", lastName: "",
    role: "STUDENT" as Role, academicLevelId: "", sectionId: "",
    studentIdNumber: "", dateOfBirth: "",
  });

  const { data: sectionsData } = useQuery({
    queryKey: ["sections", form.academicLevelId],
    queryFn: async () => {
      if (!form.academicLevelId) throw new Error("No academic level selected");
      return api.get<ApiResponse<Section[]>>(`/levels/levels/${form.academicLevelId}/sections`);
    },
    select: (res) => res.data,
    enabled: !!form.academicLevelId,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/auth/register", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User created successfully");
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create user");
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Student ID Number</Label>
            <Input
              value={form.studentIdNumber}
              onChange={(e) => setForm({ ...form, studentIdNumber: e.target.value })}
              placeholder="e.g., 2024-00001"
            />
          </div>
        </div>
        {form.role === "STUDENT" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Level</Label>
                <Select value={form.academicLevelId} onValueChange={(v) => setForm({ ...form, academicLevelId: v, sectionId: "" })}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {levels?.map((level) => (
                      <SelectItem key={level.id} value={level.id}>{level.gradeLabel} ({level.schoolYear})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={form.sectionId} onValueChange={(v) => setForm({ ...form, sectionId: v })} disabled={!form.academicLevelId}>
                  <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                  <SelectContent>
                    {sectionsData?.map((section: Section) => (
                      <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => createMutation.mutate(form)}
          disabled={!form.email || !form.password || !form.firstName || !form.lastName || createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Create User"}
        </Button>
      </DialogFooter>
    </>
  );
}

// ── Academic Levels & Sections Tab ─────────────────────────────────
function LevelsTab() {
  const queryClient = useQueryClient();

  const { data: levels, isLoading } = useQuery({
    queryKey: ["academicLevels"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/levels/levels"),
    select: (res) => res.data,
  });

  const [showLevelDialog, setShowLevelDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [levelForm, setLevelForm] = useState<{ type: AcademicLevelType; gradeLabel: string; schoolYear: string; orderIndex: number; isActive: boolean }>({ type: "HIGH_SCHOOL", gradeLabel: "", schoolYear: new Date().getFullYear().toString(), orderIndex: 0, isActive: true });
  const [sectionForm, setSectionForm] = useState({ name: "", academicLevelId: "", schoolYear: "", semester: "", capacity: 30 });

  const createLevelMutation = useMutation({
    mutationFn: (data: typeof levelForm) => api.post("/levels/levels", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["academicLevels"] }); toast.success("Academic level created"); setShowLevelDialog(false); },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteLevelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/levels/levels/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["academicLevels"] }); toast.success("Academic level deleted"); },
  });

  const createSectionMutation = useMutation({
    mutationFn: (data: typeof sectionForm) => api.post("/levels/sections", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["academicLevels"] }); toast.success("Section created"); setShowSectionDialog(false); },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/levels/sections/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["academicLevels"] }); toast.success("Section deleted"); },
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header bar */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-3xl border bg-card/70 p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Academic Levels &amp; Sections</h2>
          <p className="text-muted-foreground text-sm">Manage grade levels and class sections for your institution</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Level</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Academic Level</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={levelForm.type} onValueChange={(v) => setLevelForm({ ...levelForm, type: v as "HIGH_SCHOOL" | "COLLEGE" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                      <SelectItem value="COLLEGE">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grade Label</Label>
                  <Input placeholder="e.g., Grade 9, 1st Year" value={levelForm.gradeLabel} onChange={(e) => setLevelForm({ ...levelForm, gradeLabel: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>School Year</Label>
                  <Input placeholder="e.g., 2024-2025" value={levelForm.schoolYear} onChange={(e) => setLevelForm({ ...levelForm, schoolYear: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Order Index</Label>
                  <Input type="number" value={levelForm.orderIndex} onChange={(e) => setLevelForm({ ...levelForm, orderIndex: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createLevelMutation.mutate(levelForm)} disabled={!levelForm.gradeLabel}>
                  Create Level
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Section</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Section</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Academic Level</Label>
                  <Select value={sectionForm.academicLevelId} onValueChange={(v) => setSectionForm({ ...sectionForm, academicLevelId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      {levels?.map((level) => (
                        <SelectItem key={level.id} value={level.id}>{level.gradeLabel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section Name</Label>
                  <Input placeholder="e.g., Section A, BSCS Block 1" value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>School Year</Label>
                  <Input placeholder="e.g., 2024-2025" value={sectionForm.schoolYear} onChange={(e) => setSectionForm({ ...sectionForm, schoolYear: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Semester (College only)</Label>
                  <Select value={sectionForm.semester} onValueChange={(v) => setSectionForm({ ...sectionForm, semester: v })}>
                    <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIRST">First Semester</SelectItem>
                      <SelectItem value="SECOND">Second Semester</SelectItem>
                      <SelectItem value="SUMMER">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" value={sectionForm.capacity} onChange={(e) => setSectionForm({ ...sectionForm, capacity: parseInt(e.target.value) || 30 })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createSectionMutation.mutate(sectionForm)} disabled={!sectionForm.name || !sectionForm.academicLevelId}>
                  Create Section
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div>
      ) : (
        <motion.div variants={container} className="space-y-4">
          {levels?.sort((a, b) => a.orderIndex - b.orderIndex).map((level) => (
            <motion.div key={level.id} variants={item}>
              <Card className="overflow-hidden rounded-3xl hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3 bg-muted/25">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{level.gradeLabel}</CardTitle>
                        <p className="text-xs text-muted-foreground">SY: {level.schoolYear}</p>
                      </div>
                      <Badge variant={level.type === "HIGH_SCHOOL" ? "default" : "secondary"} className="text-xs">
                        {level.type === "HIGH_SCHOOL" ? "High School" : "College"}
                      </Badge>
                      <Badge variant={level.isActive ? "outline" : "destructive"} className="text-xs">
                        {level.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => { if (confirm("Delete this level?")) deleteLevelMutation.mutate(level.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {level.sections && level.sections.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {level.sections.map((section) => (
                        <motion.div
                          key={section.id}
                          whileHover={{ y: -2 }}
                          className="group flex items-center justify-between rounded-2xl border bg-background/80 p-3 hover:shadow-sm transition-all"
                        >
                          <div>
                            <p className="font-medium text-sm">{section.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary/50"
                                  style={{ width: section.capacity ? `${Math.min(100, (section.currentEnrollment / section.capacity) * 100)}%` : "0%" }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {section.currentEnrollment}/{section.capacity ?? "∞"}
                                {section.semester && ` • ${section.semester}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                            onClick={() => { if (confirm("Delete this section?")) deleteSectionMutation.mutate(section.id); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl bg-muted/40 px-4 py-3">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No sections assigned yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {levels?.length === 0 && (
            <Card className="rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60">
                  <Layers className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">No academic levels yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Add your first level using the button above.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Courses Tab ────────────────────────────────────────────────────
function CoursesTab() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    subjectCode: "",
    description: "",
    shortDesc: "",
    instructorId: "",
    academicLevelId: "",
    price: 0,
    difficulty: "beginner",
    status: "DRAFT",
  });

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["adminCourses", statusFilter, levelFilter],
    queryFn: () => {
      let url = "/admin/courses?";
      if (statusFilter !== "ALL") url += `status=${statusFilter}`;
      if (levelFilter !== "ALL") url += `&academicLevelId=${levelFilter}`;
      return api.get<ApiResponse<any[]>>(url);
    },
    select: (res) => res.data,
  });

  const { data: levels } = useQuery({
    queryKey: ["academicLevels"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/levels/levels"),
    select: (res) => res.data,
  });

  const { data: teachersData } = useQuery({
    queryKey: ["adminUsers", "TEACHER"],
    queryFn: () => api.get<ApiResponse<PaginatedResponse<AdminUser>>>("/admin/users?role=TEACHER&limit=100"),
    select: (res) => res.data?.data ?? [],
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: typeof courseForm) =>
      api.post("/admin/courses", {
        ...data,
        academicLevelId: data.academicLevelId || null,
        subjectCode: data.subjectCode || undefined,
        shortDesc: data.shortDesc || undefined,
        price: Number(data.price) || 0,
        tags: [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
      toast.success("Course offering created");
      setShowCreateCourse(false);
      setCourseForm({
        title: "",
        subjectCode: "",
        description: "",
        shortDesc: "",
        instructorId: "",
        academicLevelId: "",
        price: 0,
        difficulty: "beginner",
        status: "DRAFT",
      });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create course offering"),
  });

  const statusMeta: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; dot: string }> = {
    PUBLISHED: { label: "Published", variant: "default", dot: "bg-emerald-500" },
    DRAFT:     { label: "Draft",     variant: "secondary", dot: "bg-amber-500" },
    ARCHIVED:  { label: "Archived",  variant: "destructive", dot: "bg-slate-400" },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Filter bar */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-3xl border bg-card/70 p-3 shadow-sm">
        <div>
          <h2 className="text-base font-semibold px-1">Course Management</h2>
          <p className="text-xs text-muted-foreground px-1">View and filter all courses across your institution</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              {levels?.map((level) => (
                <SelectItem key={level.id} value={level.id}>{level.gradeLabel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> New Offering</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Course Offering</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Course Title</Label>
                  <Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g., General Mathematics" />
                </div>
                <div className="space-y-2">
                  <Label>Subject Code</Label>
                  <Input value={courseForm.subjectCode} onChange={(e) => setCourseForm({ ...courseForm, subjectCode: e.target.value })} placeholder="e.g., MATH101" />
                </div>
                <div className="space-y-2">
                  <Label>Assigned Teacher</Label>
                  <Select value={courseForm.instructorId} onValueChange={(v) => setCourseForm({ ...courseForm, instructorId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>
                      {teachersData?.map((teacher: AdminUser) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Academic Level</Label>
                  <Select value={courseForm.academicLevelId} onValueChange={(v) => setCourseForm({ ...courseForm, academicLevelId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      {levels?.map((level) => (
                        <SelectItem key={level.id} value={level.id}>{level.gradeLabel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={courseForm.status} onValueChange={(v) => setCourseForm({ ...courseForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={courseForm.difficulty} onValueChange={(v) => setCourseForm({ ...courseForm, difficulty: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Short Description</Label>
                  <Input value={courseForm.shortDesc} onChange={(e) => setCourseForm({ ...courseForm, shortDesc: e.target.value })} placeholder="One-line summary for students" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Describe the offering..." rows={4} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createCourseMutation.mutate(courseForm)}
                  disabled={!courseForm.title || !courseForm.description || !courseForm.instructorId || createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Offering"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : (
        <motion.div variants={container} className="space-y-2">
          {coursesData?.map((course: any) => {
            const sm = statusMeta[course.status] ?? statusMeta.DRAFT;
            return (
              <motion.div key={course.id} variants={item} whileHover={{ y: -2 }}>
                <Card className="group overflow-hidden rounded-2xl hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 flex items-center gap-4">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="h-16 w-24 flex-shrink-0 object-cover rounded-xl" />
                    ) : (
                      <div className="h-16 w-24 flex-shrink-0 rounded-xl bg-primary/8 ring-1 ring-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary/60" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold tracking-[-0.01em] truncate">{course.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {course.subjectCode && (
                          <Badge variant="outline" className="text-[10px] font-mono">{course.subjectCode}</Badge>
                        )}
                        <Badge variant={sm.variant} className="gap-1 text-xs">
                          <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                          {sm.label}
                        </Badge>
                        {course.academicLevel && (
                          <Badge variant="outline" className="text-xs">{course.academicLevel.gradeLabel}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> {course._count?.enrollments ?? 0} enrolled
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" /> {course._count?.modules ?? 0} modules
                        </span>
                        {course.instructor && (
                          <span className="text-xs text-muted-foreground">
                            {course.instructor.firstName} {course.instructor.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {coursesData?.length === 0 && (
            <Card className="rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">No courses found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Announcements Tab ──────────────────────────────────────────────
function AnnouncementsTab() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", courseId: "", isInstitutionWide: true, priority: "normal" as const,
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => api.get<ApiResponse<Announcement[]>>("/announcements"),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/announcements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement created");
      setShowCreate(false);
      setForm({ title: "", content: "", courseId: "", isInstitutionWide: true, priority: "normal" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["announcements"] }); toast.success("Announcement deleted"); },
  });

  const priorityMeta: Record<string, { label: string; band: string; badge: string }> = {
    low:    { label: "Low",    band: "bg-slate-400",   badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
    normal: { label: "Normal", band: "bg-blue-500",    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    high:   { label: "High",   band: "bg-orange-500",  badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
    urgent: { label: "Urgent", band: "bg-destructive", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-3xl border bg-card/70 p-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold">Announcements</h2>
          <p className="text-xs text-muted-foreground">Publish institution-wide or course-specific announcements</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-2" /> New Announcement
        </Button>
      </motion.div>

      {/* Compose form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="overflow-hidden rounded-3xl border-primary/20">
            <div className="h-1 w-full bg-gradient-to-r from-brand via-brand to-info" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4 text-primary" />
                Compose Announcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title..." />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your announcement..." rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer rounded-xl border bg-muted/30 px-3 py-2.5 w-full hover:bg-muted/50 transition-colors">
                    <input type="checkbox" checked={form.isInstitutionWide} onChange={(e) => setForm({ ...form, isInstitutionWide: e.target.checked })} className="rounded" />
                    <span className="text-sm font-medium">Institution-wide</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={() => createMutation.mutate(form)} disabled={!form.title || !form.content || createMutation.isPending}>
                  {createMutation.isPending ? "Publishing..." : "Publish Announcement"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : (
        <motion.div variants={container} className="space-y-3">
          {announcements?.map((ann) => {
            const pm = priorityMeta[ann.priority] ?? priorityMeta.normal;
            return (
              <motion.div key={ann.id} variants={item} whileHover={{ x: 3 }}>
                <Card className="group overflow-hidden rounded-2xl hover:shadow-md transition-all duration-200">
                  <div className={`h-full w-1 absolute left-0 top-0 bottom-0 ${pm.band} rounded-l-2xl`} />
                  <CardContent className="pl-5 pr-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="font-semibold tracking-[-0.01em]">{ann.title}</h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pm.badge}`}>
                            {pm.label}
                          </span>
                          {ann.isInstitutionWide && (
                            <Badge variant="outline" className="text-[10px]">Institution-wide</Badge>
                          )}
                          {ann.course && (
                            <Badge variant="secondary" className="text-[10px]">{ann.course.title}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ann.content}</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-2">
                          {new Date(ann.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                        onClick={() => { if (confirm("Delete this announcement?")) deleteMutation.mutate(ann.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {(!announcements || announcements.length === 0) && (
            <Card className="rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60">
                  <Megaphone className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">No announcements yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Create your first announcement above.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ── YouTube Tab ────────────────────────────────────────────────────
function YouTubeTab() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState<any>(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);

  const fetchMetadata = async () => {
    if (!url) return;
    setFetchingMeta(true);
    try {
      const res = await api.post<ApiResponse<any>>("/youtube/fetch-metadata", { url });
      setMetadata(res.data);
    } catch (err) {
      toast.error("Failed to fetch YouTube metadata");
    } finally {
      setFetchingMeta(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Hero header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-3xl border bg-card/70 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
            <Youtube className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-semibold">YouTube Tutorial Integration</h2>
            <p className="text-xs text-muted-foreground">Fetch video metadata and attach tutorials to lessons</p>
          </div>
        </div>
      </motion.div>

      {/* Fetch metadata */}
      <motion.div variants={item}>
        <Card className="overflow-hidden rounded-3xl">
          <CardHeader className="border-b bg-muted/25">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4 text-primary" />
              Fetch Video Metadata
            </CardTitle>
            <CardDescription>Enter a YouTube URL to automatically fetch video information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="flex gap-2">
              <Input
                placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={fetchMetadata} disabled={!url || fetchingMeta} className="shrink-0">
                {fetchingMeta ? "Fetching..." : "Fetch"}
              </Button>
            </div>

            {metadata && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border bg-muted/20"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  {metadata.thumbnail && (
                    <img src={metadata.thumbnail} alt="Thumbnail" className="w-full sm:w-48 h-28 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-[-0.01em] line-clamp-2">{metadata.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Channel: {metadata.channel}</p>
                    {metadata.duration && (
                      <p className="text-sm text-muted-foreground">Duration: {metadata.duration} min</p>
                    )}
                    <Badge variant="outline" className="mt-2 text-xs gap-1">
                      <CheckCircle2 className="h-3 w-3 text-success" /> Metadata fetched
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk import */}
      <motion.div variants={item}>
        <Card className="overflow-hidden rounded-3xl">
          <CardHeader className="border-b bg-muted/25">
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4 text-primary" />
              Bulk Import
            </CardTitle>
            <CardDescription>Import multiple YouTube videos as lessons at once</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <Textarea
              placeholder="Paste YouTube URLs, one per line&#10;https://youtube.com/watch?v=...&#10;https://youtube.com/watch?v=..."
              rows={6}
              className="font-mono text-sm"
            />
            <Button>
              <Upload className="h-4 w-4 mr-2" /> Import Videos
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Analytics Tab ──────────────────────────────────────────────────
function AnalyticsTab() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => api.get<ApiResponse<AdminStats>>("/admin/stats"),
    select: (res) => res.data,
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: () => api.get<ApiResponse<any[]>>("/admin/courses"),
    select: (res) => res.data,
  });

  const { data: levelsData, isLoading: levelsLoading } = useQuery({
    queryKey: ["academicLevels"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/levels/levels"),
    select: (res) => res.data,
  });

  const isLoading = statsLoading || coursesLoading || levelsLoading;

  // Prepare chart data
  const enrollmentByLevelData = stats?.enrollmentByLevel?.map((item) => ({
    name: item.level,
    count: item.count,
  })) ?? [];

  const courseStatusData = coursesData ? [
    { name: "Published", value: coursesData.filter((c: any) => c.status === "PUBLISHED").length, color: "hsl(var(--primary))" },
    { name: "Draft", value: coursesData.filter((c: any) => c.status === "DRAFT").length, color: "hsl(var(--muted-foreground))" },
    { name: "Archived", value: coursesData.filter((c: any) => c.status === "ARCHIVED").length, color: "hsl(var(--destructive))" },
  ].filter(d => d.value > 0) : [];

  const coursesByLevelData = levelsData?.map((level) => ({
    name: level.gradeLabel,
    courses: coursesData?.filter((c: any) => c.academicLevelId === level.id).length ?? 0,
    students: level.sections?.reduce((sum, s) => sum + s.currentEnrollment, 0) ?? 0,
  })) ?? [];

  const roleDistributionData = stats ? [
    { name: "Students", value: stats.totalStudents, color: "hsl(var(--lms-info))" },
    { name: "Teachers", value: stats.totalTeachers, color: "hsl(var(--lms-brand))" },
    { name: "Admins", value: stats.totalUsers - stats.totalStudents - stats.totalTeachers, color: "hsl(var(--lms-streak))" },
  ].filter(d => d.value > 0) : [];

  // Derived 6-month registration trend ending at current user count (mock series)
  const totalUsersBase = stats?.totalUsers ?? 0;
  const registrationsTrend = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((name, i, arr) => ({
    name,
    users: Math.max(0, Math.round(totalUsersBase * (0.45 + (i / (arr.length - 1)) * 0.55))),
  }));

  const topCoursesData = coursesData
    ?.sort((a: any, b: any) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0))
    .slice(0, 5)
    .map((c: any) => ({
      name: c.title.length > 20 ? c.title.slice(0, 20) + "..." : c.title,
      enrollments: c._count?.enrollments ?? 0,
      modules: c._count?.modules ?? 0,
    })) ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-80 rounded-3xl" />)}
      </div>
    );
  }

  const analyticsStats = [
    { label: "Total Users",        value: stats?.totalUsers ?? 0,            icon: Users,    color: "text-brand",   iconBg: "bg-brand/10 ring-brand/20" },
    { label: "Active Students (7d)",value: stats?.activeStudents ?? 0,       icon: Activity, color: "text-info",    iconBg: "bg-info/10 ring-info/20" },
    { label: "Avg Completion",      value: `${stats?.averageCompletionRate ?? 0}%`, icon: BarChart3, color: "text-success", iconBg: "bg-success/10 ring-success/20" },
    { label: "Total Enrollments",   value: stats?.totalEnrollments ?? 0,     icon: TrendingUp, color: "text-streak",  iconBg: "bg-streak/10 ring-streak/20" },
  ];

  const chartEmptyState = (icon: LucideIcon, label: string) => {
    const Icon = icon;
    return (
      <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60">
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-sm">{label}</p>
      </div>
    );
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="rounded-3xl border bg-card/70 p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold tracking-tight">Institution Analytics</h2>
        <p className="text-muted-foreground text-sm">Detailed performance and engagement metrics</p>
      </motion.div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsStats.map((s) => (
          <motion.div key={s.label} variants={item} whileHover={{ y: -4 }}>
            <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-3 rounded-2xl ring-1 ${s.iconBg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
                <p className={`font-display text-2xl font-bold mt-3 tabular-nums tracking-tight ${s.color}`}>
                  {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* User registrations over time */}
      <motion.div variants={item}>
        <Card className="overflow-hidden rounded-3xl">
          <CardHeader className="border-b bg-muted/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-xl bg-brand/10 p-1.5"><UserPlus className="h-4 w-4 text-brand" /></div>
              User Registrations Over Time
            </CardTitle>
            <CardDescription>Cumulative growth across the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={registrationsTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--lms-brand))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--lms-brand))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))", boxShadow: "var(--shadow-lg)" }} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--lms-brand))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--lms-brand))" }} activeDot={{ r: 5 }} name="Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment by Academic Level */}
        <motion.div variants={item}>
          <Card className="overflow-hidden rounded-3xl">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-xl bg-primary/10 p-1.5"><Layers className="h-4 w-4 text-primary" /></div>
                Enrollment by Academic Level
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {enrollmentByLevelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={enrollmentByLevelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "var(--shadow-lg)" }} />
                    <Bar dataKey="count" fill="hsl(var(--lms-brand))" radius={[6, 6, 0, 0]} name="Enrollments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : chartEmptyState(Layers, "No enrollment data yet")}
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Status Distribution */}
        <motion.div variants={item}>
          <Card className="overflow-hidden rounded-3xl">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-xl bg-warning/10 p-1.5"><BookOpen className="h-4 w-4 text-warning" /></div>
                Course Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {courseStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={courseStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {courseStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : chartEmptyState(BookOpen, "No courses yet")}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Courses by Enrollment */}
        <motion.div variants={item}>
          <Card className="overflow-hidden rounded-3xl">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-xl bg-info/10 p-1.5"><TrendingUp className="h-4 w-4 text-info" /></div>
                Top Courses by Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {topCoursesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topCoursesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="enrollments" fill="hsl(var(--lms-info))" radius={[0, 6, 6, 0]} name="Enrollments" />
                    <Bar dataKey="modules" fill="hsl(var(--lms-brand))" radius={[0, 6, 6, 0]} name="Modules" />
                  </BarChart>
                </ResponsiveContainer>
              ) : chartEmptyState(TrendingUp, "No course data yet")}
            </CardContent>
          </Card>
        </motion.div>

        {/* Role Distribution */}
        <motion.div variants={item}>
          <Card className="overflow-hidden rounded-3xl">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-xl bg-brand/10 p-1.5"><Users className="h-4 w-4 text-brand" /></div>
                User Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {roleDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={roleDistributionData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {roleDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : chartEmptyState(Users, "No user data yet")}
            </CardContent>
          </Card>
        </motion.div>

        {/* Courses by Academic Level */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="overflow-hidden rounded-3xl">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-xl bg-success/10 p-1.5"><GraduationCap className="h-4 w-4 text-success" /></div>
                Courses &amp; Students by Academic Level
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {coursesByLevelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={coursesByLevelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="courses" fill="hsl(var(--lms-brand))" radius={[6, 6, 0, 0]} name="Courses" />
                    <Bar dataKey="students" fill="hsl(var(--lms-info))" radius={[6, 6, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              ) : chartEmptyState(GraduationCap, "No academic level data yet")}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}