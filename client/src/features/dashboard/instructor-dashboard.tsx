import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BarChart3, Users, BookOpen, Plus, Star, TrendingUp, Layers, GraduationCap, Megaphone, Youtube } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInstructorCourses } from "@/hooks/use-courses";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, Announcement, AcademicLevel } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function InstructorDashboard() {
  const { data: courses, isLoading } = useInstructorCourses();

  const totalStudents = courses?.reduce((sum, c) => sum + (c._count?.enrollments ?? 0), 0) ?? 0;
  const totalReviews = courses?.reduce((sum, c) => sum + (c._count?.reviews ?? 0), 0) ?? 0;
  const avgRating = courses?.length
    ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
    : "0";

  const chartData = courses?.map((c) => ({
    name: c.title.length > 20 ? c.title.slice(0, 20) + "..." : c.title,
    students: c._count?.enrollments ?? 0,
  })) ?? [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" /> Teacher Portal
          </h1>
          <p className="text-muted-foreground">Manage your courses, students, and content</p>
        </div>
        <Link to="/builder">
          <Button><Plus className="h-4 w-4 mr-2" /> New Course</Button>
        </Link>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: totalStudents, icon: Users },
          { label: "Published Courses", value: courses?.filter((c) => c.status === "PUBLISHED").length ?? 0, icon: BookOpen },
          { label: "Average Rating", value: avgRating, icon: Star },
          { label: "Total Reviews", value: totalReviews, icon: TrendingUp },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary/60" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses" className="gap-1"><BookOpen className="h-4 w-4" /> My Courses</TabsTrigger>
          <TabsTrigger value="content" className="gap-1"><Youtube className="h-4 w-4" /> Content</TabsTrigger>
          <TabsTrigger value="announcements" className="gap-1"><Megaphone className="h-4 w-4" /> Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Enrollment Overview</CardTitle></CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No enrollment data yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>My Courses</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
                ) : courses && courses.length > 0 ? (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <motion.div key={course.id} whileHover={{ backgroundColor: "hsl(var(--accent))" }} className="flex items-center gap-4 p-3 rounded-lg transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{course.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{course._count?.enrollments ?? 0} students</span>
                            <span>{course._count?.reviews ?? 0} reviews</span>
                            <span>{course._count?.modules ?? 0} modules</span>
                          </div>
                        </div>
                        <Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"}>
                          {course.status.toLowerCase()}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No courses yet</p>
                    <Link to="/builder"><Button>Create Your First Course</Button></Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <TeacherContentTab />
        </TabsContent>

        <TabsContent value="announcements">
          <TeacherAnnouncementsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeacherContentTab() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState<any>(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);

  const fetchMetadata = async () => {
    if (!url) return;
    setFetchingMeta(true);
    try {
      const res = await api.post<ApiResponse<any>>("/youtube/fetch-metadata", { url });
      setMetadata(res.data);
    } catch {
      setMetadata(null);
    } finally {
      setFetchingMeta(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Youtube className="h-5 w-5" /> YouTube Tutorial Publisher</CardTitle>
          <CardDescription>Fetch video metadata and create YouTube-based lessons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={fetchMetadata} disabled={!url || fetchingMeta}>
              {fetchingMeta ? "Fetching..." : "Fetch Info"}
            </Button>
          </div>
          {metadata && (
            <div className="border rounded-lg p-4 flex gap-4">
              {metadata.thumbnail && (
                <img src={metadata.thumbnail} alt="Thumbnail" className="w-48 h-28 object-cover rounded" />
              )}
              <div>
                <h3 className="font-semibold">{metadata.title}</h3>
                <p className="text-sm text-muted-foreground">Channel: {metadata.channel}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Link to="/builder">
            <Button variant="outline" className="w-full justify-start"><Plus className="h-4 w-4 mr-2" /> Create New Course</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function TeacherAnnouncementsTab() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", courseId: "", isInstitutionWide: false, priority: "normal" as const });

  const { data: announcements } = useQuery({
    queryKey: ["teacherAnnouncements"],
    queryFn: () => api.get<ApiResponse<Announcement[]>>("/announcements"),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/announcements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherAnnouncements"] });
      setShowCreate(false);
      setForm({ title: "", content: "", courseId: "", isInstitutionWide: false, priority: "normal" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Course Announcements</h3>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Content" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.title || !form.content}>Post</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {announcements?.map((ann) => (
        <Card key={ann.id}>
          <CardContent className="p-4">
            <h4 className="font-medium">{ann.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{ann.content}</p>
            <p className="text-xs text-muted-foreground mt-2">{new Date(ann.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}