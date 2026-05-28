import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, BookOpen, Award, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useInstructorCourses } from "@/hooks/use-courses";
import type { ApiResponse } from "@/types";

interface StudentProgressEntry {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  progress: number;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  completedAt: string | null;
  enrolledAt: string;
  section?: { name: string };
  academicLevel?: { gradeLabel: string };
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function StudentProgressViewer() {
  const { data: courses, isLoading: coursesLoading } = useInstructorCourses();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [search, setSearch] = useState("");

  const { data: enrollments, isLoading: enrollLoading } = useQuery({
    queryKey: ["courseEnrollments", selectedCourseId],
    queryFn: () =>
      api.get<ApiResponse<StudentProgressEntry[]>>(`/enrollments/${selectedCourseId}/students`),
    select: (res) => res.data ?? [],
    enabled: !!selectedCourseId,
  });

  const filtered = (enrollments ?? []).filter((e) => {
    const name = `${e.firstName} ${e.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
  });

  const completed = filtered.filter((e) => e.status === "COMPLETED").length;
  const avgProgress = filtered.length
    ? Math.round(filtered.reduce((s, e) => s + e.progress, 0) / filtered.length)
    : 0;

  const statusColor = (s: string) => {
    if (s === "COMPLETED") return "default";
    if (s === "DROPPED") return "destructive";
    return "secondary";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-1">Student Progress</h1>
        <p className="text-muted-foreground">Track your students' learning progress per course</p>
      </motion.div>

      {/* Course selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Select Course</label>
              {coursesLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm h-9"
                  value={selectedCourseId}
                  onChange={(e) => { setSelectedCourseId(e.target.value); setSearch(""); }}
                >
                  <option value="">Choose a course…</option>
                  {courses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c._count?.enrollments ?? 0} students)
                    </option>
                  ))}
                </select>
              )}
            </div>
            {selectedCourseId && (
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Search Students</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      {selectedCourseId && !enrollLoading && filtered.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Enrolled", value: filtered.length, icon: Users },
            { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp },
            { label: "Completed", value: completed, icon: Award },
            { label: "Active", value: filtered.filter((e) => e.status === "ACTIVE").length, icon: BookOpen },
          ].map((s) => (
            <motion.div key={s.label} variants={item}>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                  <s.icon className="h-7 w-7 text-primary/60" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Student list */}
      {!selectedCourseId && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Select a course above to view student progress</p>
        </div>
      )}

      {selectedCourseId && enrollLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      )}

      {selectedCourseId && !enrollLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>{search ? "No students match your search" : "No students enrolled yet"}</p>
        </div>
      )}

      {selectedCourseId && !enrollLoading && filtered.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {filtered.map((e) => (
            <motion.div key={e.userId} variants={item}>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary text-sm">
                    {e.firstName[0]}{e.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">
                        {e.firstName} {e.lastName}
                      </p>
                      {e.academicLevel && (
                        <Badge variant="outline" className="text-xs">{e.academicLevel.gradeLabel}</Badge>
                      )}
                      {e.section && (
                        <Badge variant="outline" className="text-xs">{e.section.name}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{e.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={e.progress} className="flex-1 h-2" />
                      <span className="text-xs font-medium shrink-0 w-10 text-right">{e.progress}%</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <Badge variant={statusColor(e.status)}>{e.status.toLowerCase()}</Badge>
                    <p className="text-xs text-muted-foreground">
                      {e.completedAt
                        ? `Done ${new Date(e.completedAt).toLocaleDateString()}`
                        : `Enrolled ${new Date(e.enrolledAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
