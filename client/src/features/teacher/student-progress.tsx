import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, BookOpen, Award, Search, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

const statColors = [
  { bg: "bg-blue-500/10", ring: "ring-blue-500/15", text: "text-blue-600" },
  { bg: "bg-emerald-500/10", ring: "ring-emerald-500/15", text: "text-emerald-600" },
  { bg: "bg-amber-500/10", ring: "ring-amber-500/15", text: "text-amber-600" },
  { bg: "bg-violet-500/10", ring: "ring-violet-500/15", text: "text-violet-600" },
];

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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_52%,#111827_100%)] p-6 text-white shadow-2xl shadow-slate-950/15"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.3)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(14,165,233,0.18)_0%,_transparent_45%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <motion.div
          className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="rounded-2xl bg-white/10 ring-1 ring-white/15 p-3 backdrop-blur">
            <GraduationCap className="h-7 w-7 text-violet-200" />
          </div>
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/75 backdrop-blur">
              <Users className="h-3 w-3" /> Teacher Dashboard
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Student Progress</h1>
            <p className="text-sm text-white/65 mt-0.5">Track your students' learning progress per course</p>
          </div>
        </div>
      </motion.div>

      {/* Course Selector */}
      <Card className="rounded-3xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">Select Course</label>
              {coursesLoading ? (
                <Skeleton className="h-9 w-full rounded-xl" />
              ) : (
                <select
                  className="w-full bg-background border rounded-xl px-3 py-2 text-sm h-9 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  value={selectedCourseId}
                  onChange={(e) => { setSelectedCourseId(e.target.value); setSearch(""); }}
                >
                  <option value="">Choose a course...</option>
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
                <label className="text-sm font-medium mb-1.5 block">Search Students</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
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
          ].map((s, idx) => (
            <motion.div key={s.label} variants={item} whileHover={{ y: -4 }}>
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${statColors[idx].bg} ring-1 ${statColors[idx].ring}`}>
                    <s.icon className={`h-5 w-5 ${statColors[idx].text}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty: No course selected */}
      {!selectedCourseId && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center rounded-3xl bg-muted/60 p-5 mb-4">
            <Users className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Select a course</h3>
          <p className="text-sm text-muted-foreground mt-1">Choose a course above to view student progress</p>
        </div>
      )}

      {/* Loading */}
      {selectedCourseId && enrollLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      )}

      {/* Empty: No results */}
      {selectedCourseId && !enrollLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center rounded-3xl bg-muted/60 p-4 mb-4">
            <Users className="h-9 w-9 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {search ? "No students match your search" : "No students enrolled yet"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "Try a different name or email" : "Students will appear here once enrolled"}
          </p>
        </div>
      )}

      {/* Student List */}
      {selectedCourseId && !enrollLoading && filtered.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {filtered.map((e) => (
            <motion.div key={e.userId} variants={item} whileHover={{ y: -2 }}>
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 ring-2 ring-background flex items-center justify-center shrink-0 font-semibold text-primary text-sm shadow-sm">
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
