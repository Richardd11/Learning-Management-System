import { useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, Clock, Users, BookOpen, ChevronDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/use-courses";
import { useEnrollment, useEnroll } from "@/hooks/use-enrollment";
import { useAuthStore } from "@/stores/auth-store";
import { formatPrice, getDifficultyColor, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

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
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-16"><p className="text-xl text-muted-foreground">Course not found</p></div>;
  }

  const totalLessons = course.modules?.reduce((sum, m) => sum + m.lessons.length, 0) ?? 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5 p-8 md:p-12 mb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
            {course.rating > 0 && (
              <span className="flex items-center text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                {course.rating.toFixed(1)} ({course.ratingCount} reviews)
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{course.shortDesc ?? course.description.slice(0, 150)}</p>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrollCount} students</span>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.modules?.length ?? 0} modules</span>
          </div>

          {course.instructor && (
            <div className="flex items-center gap-3 mb-6">
              <Avatar>
                <AvatarImage src={course.instructor.avatar ?? undefined} />
                <AvatarFallback>{getInitials(course.instructor.firstName, course.instructor.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{course.instructor.firstName} {course.instructor.lastName}</p>
                <p className="text-sm text-muted-foreground">Instructor</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {enrollment ? (
              <Button size="lg" onClick={() => navigate({ to: `/player/${course.slug}` })}>
                <Play className="h-4 w-4 mr-2" /> Continue Learning
              </Button>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" onClick={handleEnroll} disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ? "Enrolling..." : `Enroll — ${formatPrice(course.price)}`}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About this course</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{course.description}</div>
            </CardContent>
          </Card>

          {/* Curriculum */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
              <div className="space-y-2">
                {course.modules?.map((mod, i) => (
                  <details key={mod.id} className="group border rounded-lg" open={i === 0}>
                    <summary className="flex items-center justify-between p-4 cursor-pointer">
                      <div>
                        <span className="font-medium">{mod.title}</span>
                        <span className="text-sm text-muted-foreground ml-2">{mod.lessons.length} lessons</span>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4 space-y-2">
                      {mod.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 text-sm py-2 px-3 rounded-md hover:bg-accent">
                          <Play className="h-3 w-3 text-muted-foreground" />
                          <span>{lesson.title}</span>
                          {lesson.duration && (
                            <span className="text-xs text-muted-foreground ml-auto">{lesson.duration}m</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          {course.reviews && course.reviews.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {review.user ? getInitials(review.user.firstName, review.user.lastName) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.user?.firstName} {review.user?.lastName}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <div className="text-3xl font-bold text-center">{formatPrice(course.price)}</div>
              {enrollment ? (
                <Button className="w-full" size="lg" onClick={() => navigate({ to: `/player/${course.slug}` })}>
                  Continue Learning
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrollMutation.isPending}>
                  Enroll Now
                </Button>
              )}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Level</span><span className="capitalize">{course.difficulty}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lessons</span><span>{totalLessons}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Modules</span><span>{course.modules?.length ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Students</span><span>{course.enrollCount}</span></div>
              </div>
              {course.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
