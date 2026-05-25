import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { BookOpen, Award, Flame, Zap, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { useEnrollments } from "@/hooks/use-enrollment";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, UserStats } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function AnimatedCounter({ value, label, icon: Icon }: { value: number; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <motion.div variants={item}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <motion.p
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {value.toLocaleString()}
              </motion.p>
            </div>
            <Icon className="h-8 w-8 text-primary opacity-80" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: enrollments, isLoading: enrollLoading } = useEnrollments();
  const { data: stats } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => api.get<ApiResponse<UserStats>>("/users/stats"),
    select: (res) => res.data,
  });

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-1">Welcome back, {user.firstName}!</h1>
        <p className="text-muted-foreground mb-8">Here&apos;s your learning progress</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnimatedCounter value={stats?.enrollments ?? 0} label="Enrolled Courses" icon={BookOpen} />
        <AnimatedCounter value={stats?.completedCourses ?? 0} label="Completed" icon={Award} />
        <AnimatedCounter value={stats?.streak ?? 0} label="Day Streak" icon={Flame} />
        <AnimatedCounter value={stats?.xp ?? 0} label="XP Points" icon={Zap} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Continue Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : enrollments && enrollments.length > 0 ? (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                  {enrollments.filter((e) => e.status === "ACTIVE").slice(0, 5).map((enrollment) => (
                    <motion.div key={enrollment.id} variants={item}>
                      <Link to="/courses/$slug" params={{ slug: enrollment.course?.slug ?? "" }}>
                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{enrollment.course?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={enrollment.progress} className="flex-1 h-1.5" />
                              <span className="text-xs text-muted-foreground shrink-0">{enrollment.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No courses yet. Start learning today!</p>
                  <Link to="/courses">
                    <Button>Browse Courses</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-3">
                  {enrollments.slice(0, 4).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate">Enrolled in {enrollment.course?.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(enrollment.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(stats?.streak ?? 0) >= 3 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-3 p-2 rounded-lg bg-orange-500/10">
                    <Flame className="h-6 w-6 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">{stats?.streak}-Day Streak!</p>
                      <p className="text-xs text-muted-foreground">Keep it going!</p>
                    </div>
                  </motion.div>
                )}
                {(stats?.completedCourses ?? 0) > 0 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10">
                    <Award className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Course Completer</p>
                      <p className="text-xs text-muted-foreground">{stats?.completedCourses} courses completed</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
