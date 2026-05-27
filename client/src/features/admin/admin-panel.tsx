import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield, Users, BookOpen, TrendingUp, Ban, Megaphone, Layers,
  GraduationCap, Plus, Pencil, Trash2, Upload, Search, Filter,
  Youtube, FileText, BarChart3, UserPlus, School,
} from "lucide-react";
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
import type { ApiResponse, AdminStats, AcademicLevel, AcademicLevelType, Section, Role, Announcement, PaginatedResponse, Course } from "@/types";

type AnnouncementPriority = "low" | "normal" | "high" | "urgent";

interface YouTubeMetadata {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  embedUrl: string;
}

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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function AdminPanel() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" /> Admin Panel
        </h1>
        <p className="text-muted-foreground">Manage your institution, users, courses, and settings</p>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto">
          <TabsTrigger value="overview" className="gap-1"><TrendingUp className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" /> Users</TabsTrigger>
          <TabsTrigger value="levels" className="gap-1"><Layers className="h-4 w-4" /> Levels</TabsTrigger>
          <TabsTrigger value="courses" className="gap-1"><BookOpen className="h-4 w-4" /> Courses</TabsTrigger>
          <TabsTrigger value="announcements" className="gap-1"><Megaphone className="h-4 w-4" /> Announce</TabsTrigger>
          <TabsTrigger value="youtube" className="gap-1"><Youtube className="h-4 w-4" /> YouTube</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
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

// ── Overview Tab ──────────────────────────────────────────────────
function OverviewTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => api.get<ApiResponse<AdminStats>>("/admin/stats"),
    select: (res) => res.data,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Total Students", value: stats?.totalStudents ?? 0, icon: GraduationCap, color: "text-green-500" },
    { label: "Total Teachers", value: stats?.totalTeachers ?? 0, icon: School, color: "text-purple-500" },
    { label: "Total Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "text-orange-500" },
    { label: "Total Enrollments", value: stats?.totalEnrollments ?? 0, icon: TrendingUp, color: "text-pink-500" },
    { label: "Academic Levels", value: stats?.totalAcademicLevels ?? 0, icon: Layers, color: "text-cyan-500" },
    { label: "Sections", value: stats?.totalSections ?? 0, icon: GraduationCap, color: "text-indigo-500" },
    { label: "Avg Completion", value: `${stats?.averageCompletionRate ?? 0}%`, icon: BarChart3, color: "text-emerald-500" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}/60`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Enrollment by Academic Level</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.enrollmentByLevel?.map((item) => (
                <div key={item.level} className="flex items-center justify-between text-sm">
                  <span>{item.level}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min(100, (item.count / (stats.totalEnrollments || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                </div>
              )) || <p className="text-muted-foreground text-sm">No enrollment data yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Enrollments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentEnrollments?.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                  <span className="font-medium">{e.user.firstName} {e.user.lastName}</span>
                  <span className="text-muted-foreground">{e.course.title}</span>
                </div>
              )) || <p className="text-muted-foreground text-sm">No recent enrollments</p>}
            </div>
          </CardContent>
        </Card>
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-2">
          {usersData?.data?.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex gap-2 mt-1">
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
                <div className="flex gap-2">
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
                    onClick={() => { if (confirm("Delete this user?")) deleteMutation.mutate(user.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {usersData?.data?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Academic Levels & Sections</h2>
          <p className="text-muted-foreground text-sm">Manage grade levels and class sections for your institution</p>
        </div>
        <div className="flex gap-2">
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
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : (
        <div className="space-y-4">
          {levels?.sort((a, b) => a.orderIndex - b.orderIndex).map((level) => (
            <Card key={level.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{level.gradeLabel}</CardTitle>
                    <Badge variant={level.type === "HIGH_SCHOOL" ? "default" : "secondary"}>{level.type === "HIGH_SCHOOL" ? "High School" : "College"}</Badge>
                    <Badge variant={level.isActive ? "outline" : "destructive"}>{level.isActive ? "Active" : "Inactive"}</Badge>
                    <span className="text-sm text-muted-foreground">SY: {level.schoolYear}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this level?")) deleteLevelMutation.mutate(level.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {level.sections && level.sections.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {level.sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <p className="font-medium text-sm">{section.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {section.currentEnrollment}/{section.capacity ?? "∞"} students
                            {section.semester && ` • ${section.semester} Sem`}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this section?")) deleteSectionMutation.mutate(section.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No sections assigned yet</p>
                )}
              </CardContent>
            </Card>
          ))}
          {levels?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No academic levels created yet. Add your first level above.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Courses Tab ────────────────────────────────────────────────────
function CoursesTab() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["adminCourses", statusFilter, levelFilter],
    queryFn: () => {
      let url = "/admin/courses?";
      if (statusFilter !== "ALL") url += `status=${statusFilter}`;
      if (levelFilter !== "ALL") url += `&academicLevelId=${levelFilter}`;
      return api.get<ApiResponse<Course[]>>(url);
    },
    select: (res) => res.data,
  });

  const { data: levels } = useQuery({
    queryKey: ["academicLevels"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/levels/levels"),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold">Course Management</h2>
        <div className="flex gap-2">
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
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="space-y-2">
          {coursesData?.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-4 flex items-center gap-4">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="h-16 w-24 object-cover rounded" />
                ) : (
                  <div className="h-16 w-24 bg-muted rounded flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{course.title}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {course.subjectCode && <Badge variant="outline">{course.subjectCode}</Badge>}
                    <Badge variant={course.status === "PUBLISHED" ? "default" : course.status === "DRAFT" ? "secondary" : "destructive"}>
                      {course.status}
                    </Badge>
                    {course.academicLevel && <Badge variant="outline">{course.academicLevel.gradeLabel}</Badge>}
                    <span className="text-xs text-muted-foreground">{course._count?.enrollments ?? 0} enrolled</span>
                    <span className="text-xs text-muted-foreground">{course._count?.modules ?? 0} modules</span>
                  </div>
                  {course.instructor && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Instructor: {course.instructor.firstName} {course.instructor.lastName}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {coursesData?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No courses found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Announcements Tab ──────────────────────────────────────────────
function AnnouncementsTab() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", courseId: "", isInstitutionWide: true, priority: "normal" as AnnouncementPriority,
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => api.get<ApiResponse<Announcement[]>>("/announcements"),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/announcements", {
      title: data.title,
      body: data.content,
      courseId: data.courseId || undefined,
      isInstitutionWide: data.isInstitutionWide,
    }),
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

  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-700",
    normal: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Announcements</h2>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> New Announcement</Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="p-6 space-y-4">
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
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as AnnouncementPriority })}>
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isInstitutionWide} onChange={(e) => setForm({ ...form, isInstitutionWide: e.target.checked })} className="rounded" />
                  <span className="text-sm">Institution-wide</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.title || !form.content}>
                Publish Announcement
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="space-y-3">
          {announcements?.map((ann) => (
            <Card key={ann.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{ann.title}</h3>
                      {ann.priority && <Badge className={priorityColors[ann.priority] || ""}>{ann.priority}</Badge>}
                      {ann.isInstitutionWide && <Badge variant="outline">Institution-wide</Badge>}
                      {ann.course && <Badge variant="secondary">{ann.course.title}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ann.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(ann.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── YouTube Tab ────────────────────────────────────────────────────
function YouTubeTab() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);

  const fetchMetadata = async () => {
    if (!url) return;
    setFetchingMeta(true);
    try {
      const res = await api.post<ApiResponse<YouTubeMetadata>>("/youtube/fetch-metadata", { url });
      setMetadata(res.data ?? null);
    } catch (err) {
      toast.error("Failed to fetch YouTube metadata");
    } finally {
      setFetchingMeta(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">YouTube Tutorial Integration</h2>
        <p className="text-muted-foreground text-sm">Fetch YouTube video metadata and attach tutorials to lessons</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fetch Video Metadata</CardTitle>
          <CardDescription>Enter a YouTube URL to automatically fetch video information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={fetchMetadata} disabled={!url || fetchingMeta}>
              {fetchingMeta ? "Fetching..." : "Fetch Metadata"}
            </Button>
          </div>

          {metadata && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex gap-4">
                {metadata.thumbnail && (
                  <img src={metadata.thumbnail} alt="Thumbnail" className="w-48 h-28 object-cover rounded" />
                )}
                <div>
                  <h3 className="font-semibold">{metadata.title}</h3>
                  <p className="text-sm text-muted-foreground">Channel: {metadata.channel}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bulk Import</CardTitle>
          <CardDescription>Import multiple YouTube videos as lessons at once</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste YouTube URLs (one per line)"
            rows={6}
          />
          <Button className="mt-4"><Upload className="h-4 w-4 mr-2" /> Import Videos</Button>
        </CardContent>
      </Card>
    </div>
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
    queryFn: () => api.get<ApiResponse<Course[]>>("/admin/courses"),
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
    { name: "Published", value: coursesData.filter((c) => c.status === "PUBLISHED").length, color: "hsl(var(--primary))" },
    { name: "Draft", value: coursesData.filter((c) => c.status === "DRAFT").length, color: "hsl(var(--muted-foreground))" },
    { name: "Archived", value: coursesData.filter((c) => c.status === "ARCHIVED").length, color: "hsl(var(--destructive))" },
  ].filter(d => d.value > 0) : [];

  const coursesByLevelData = levelsData?.map((level) => ({
    name: level.gradeLabel,
    courses: coursesData?.filter((c) => c.academicLevelId === level.id).length ?? 0,
    students: level.sections?.reduce((sum, s) => sum + (s.currentEnrollment ?? 0), 0) ?? 0,
  })) ?? [];

  const roleDistributionData = stats ? [
    { name: "Students", value: stats.totalStudents, color: "#3b82f6" },
    { name: "Teachers", value: stats.totalTeachers, color: "#8b5cf6" },
    { name: "Admins", value: stats.totalUsers - stats.totalStudents - stats.totalTeachers, color: "#f97316" },
  ].filter(d => d.value > 0) : [];

  const topCoursesData = coursesData
    ?.slice().sort((a, b) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0))
    .slice(0, 5)
    .map((c) => ({
      name: c.title.length > 20 ? c.title.slice(0, 20) + "..." : c.title,
      enrollments: c._count?.enrollments ?? 0,
      modules: c._count?.modules ?? 0,
    })) ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-80" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Institution Analytics</h2>
        <p className="text-muted-foreground text-sm">Detailed performance and engagement metrics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats?.totalUsers ?? 0}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{stats?.activeStudents ?? 0}</p>
            <p className="text-sm text-muted-foreground">Active Students (7d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-500">{stats?.averageCompletionRate ?? 0}%</p>
            <p className="text-sm text-muted-foreground">Avg Completion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-500">{stats?.totalEnrollments ?? 0}</p>
            <p className="text-sm text-muted-foreground">Total Enrollments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment by Academic Level */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Enrollment by Academic Level</CardTitle></CardHeader>
          <CardContent>
            {enrollmentByLevelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={enrollmentByLevelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <Layers className="h-8 w-8 mb-2" />
                <p className="text-sm">No enrollment data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Status Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Course Status Distribution</CardTitle></CardHeader>
          <CardContent>
            {courseStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={courseStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {courseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <BookOpen className="h-8 w-8 mb-2" />
                <p className="text-sm">No courses yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Courses by Enrollment */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Courses by Enrollment</CardTitle></CardHeader>
          <CardContent>
            {topCoursesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topCoursesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Enrollments" />
                  <Bar dataKey="modules" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Modules" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <TrendingUp className="h-8 w-8 mb-2" />
                <p className="text-sm">No course data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-lg">User Role Distribution</CardTitle></CardHeader>
          <CardContent>
            {roleDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <Users className="h-8 w-8 mb-2" />
                <p className="text-sm">No user data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Courses by Academic Level */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Courses & Students by Academic Level</CardTitle></CardHeader>
          <CardContent>
            {coursesByLevelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={coursesByLevelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="courses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Courses" />
                  <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <GraduationCap className="h-8 w-8 mb-2" />
                <p className="text-sm">No academic level data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}