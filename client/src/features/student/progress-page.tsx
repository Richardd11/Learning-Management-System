import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { TrendingUp, BookOpen, Award, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnrollments } from "@/hooks/use-enrollment";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, UserStats } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function ProgressPage() {
  const { data: enrollments, isLoading } = useEnrollments();
  const { data: stats } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => api.get<ApiResponse<UserStats>>("/users/stats"),
    select: (res) => res.data,
  });

  const active = enrollments?.filter((e) => e.status === "ACTIVE") ?? [];
  const completed = enrollments?.filter((e) => e.status === "COMPLETED") ?? [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-primary" /> My Progress
        </h1>
        <p className="text-muted-foreground">Track your learning journey across all courses</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: "Enrolled", value: enrollments?.length ?? 0, icon: BookOpen },
          { label: "In Progress", value: active.length, icon: Clock },
          { label: "Completed", value: completed.length, icon: Award },
          { label: "XP Earned", value: stats?.xp ?? 0, icon: CheckCircle2 },
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

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      )}

      {/* Active courses */}
      {!isLoading && active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">In Progress ({active.length})</h2>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {active.map((e) => (
              <motion.div key={e.id} variants={item}>
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{e.course?.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {e.course?.instructor?.firstName} {e.course?.instructor?.lastName}
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress value={e.progress} className="flex-1 h-2" />
                        <span className="text-xs font-medium shrink-0">{e.progress}%</span>
                      </div>
                    </div>
                    <Link to="/player/$slug" params={{ slug: e.course?.slug ?? "" }}>
                      <Button size="sm">Continue</Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Completed courses */}
      {!isLoading && completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Completed ({completed.length})</h2>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {completed.map((e) => (
              <motion.div key={e.id} variants={item}>
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{e.course?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-600">100%</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {!isLoading && (enrollments?.length ?? 0) === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="mb-4">No courses enrolled yet</p>
          <Link to="/courses"><Button>Browse Courses</Button></Link>
        </div>
      )}
    </div>
  );
}
