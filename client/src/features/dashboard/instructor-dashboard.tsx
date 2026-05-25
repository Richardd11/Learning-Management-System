import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { BarChart3, Users, BookOpen, Plus, Star, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorCourses } from "@/hooks/use-courses";

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
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" /> Teacher Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your subjects and track student performance</p>
        </div>
        <Link to="/builder">
          <Button><Plus className="h-4 w-4 mr-2" /> New Subject</Button>
        </Link>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Students", value: totalStudents, icon: Users },
          { label: "Published Subjects", value: courses?.filter((c) => c.status === "PUBLISHED").length ?? 0, icon: BookOpen },
          { label: "Average Rating", value: avgRating, icon: Star },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              <p className="text-center text-muted-foreground py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Link to="/builder">
              <Button variant="outline" className="w-full justify-start"><Plus className="h-4 w-4 mr-2" /> Create New Subject</Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" disabled>
              <BarChart3 className="h-4 w-4 mr-2" /> Generate AI Weekly Digest
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>My Subjects</CardTitle></CardHeader>
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
              <p className="text-muted-foreground mb-4">No subjects yet</p>
              <Link to="/builder"><Button>Create Your First Subject</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
