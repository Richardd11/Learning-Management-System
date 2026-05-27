import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, GraduationCap, BookOpen, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import type { AcademicLevel, ApiResponse, Enrollment, QuizAttempt, Section, User } from "@/types";

interface StudentProgressUser extends Pick<User, "id" | "email" | "firstName" | "lastName" | "avatar" | "xp" | "studentIdNumber"> {
  academicLevel?: AcademicLevel | null;
  section?: Section | null;
  enrollments: Enrollment[];
  quizAttempts: Array<Pick<QuizAttempt, "score" | "passed"> & { quiz: { title: string } }>;
  _count: { progress: number; quizAttempts: number; enrollments: number };
}

export function StudentProgressPage() {
  const [search, setSearch] = useState("");
  const [levelId, setLevelId] = useState("all");
  const [sectionId, setSectionId] = useState("all");

  const { data: levels } = useQuery({
    queryKey: ["academicLevels", "student-progress"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/levels/levels"),
    select: (res) => res.data ?? [],
  });

  const sections = useMemo(() => levels?.find((level) => level.id === levelId)?.sections ?? [], [levels, levelId]);

  const { data: students, isLoading } = useQuery({
    queryKey: ["studentProgress", search, levelId, sectionId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (levelId !== "all") params.set("academicLevelId", levelId);
      if (sectionId !== "all") params.set("sectionId", sectionId);
      const query = params.toString();
      return api.get<ApiResponse<StudentProgressUser[]>>(`/admin/students${query ? `?${query}` : ""}`);
    },
    select: (res) => res.data ?? [],
  });

  const summary = useMemo(() => {
    const list = students ?? [];
    const enrollments = list.flatMap((student) => student.enrollments);
    const avgProgress = enrollments.length
      ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / enrollments.length)
      : 0;
    const quizAttempts = list.flatMap((student) => student.quizAttempts);
    const avgQuizScore = quizAttempts.length
      ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length)
      : 0;
    return { totalStudents: list.length, avgProgress, avgQuizScore };
  }, [students]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Student Progress</h1>
        <p className="text-muted-foreground">Track enrollment progress, quiz scores, and section performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5 flex items-center gap-4"><Users className="h-9 w-9 text-primary" /><div><p className="text-sm text-muted-foreground">Students</p><p className="text-2xl font-bold">{summary.totalStudents}</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><BookOpen className="h-9 w-9 text-primary" /><div><p className="text-sm text-muted-foreground">Avg Progress</p><p className="text-2xl font-bold">{summary.avgProgress}%</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><Trophy className="h-9 w-9 text-primary" /><div><p className="text-sm text-muted-foreground">Avg Quiz Score</p><p className="text-2xl font-bold">{summary.avgQuizScore}%</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4 grid gap-3 md:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or student ID" className="pl-9" />
          </div>
          <Select value={levelId} onValueChange={(value) => { setLevelId(value); setSectionId("all"); }}>
            <SelectTrigger><SelectValue placeholder="Academic level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {levels?.map((level) => <SelectItem key={level.id} value={level.id}>{level.gradeLabel}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sectionId} onValueChange={setSectionId} disabled={levelId === "all"}>
            <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sections</SelectItem>
              {sections.map((section) => <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-40" />)}</div>
      ) : students?.length ? (
        <div className="space-y-4">
          {students.map((student) => {
            const averageProgress = student.enrollments.length
              ? Math.round(student.enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / student.enrollments.length)
              : 0;
            const averageQuizScore = student.quizAttempts.length
              ? Math.round(student.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / student.quizAttempts.length)
              : 0;

            return (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar ?? undefined} />
                        <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{student.firstName} {student.lastName}</CardTitle>
                        <CardDescription>{student.email}</CardDescription>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {student.studentIdNumber && <Badge variant="outline">ID {student.studentIdNumber}</Badge>}
                          {student.academicLevel && <Badge>{student.academicLevel.gradeLabel}</Badge>}
                          {student.section && <Badge variant="secondary">Section {student.section.name}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div><p className="font-bold">{student._count.enrollments}</p><p className="text-muted-foreground">Courses</p></div>
                      <div><p className="font-bold">{student._count.progress}</p><p className="text-muted-foreground">Lessons</p></div>
                      <div><p className="font-bold">{student.xp}</p><p className="text-muted-foreground">XP</p></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span>Average course progress</span><span>{averageProgress}%</span></div>
                      <Progress value={averageProgress} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span>Average quiz score</span><span>{averageQuizScore}%</span></div>
                      <Progress value={averageQuizScore} />
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Courses</h4>
                      {student.enrollments.length ? student.enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="rounded-md border p-3">
                          <div className="flex justify-between gap-3 text-sm"><span className="font-medium">{enrollment.course?.title ?? "Untitled course"}</span><span>{Math.round(enrollment.progress)}%</span></div>
                          <Progress value={enrollment.progress} className="mt-2" />
                        </div>
                      )) : <p className="text-sm text-muted-foreground">No enrollments yet.</p>}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2"><Trophy className="h-4 w-4" /> Recent quizzes</h4>
                      {student.quizAttempts.length ? student.quizAttempts.map((attempt, index) => (
                        <div key={`${student.id}-${attempt.quiz.title}-${index}`} className="flex items-center justify-between rounded-md border p-3 text-sm">
                          <span>{attempt.quiz.title}</span>
                          <Badge variant={attempt.passed ? "default" : "destructive"}>{Math.round(attempt.score)}%</Badge>
                        </div>
                      )) : <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No students match the current filters.</CardContent></Card>
      )}
    </div>
  );
}
