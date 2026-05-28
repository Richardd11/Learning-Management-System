import { useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Star, Clock, Users, BookOpen, ChevronDown, Play,
  Lock, FileText, GraduationCap, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/use-courses";
import { useEnrollment, useEnroll } from "@/hooks/use-enrollment";
import { useAuthStore } from "@/stores/auth-store";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { formatPrice, getDifficultyColor, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function CourseDetailPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const { data: course, isLoading } = useCourse(slug);
  const { user } = useAuthStore();
  const { data: enrollment } = useEnrollment(course?.id ?? "");
  const enrollMutation = useEnroll();
  const navigate = useNavigate();

  const handleEnroll = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!course) return;
    try {
      await enrollMutation.mutateAsync(course.id);
      toast.success("Enrolled successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enrollment failed");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-72 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60 ring-1 ring-border/40">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold">Course not found</p>
        <p className="text-sm text-muted-foreground">This course may have been removed or the link is invalid.</p>
        <Button variant="outline" onClick={() => navigate({ to: "/courses" })}>
          Back to Courses
        </Button>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((sum, m) => sum + m.lessons.length, 0) ?? 0;

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Courses", to: "/courses" }, { label: course.title }]} />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_52%,#111827_100%)] p-8 md:p-12 mb-8 text-white shadow-2xl shadow-slate-950/15"
      >
        {/* Radial overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.35)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(14,165,233,0.22)_0%,_transparent_45%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        {/* Animated blobs */}
        <motion.div
          className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-16 left-8 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl"
          animate={{ x: [0, 14, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
            {course.rating > 0 && (
              <span className="flex items-center text-sm text-white/80">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                {course.rating.toFixed(1)} ({course.ratingCount} reviews)
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{course.title}</h1>
          <p className="text-base text-white/70 mb-6 leading-relaxed">
            {course.shortDesc ?? course.description.slice(0, 150)}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-white/65">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-cyan-300" /> {course.enrollCount} students
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-purple-300" /> {totalLessons} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-300" /> {course.modules?.length ?? 0} modules
            </span>
          </div>

          {course.instructor && (
            <div className="flex items-center gap-3 mb-7 rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 w-fit">
              <Avatar className="h-9 w-9 ring-2 ring-white/20">
                <AvatarImage src={course.instructor.avatar ?? undefined} />
                <AvatarFallback className="text-xs bg-white/10 text-white">
                  {getInitials(course.instructor.firstName, course.instructor.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white text-sm">
                  {course.instructor.firstName} {course.instructor.lastName}
                </p>
                <p className="text-xs text-white/55">Instructor</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {enrollment ? (
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-white/90 shadow-lg"
                onClick={() => navigate({ to: `/player/${course.slug}` })}
              >
                <Play className="h-4 w-4 mr-2" /> Continue Learning
              </Button>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-white/90 shadow-lg"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? "Enrolling..." : `Enroll — ${formatPrice(course.price)}`}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <motion.div variants={itemVariant}>
            <Card className="rounded-3xl overflow-hidden">
              <CardHeader className="border-b bg-muted/20 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="rounded-xl p-2.5 bg-indigo-500/10 ring-1 ring-indigo-500/15">
                    <FileText className="h-4 w-4 text-indigo-500" />
                  </div>
                  About this course
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {course.description}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Curriculum */}
          <motion.div variants={itemVariant}>
            <Card className="rounded-3xl overflow-hidden">
              <CardHeader className="border-b bg-muted/20 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="rounded-xl p-2.5 bg-purple-500/10 ring-1 ring-purple-500/15">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                  </div>
                  Curriculum
                  <Badge variant="secondary" className="ml-auto text-xs">{totalLessons} lessons</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {course.modules?.map((mod, i) => (
                  <details key={mod.id} className="group rounded-2xl border border-border/60 bg-muted/20 overflow-hidden" open={i === 0}>
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/15">
                          {i + 1}
                        </div>
                        <span className="font-medium text-sm">{mod.title}</span>
                        <span className="text-xs text-muted-foreground">{mod.lessons.length} lessons</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4 space-y-1">
                      {mod.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 text-sm py-2 px-3 rounded-xl hover:bg-accent/60 transition-colors">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted/60">
                            <Play className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.duration ? (
                            <span className="text-xs text-muted-foreground">{lesson.duration}m</span>
                          ) : (
                            <Lock className="h-3 w-3 text-muted-foreground/40" />
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Reviews */}
          {course.reviews && course.reviews.length > 0 && (
            <motion.div variants={itemVariant}>
              <Card className="rounded-3xl overflow-hidden">
                <CardHeader className="border-b bg-muted/20 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="rounded-xl p-2.5 bg-yellow-500/10 ring-1 ring-yellow-500/15">
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    Reviews
                    <Badge variant="secondary" className="ml-auto text-xs">{course.reviews.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl bg-muted/30 p-4 ring-1 ring-border/40">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                          <AvatarFallback className="text-xs font-semibold">
                            {review.user ? getInitials(review.user.firstName, review.user.lastName) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">
                            {review.user?.firstName} {review.user?.lastName}
                          </p>
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <motion.div variants={itemVariant}>
          <Card className="sticky top-24 rounded-3xl overflow-hidden shadow-lg">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-violet-500 to-cyan-500" />
            <CardContent className="p-6 space-y-5">
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-br from-primary to-indigo-400 bg-clip-text text-transparent">
                  {formatPrice(course.price)}
                </p>
              </div>
              {enrollment ? (
                <Button className="w-full" size="lg" onClick={() => navigate({ to: `/player/${course.slug}` })}>
                  <Play className="h-4 w-4 mr-2" /> Continue Learning
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                </Button>
              )}
              <div className="rounded-2xl bg-muted/40 ring-1 ring-border/40 divide-y divide-border/40 overflow-hidden">
                {[
                  { label: "Level", value: course.difficulty, capitalize: true },
                  { label: "Lessons", value: totalLessons },
                  { label: "Modules", value: course.modules?.length ?? 0 },
                  { label: "Students", value: course.enrollCount },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-medium ${row.capitalize ? "capitalize" : ""}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              {course.tags.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    <Tag className="h-3 w-3" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {course.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {course.instructor && (
                <div className="flex items-center gap-3 rounded-2xl bg-indigo-500/5 ring-1 ring-indigo-500/10 p-3">
                  <div className="rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/15 p-2">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Instructor</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
