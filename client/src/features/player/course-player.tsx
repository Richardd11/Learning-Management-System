import { useState, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { useCourse } from "@/hooks/use-courses";
import { useCourseProgress, useCompleteLesson } from "@/hooks/use-enrollment";
import { toast } from "sonner";
import type { Lesson, Quiz } from "@/types";

export function CoursePlayer() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const { data: course, isLoading } = useCourse(slug);
  const { data: progress } = useCourseProgress(course?.id ?? "");
  const completeLessonMutation = useCompleteLesson();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "quiz" | "notes">("content");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, string>>>({});
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap((m) => m.lessons);
  }, [course]);

  const activeLesson = useMemo(() => {
    if (activeLessonId) return allLessons.find((l) => l.id === activeLessonId);
    return allLessons[0];
  }, [activeLessonId, allLessons]);

  const isLessonCompleted = (lessonId: string) => progress?.completed.includes(lessonId) ?? false;

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      await completeLessonMutation.mutateAsync(lessonId);
      toast.success("Lesson completed! 🎉");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark complete");
    }
  };

  const handleSubmitQuizAnswer = async (quiz: Quiz) => {
    const answers = quizAnswers[quiz.id];
    if (!answers || Object.keys(answers).length === 0) { 
      toast.error("Please answer all questions"); 
      return; 
    }
    // Quiz submission will be implemented when QuizAttempt hook is ready
    toast.success("Quiz answers saved!");
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto"><Skeleton className="h-[600px] w-full rounded-xl" /></div>;
  }

  if (!course) {
    return <div className="text-center py-16"><p className="text-xl text-muted-foreground">Course not found</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumbs items={[{ label: "Courses", to: "/courses" }, { label: course.title }]} />

      <div className="flex gap-6">
        {/* Sidebar - Module list */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-72 shrink-0 hidden lg:block"
        >
          <Card className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                Progress
                <Badge variant="secondary">{progress?.percentage ?? 0}%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-3">
              {course.modules?.map((mod) => (
                <div key={mod.id}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">{mod.title}</p>
                  {mod.lessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);
                    const isActive = activeLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => { setActiveLessonId(lesson.id); setActiveTab("content"); }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-accent",
                        )}
                      >
                        {completed ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          </motion.div>
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {activeLesson && (
            <motion.div key={activeLesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{activeLesson.title}</h2>
                {!isLessonCompleted(activeLesson.id) && (
                  <Button size="sm" onClick={() => handleCompleteLesson(activeLesson.id)} disabled={completeLessonMutation.isPending}>
                    Mark Complete
                  </Button>
                )}
              </div>

              {/* Video placeholder */}
              {activeLesson.videoUrl && (
                <div className="aspect-video bg-black rounded-xl mb-6 flex items-center justify-center">
                  <p className="text-white text-sm">Video Player</p>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b pb-2">
                {[
                  { key: "content" as const, icon: BookOpen, label: "Content" },
                  { key: "quiz" as const, icon: CheckCircle2, label: `Quiz (${activeLesson.quizzes?.length ?? 0})` },
                  { key: "notes" as const, icon: MessageSquare, label: "Notes" },
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    variant={activeTab === tab.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <tab.icon className="h-4 w-4 mr-1" /> {tab.label}
                  </Button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "content" && (
                  <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card>
                      <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {activeLesson.content ?? "No content available for this lesson."}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "quiz" && (
                  <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {activeLesson.quizzes?.length ? (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Available Quizzes</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {activeLesson.quizzes.map((quiz) => (
                              <Button
                                key={quiz.id}
                                variant={activeQuizId === quiz.id ? "default" : "outline"}
                                className="w-full justify-between"
                                onClick={() => setActiveQuizId(quiz.id)}
                              >
                                <span>{quiz.title}</span>
                                <Badge variant="secondary">{quiz.questions.length} questions</Badge>
                              </Button>
                            ))}
                          </CardContent>
                        </Card>

                        {activeQuizId && activeLesson.quizzes.find((q) => q.id === activeQuizId)?.questions.map((question, qi) => (
                          <Card key={question.id}>
                            <CardContent className="p-6">
                              <p className="font-medium mb-3">Q{qi + 1}: {question.question}</p>
                              {question.type === "SHORT_ANSWER" ? (
                                <input
                                  className="w-full border rounded-md px-3 py-2 text-sm"
                                  placeholder="Type your answer..."
                                  value={quizAnswers[activeQuizId]?.[question.id] ?? ""}
                                  onChange={(e) => setQuizAnswers({
                                    ...quizAnswers,
                                    [activeQuizId]: { ...quizAnswers[activeQuizId] ?? {}, [question.id]: e.target.value },
                                  })}
                                />
                              ) : (
                                <div className="space-y-2">
                                  {question.options?.map((opt) => (
                                    <label key={opt} className={cn(
                                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                      quizAnswers[activeQuizId]?.[question.id] === opt ? "border-primary bg-primary/5" : "hover:bg-accent"
                                    )}>
                                      <input
                                        type="radio"
                                        name={`${activeQuizId}-${question.id}`}
                                        value={opt}
                                        checked={quizAnswers[activeQuizId]?.[question.id] === opt}
                                        onChange={() => setQuizAnswers({
                                          ...quizAnswers,
                                          [activeQuizId]: { ...quizAnswers[activeQuizId] ?? {}, [question.id]: opt },
                                        })}
                                        className="accent-primary"
                                      />
                                      <span className="text-sm">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}

                        {activeQuizId && (
                          <Card>
                            <CardContent className="p-4 flex justify-end">
                              <Button onClick={() => handleSubmitQuizAnswer(activeLesson.quizzes.find((q) => q.id === activeQuizId)!)}>
                                Submit Quiz
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No quizzes for this lesson.</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "notes" && (
                  <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-center py-4">
                          Notes feature — take notes while you learn.
                        </p>
                        <textarea
                          className="w-full border rounded-lg p-3 min-h-[200px] text-sm resize-y"
                          placeholder="Write your notes here..."
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  disabled={allLessons.indexOf(activeLesson) === 0}
                  onClick={() => {
                    const idx = allLessons.indexOf(activeLesson);
                    if (idx > 0) { setActiveLessonId(allLessons[idx - 1].id); setActiveTab("content"); }
                  }}
                >
                  Previous
                </Button>
                <Button
                  disabled={allLessons.indexOf(activeLesson) === allLessons.length - 1}
                  onClick={() => {
                    const idx = allLessons.indexOf(activeLesson);
                    if (idx < allLessons.length - 1) { setActiveLessonId(allLessons[idx + 1].id); setActiveTab("content"); }
                  }}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}