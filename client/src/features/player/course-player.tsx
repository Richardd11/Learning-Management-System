import { useState, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, ChevronRight, ChevronLeft, MessageSquare, BookOpen,
  Youtube, Video, FileText, Award, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
    <Card className="mb-6 rounded-2xl">
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
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <Skeleton className="h-8 w-1/3 rounded-xl" />
        <div className="flex gap-6">
          <Skeleton className="h-[600px] w-72 rounded-2xl hidden lg:block" />
          <Skeleton className="h-[600px] flex-1 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60">
          <BookOpen className="h-8 w-8" />
        </div>
        <p className="font-medium">Course not found</p>
      </div>
    );
  }

  const currentIdx = activeLesson ? allLessons.indexOf(activeLesson) : 0;

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
          <Card className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl flex flex-col">
            <CardHeader className="pb-3 border-b bg-muted/20 shrink-0">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" /> Course Progress
                </span>
                <Badge variant="secondary" className="tabular-nums">{progress?.percentage ?? 0}%</Badge>
              </CardTitle>
              <Progress value={progress?.percentage ?? 0} className="h-1.5 mt-2" />
            </CardHeader>
            <div className="overflow-y-auto flex-1">
              <div className="space-y-0.5 p-3">
                {course.modules?.map((mod) => (
                  <div key={mod.id} className="mb-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">{mod.title}</p>
                    {mod.lessons.map((lesson) => {
                      const completed = isLessonCompleted(lesson.id);
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => { setActiveLessonId(lesson.id); setActiveTab("content"); }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-left transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-accent text-foreground",
                          )}
                        >
                          {completed ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            </motion.div>
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                          )}
                          <span className="truncate flex-1 text-xs">{lesson.title}</span>
                          <span className="text-muted-foreground shrink-0">{contentTypeIcon(lesson.contentType)}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {activeLesson && (
            <motion.div key={activeLesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Lesson header */}
              <div className="flex items-start justify-between gap-4 mb-5 rounded-2xl border bg-card/70 p-4 shadow-sm">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight truncate">{activeLesson.title}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-xs gap-1">
                      {contentTypeIcon(activeLesson.contentType)}
                      {activeLesson.contentType}
                    </Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {currentIdx + 1} / {allLessons.length}
                    </span>
                  </div>
                </div>
                {!isLessonCompleted(activeLesson.id) ? (
                  <Button size="sm" onClick={() => handleCompleteLesson(activeLesson.id)} disabled={completeLessonMutation.isPending} className="shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    {completeLessonMutation.isPending ? "Saving..." : "Mark Complete"}
                  </Button>
                ) : (
                  <Badge className="bg-emerald-600 gap-1 shrink-0">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </Badge>
                )}
              </div>

              {/* Inline content for video/youtube/pdf above tabs */}
              {(activeLesson.contentType === "YOUTUBE" || activeLesson.contentType === "VIDEO" || activeLesson.contentType === "PDF") && (
                <LessonContent lesson={activeLesson} />
              )}

              {/* Tabs */}
              <div className="flex gap-1.5 mb-5 rounded-xl bg-muted/50 border p-1">
                {[
                  { key: "content" as const, icon: BookOpen, label: "Content" },
                  { key: "quiz" as const, icon: CheckCircle2, label: `Quiz (${activeLesson.quizzes?.length ?? 0})` },
                  { key: "notes" as const, icon: MessageSquare, label: "Notes" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      activeTab === tab.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "content" && (
                  <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {activeLesson.contentType === "TEXT" ? (
                      <LessonContent lesson={activeLesson} />
                    ) : (
                      <Card className="rounded-2xl">
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
                        <Card className="rounded-2xl overflow-hidden">
                          <CardHeader className="border-b bg-muted/20 pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                              <div className="rounded-xl bg-primary/10 ring-1 ring-primary/15 p-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              </div>
                              Quizzes
                            </CardTitle>
                            <CardDescription>Select a quiz below to begin</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2 p-4">
                            {activeLesson.quizzes.map((quiz) => (
                              <button
                                key={quiz.id}
                                className={cn(
                                  "w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium border transition-all",
                                  activeQuizId === quiz.id
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-muted/30 hover:bg-muted/60 border-border/60"
                                )}
                                onClick={() => setActiveQuizId(activeQuizId === quiz.id ? null : quiz.id)}
                              >
                                <span>{quiz.title}</span>
                                <div className="flex items-center gap-2">
                                  {quizResults[quiz.id] && (
                                    <Badge variant={quizResults[quiz.id].passed ? "default" : "destructive"} className="text-xs">
                                      {quizResults[quiz.id].score}%
                                    </Badge>
                                  )}
                                  <Badge variant="secondary" className="text-xs">{quiz.questions.length} Qs</Badge>
                                </div>
                              </button>
                            ))}
                          </CardContent>
                        </Card>

                        {activeQuizId && (() => {
                          const quiz = activeLesson.quizzes.find((q) => q.id === activeQuizId)!;
                          const result = quizResults[activeQuizId];
                          return (
                            <>
                              {result && (
                                <Card className={cn("rounded-2xl overflow-hidden", result.passed ? "border-emerald-500/40 bg-emerald-500/5" : "border-destructive/40 bg-destructive/5")}>
                                  <CardContent className="p-5 flex items-center gap-4">
                                    <div className={cn("rounded-2xl p-3 ring-1", result.passed ? "bg-emerald-500/10 ring-emerald-500/20" : "bg-destructive/10 ring-destructive/20")}>
                                      <Award className={cn("h-7 w-7", result.passed ? "text-emerald-600" : "text-destructive")} />
                                    </div>
                                    <div>
                                      <p className="font-bold text-xl tabular-nums">{result.score}%</p>
                                      <p className="text-sm text-muted-foreground">
                                        {result.earnedPoints}/{result.totalPoints} points &middot; {result.passed ? "Passed!" : "Not passed yet"}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {quiz.questions.map((question, qi) => {
                                const questionResult = result?.answers.find((a) => a.questionId === question.id);
                                return (
                                  <Card key={question.id} className={cn(
                                    "rounded-2xl overflow-hidden",
                                    questionResult
                                      ? questionResult.isCorrect
                                        ? "border-emerald-500/30"
                                        : "border-destructive/30"
                                      : ""
                                  )}>
                                    <CardContent className="p-5">
                                      <p className="font-semibold mb-4 text-sm">
                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold mr-2">{qi + 1}</span>
                                        {question.question}
                                      </p>
                                      {question.type === "SHORT_ANSWER" ? (
                                        <input
                                          className="w-full border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                                                  "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                  result
                                                    ? isCorrectOpt
                                                      ? "border-emerald-500 bg-emerald-500/10"
                                                      : isSelected && !questionResult?.isCorrect
                                                        ? "border-destructive bg-destructive/10"
                                                        : "opacity-60"
                                                    : isSelected
                                                      ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                                                      : "hover:bg-accent border-border/60"
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
                                <div className="flex justify-end">
                                  <Button
                                    className="rounded-xl"
                                    onClick={() => handleSubmitQuiz(quiz)}
                                    disabled={submitQuizMutation.isPending}
                                  >
                                    {submitQuizMutation.isPending ? "Submitting…" : "Submit Quiz"}
                                  </Button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium">No quizzes for this lesson</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "notes" && (
                  <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="rounded-2xl overflow-hidden">
                      <CardHeader className="border-b bg-muted/20 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/15 p-2">
                            <MessageSquare className="h-4 w-4 text-indigo-500" />
                          </div>
                          Notes
                        </CardTitle>
                        <CardDescription>Your personal notes for this lesson</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <textarea
                          className="w-full border rounded-xl p-3.5 min-h-[200px] text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
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
              <div className="flex items-center justify-between mt-6 rounded-2xl border bg-card/70 p-3 shadow-sm">
                <Button
                  variant="outline"
                  className="rounded-xl gap-1.5"
                  disabled={currentIdx === 0}
                  onClick={() => {
                    if (currentIdx > 0) { setActiveLessonId(allLessons[currentIdx - 1].id); setActiveTab("content"); }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {currentIdx + 1} / {allLessons.length}
                </span>
                <Button
                  className="rounded-xl gap-1.5"
                  disabled={currentIdx === allLessons.length - 1}
                  onClick={() => {
                    if (currentIdx < allLessons.length - 1) { setActiveLessonId(allLessons[currentIdx + 1].id); setActiveTab("content"); }
                  }}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}