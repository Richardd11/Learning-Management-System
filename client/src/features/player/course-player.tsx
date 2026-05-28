import { useState, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, ChevronRight, MessageSquare, BookOpen,
  Youtube, Video, FileText, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { useCourse } from "@/hooks/use-courses";
import { useCourseProgress, useCompleteLesson } from "@/hooks/use-enrollment";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Lesson, Quiz, ApiResponse } from "@/types";

interface QuizResult {
  score: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  answers: Array<{ questionId: string; isCorrect: boolean; correctAnswer: string }>;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

function LessonContent({ lesson }: { lesson: Lesson }) {
  const type = lesson.contentType;

  if (type === "YOUTUBE") {
    const ytId = lesson.youtubeTutorial?.videoId
      ?? (lesson.contentUrl ? extractYouTubeId(lesson.contentUrl) : null);
    if (ytId) {
      return (
        <div className="aspect-video w-full rounded-xl overflow-hidden mb-6 bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={lesson.title}
          />
        </div>
      );
    }
  }

  if (type === "VIDEO" && (lesson.contentUrl || lesson.videoUrl)) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden mb-6 bg-black">
        <video
          src={lesson.contentUrl ?? lesson.videoUrl ?? ""}
          controls
          className="w-full h-full"
        />
      </div>
    );
  }

  if (type === "PDF" && lesson.contentUrl) {
    return (
      <div className="mb-6">
        <iframe
          src={lesson.contentUrl}
          className="w-full rounded-xl border"
          style={{ height: "75vh" }}
          title={lesson.title}
        />
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
        {lesson.content ?? "No content available for this lesson."}
      </CardContent>
    </Card>
  );
}

export function CoursePlayer() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const { data: course, isLoading } = useCourse(slug);
  const { data: progress } = useCourseProgress(course?.id ?? "");
  const completeLessonMutation = useCompleteLesson();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "quiz" | "notes">("content");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, string>>>({});
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({});
  const [notes, setNotes] = useState("");

  const submitQuizMutation = useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: Array<{ questionId: string; answer: string }> }) =>
      api.post<ApiResponse<{ results: QuizResult }>>(`/quizzes/${quizId}/attempt`, { answers }),
    onSuccess: (res, vars) => {
      const results = res.data?.results;
      if (results) {
        setQuizResults((prev) => ({ ...prev, [vars.quizId]: results }));
        toast.success(results.passed ? `Passed! Score: ${results.score}%` : `Score: ${results.score}% — Keep trying!`);
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to submit quiz"),
  });

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
      toast.success("Lesson completed!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark complete");
    }
  };

  const handleSubmitQuiz = (quiz: Quiz) => {
    const answers = quizAnswers[quiz.id];
    if (!answers || Object.keys(answers).length < quiz.questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }
    const formatted = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    submitQuizMutation.mutate({ quizId: quiz.id, answers: formatted });
  };

  const contentTypeIcon = (type: string) => {
    if (type === "YOUTUBE") return <Youtube className="h-3.5 w-3.5" />;
    if (type === "VIDEO") return <Video className="h-3.5 w-3.5" />;
    if (type === "PDF") return <FileText className="h-3.5 w-3.5" />;
    return <BookOpen className="h-3.5 w-3.5" />;
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
        {/* Sidebar */}
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
                        <span className="truncate flex-1">{lesson.title}</span>
                        <span className="text-muted-foreground shrink-0">{contentTypeIcon(lesson.contentType)}</span>
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
                <div>
                  <h2 className="text-2xl font-bold">{activeLesson.title}</h2>
                  <Badge variant="outline" className="mt-1 text-xs gap-1">
                    {contentTypeIcon(activeLesson.contentType)}
                    {activeLesson.contentType}
                  </Badge>
                </div>
                {!isLessonCompleted(activeLesson.id) && (
                  <Button size="sm" onClick={() => handleCompleteLesson(activeLesson.id)} disabled={completeLessonMutation.isPending}>
                    Mark Complete
                  </Button>
                )}
                {isLessonCompleted(activeLesson.id) && (
                  <Badge className="bg-green-600 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </Badge>
                )}
              </div>

              {/* Inline content for video/youtube/pdf above tabs */}
              {(activeLesson.contentType === "YOUTUBE" || activeLesson.contentType === "VIDEO" || activeLesson.contentType === "PDF") && (
                <LessonContent lesson={activeLesson} />
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
                    {activeLesson.contentType === "TEXT" ? (
                      <LessonContent lesson={activeLesson} />
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-sm text-muted-foreground">
                          {activeLesson.content
                            ? <p className="whitespace-pre-wrap">{activeLesson.content}</p>
                            : <p>Use the media above to view this lesson.</p>}
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {activeTab === "quiz" && (
                  <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {activeLesson.quizzes?.length ? (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Quizzes</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {activeLesson.quizzes.map((quiz) => (
                              <div key={quiz.id} className="flex items-center gap-2">
                                <Button
                                  variant={activeQuizId === quiz.id ? "default" : "outline"}
                                  className="flex-1 justify-between"
                                  onClick={() => setActiveQuizId(activeQuizId === quiz.id ? null : quiz.id)}
                                >
                                  <span>{quiz.title}</span>
                                  <div className="flex items-center gap-2">
                                    {quizResults[quiz.id] && (
                                      <Badge variant={quizResults[quiz.id].passed ? "default" : "destructive"} className="text-xs">
                                        {quizResults[quiz.id].score}%
                                      </Badge>
                                    )}
                                    <Badge variant="secondary">{quiz.questions.length} Qs</Badge>
                                  </div>
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {activeQuizId && (() => {
                          const quiz = activeLesson.quizzes.find((q) => q.id === activeQuizId)!;
                          const result = quizResults[activeQuizId];
                          return (
                            <>
                              {result && (
                                <Card className={cn(result.passed ? "border-green-500/40 bg-green-500/5" : "border-destructive/40 bg-destructive/5")}>
                                  <CardContent className="p-4 flex items-center gap-4">
                                    <Award className={cn("h-8 w-8", result.passed ? "text-green-600" : "text-destructive")} />
                                    <div>
                                      <p className="font-semibold text-lg">{result.score}%</p>
                                      <p className="text-sm text-muted-foreground">
                                        {result.earnedPoints}/{result.totalPoints} points · {result.passed ? "Passed!" : "Not passed"}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {quiz.questions.map((question, qi) => {
                                const questionResult = result?.answers.find((a) => a.questionId === question.id);
                                return (
                                  <Card key={question.id} className={cn(
                                    questionResult ? (questionResult.isCorrect ? "border-green-500/30" : "border-destructive/30") : ""
                                  )}>
                                    <CardContent className="p-6">
                                      <p className="font-medium mb-3">
                                        Q{qi + 1}: {question.question}
                                      </p>
                                      {question.type === "SHORT_ANSWER" ? (
                                        <input
                                          className="w-full border rounded-md px-3 py-2 text-sm"
                                          placeholder="Type your answer..."
                                          disabled={!!result}
                                          value={quizAnswers[activeQuizId]?.[question.id] ?? ""}
                                          onChange={(e) => setQuizAnswers({
                                            ...quizAnswers,
                                            [activeQuizId]: { ...quizAnswers[activeQuizId] ?? {}, [question.id]: e.target.value },
                                          })}
                                        />
                                      ) : (
                                        <div className="space-y-2">
                                          {question.options?.map((opt, oi) => {
                                            const isSelected = quizAnswers[activeQuizId]?.[question.id] === String(oi);
                                            const isCorrectOpt = questionResult && question.correctAnswer === String(oi);
                                            return (
                                              <label
                                                key={oi}
                                                className={cn(
                                                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                                  result
                                                    ? isCorrectOpt
                                                      ? "border-green-500 bg-green-500/10"
                                                      : isSelected && !questionResult?.isCorrect
                                                        ? "border-destructive bg-destructive/10"
                                                        : "opacity-60"
                                                    : isSelected
                                                      ? "border-primary bg-primary/5"
                                                      : "hover:bg-accent"
                                                )}
                                              >
                                                <input
                                                  type="radio"
                                                  name={`${activeQuizId}-${question.id}`}
                                                  value={String(oi)}
                                                  disabled={!!result}
                                                  checked={isSelected}
                                                  onChange={() => setQuizAnswers({
                                                    ...quizAnswers,
                                                    [activeQuizId]: { ...quizAnswers[activeQuizId] ?? {}, [question.id]: String(oi) },
                                                  })}
                                                  className="accent-primary"
                                                />
                                                <span className="text-sm">{opt}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                );
                              })}

                              {!result && (
                                <Card>
                                  <CardContent className="p-4 flex justify-end">
                                    <Button
                                      onClick={() => handleSubmitQuiz(quiz)}
                                      disabled={submitQuizMutation.isPending}
                                    >
                                      {submitQuizMutation.isPending ? "Submitting…" : "Submit Quiz"}
                                    </Button>
                                  </CardContent>
                                </Card>
                              )}
                            </>
                          );
                        })()}
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
                        <textarea
                          className="w-full border rounded-lg p-3 min-h-[200px] text-sm resize-y"
                          placeholder="Write your notes here..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
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
                <span className="text-sm text-muted-foreground">
                  {allLessons.indexOf(activeLesson) + 1} / {allLessons.length}
                </span>
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