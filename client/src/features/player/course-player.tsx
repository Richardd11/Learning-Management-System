import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  PlayCircle, FileText, CheckCircle, Circle, ChevronRight, MessageSquare,
  HelpCircle, Youtube, Video, File, Type, Trophy, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCourse } from "@/hooks/use-courses";
import {
  useCourseProgress, useCompleteLesson, useCreateLessonNote,
  useLessonNotes, useSubmitQuizAttempt,
} from "@/hooks/use-enrollment";
import { cn, formatDate } from "@/lib/utils";
import type { Lesson, Quiz, QuizAttemptResult } from "@/types";

function getYouTubeEmbedUrl(lesson: Lesson): string | null {
  if (lesson.youtubeTutorial?.embedUrl) return lesson.youtubeTutorial.embedUrl;
  const source = lesson.contentUrl;
  if (!source) return null;
  const match = source.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : source;
}

function ContentTypeIcon({ lesson }: { lesson: Lesson }) {
  switch (lesson.contentType) {
    case "YOUTUBE": return <Youtube className="h-4 w-4 text-red-500" />;
    case "VIDEO": return <Video className="h-4 w-4 text-blue-500" />;
    case "PDF": return <File className="h-4 w-4 text-orange-500" />;
    case "TEXT":
    default:
      return <Type className="h-4 w-4 text-primary" />;
  }
}

function LessonContent({ lesson }: { lesson: Lesson }) {
  if (lesson.contentType === "YOUTUBE") {
    const embedUrl = getYouTubeEmbedUrl(lesson);
    return (
      <div className="space-y-4">
        {embedUrl ? (
          <div className="aspect-video overflow-hidden rounded-lg bg-black">
            <iframe
              src={embedUrl}
              title={lesson.youtubeTutorial?.ytTitle ?? lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <Card><CardContent className="p-6 text-muted-foreground">No YouTube URL configured for this lesson.</CardContent></Card>
        )}
        {lesson.youtubeTutorial?.teacherNotes && (
          <Card>
            <CardHeader><CardTitle className="text-base">Teacher Notes</CardTitle></CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm">{lesson.youtubeTutorial.teacherNotes}</CardContent>
          </Card>
        )}
        {lesson.content && <Card><CardContent className="p-6 whitespace-pre-wrap">{lesson.content}</CardContent></Card>}
      </div>
    );
  }

  if (lesson.contentType === "VIDEO") {
    return (
      <div className="space-y-4">
        {lesson.contentUrl ? (
          <video src={lesson.contentUrl} controls className="w-full rounded-lg bg-black" />
        ) : (
          <Card><CardContent className="p-6 text-muted-foreground">No video URL configured for this lesson.</CardContent></Card>
        )}
        {lesson.content && <Card><CardContent className="p-6 whitespace-pre-wrap">{lesson.content}</CardContent></Card>}
      </div>
    );
  }

  if (lesson.contentType === "PDF") {
    return (
      <div className="space-y-4">
        {lesson.contentUrl ? (
          <div className="overflow-hidden rounded-lg border bg-background">
            <iframe src={lesson.contentUrl} title={lesson.title} className="h-[720px] w-full" />
          </div>
        ) : (
          <Card><CardContent className="p-6 text-muted-foreground">No PDF URL configured for this lesson.</CardContent></Card>
        )}
        {lesson.content && <Card><CardContent className="p-6 whitespace-pre-wrap">{lesson.content}</CardContent></Card>}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
        {lesson.content ?? "No content available for this lesson."}
      </CardContent>
    </Card>
  );
}

function LessonNotes({ lessonId }: { lessonId: string }) {
  const [content, setContent] = useState("");
  const { data: notes, isLoading } = useLessonNotes(lessonId);
  const createNoteMutation = useCreateLessonNote();

  const saveNote = async () => {
    if (!content.trim()) return;
    await createNoteMutation.mutateAsync({ lessonId, content });
    setContent("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Note</CardTitle>
          <CardDescription>Keep private notes for this lesson.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note..." />
          <Button onClick={saveNote} disabled={!content.trim() || createNoteMutation.isPending}>
            {createNoteMutation.isPending ? "Saving..." : "Save Note"}
          </Button>
        </CardContent>
      </Card>
      {isLoading ? <Skeleton className="h-24" /> : notes?.length ? notes.map((note) => (
        <Card key={note.id}>
          <CardContent className="p-4">
            <p className="whitespace-pre-wrap text-sm">{note.content}</p>
            <p className="mt-2 text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
          </CardContent>
        </Card>
      )) : <p className="text-sm text-muted-foreground">No notes yet.</p>}
    </div>
  );
}

function QuizRunner({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(quiz.attempts?.[0] ? {
    attempt: quiz.attempts[0],
    results: {
      score: quiz.attempts[0].score,
      totalPoints: quiz.attempts[0].totalPoints,
      earnedPoints: quiz.attempts[0].earnedPoints,
      passed: quiz.attempts[0].passed,
      answers: quiz.attempts[0].answers,
    },
  } : null);
  const submitQuizMutation = useSubmitQuizAttempt();
  const questions = quiz.questions ?? [];

  const submitQuiz = async () => {
    const response = await submitQuizMutation.mutateAsync({
      quizId: quiz.id,
      answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
    });
    if (response.data) setResult(response.data);
  };

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result.results.passed ? <Trophy className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
            {quiz.title}
          </CardTitle>
          <CardDescription>
            Score: {Math.round(result.results.score)}% · {result.results.earnedPoints}/{result.results.totalPoints} points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant={result.results.passed ? "default" : "destructive"}>{result.results.passed ? "Passed" : "Needs Review"}</Badge>
          {questions.map((question) => {
            const graded = result.results.answers.find((answer) => answer.questionId === question.id);
            return (
              <div key={question.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-start gap-2">
                  {graded?.isCorrect ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive mt-0.5" />}
                  <div>
                    <p className="font-medium">{question.questionText}</p>
                    <p className="text-muted-foreground">Your answer: {graded?.answer || "No answer"}</p>
                    {!graded?.isCorrect && <p className="text-muted-foreground">Correct answer: {graded?.correctAnswer}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>
          Passing score: {quiz.passingScore}% {quiz.timeLimit ? `· ${quiz.timeLimit} minute limit` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Badge variant="outline">{index + 1}</Badge>
              <div>
                <p className="font-medium">{question.questionText}</p>
                <p className="text-xs text-muted-foreground">{question.points} point{question.points === 1 ? "" : "s"}</p>
              </div>
            </div>
            {question.questionType === "MULTIPLE_CHOICE" || question.questionType === "TRUE_FALSE" ? (
              <div className="space-y-2">
                {(question.options ?? []).map((option, optionIndex) => (
                  <label key={`${question.id}-${optionIndex}`} className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent">
                    <input
                      type="radio"
                      name={question.id}
                      value={String(optionIndex)}
                      checked={answers[question.id] === String(optionIndex)}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <Textarea value={answers[question.id] ?? ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))} placeholder="Type your answer" />
            )}
          </div>
        ))}
        <Button onClick={submitQuiz} disabled={questions.length === 0 || submitQuizMutation.isPending}>
          {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function CoursePlayer() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const { data: course, isLoading } = useCourse(slug);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "quiz" | "notes">("content");
  const markCompleteMutation = useCompleteLesson();
  const { data: progress } = useCourseProgress(course?.id ?? "");

  const allLessons = useMemo(() => course?.modules?.flatMap((mod) => mod.lessons) ?? [], [course]);
  const activeLesson = allLessons.find((lesson) => lesson.id === activeLessonId) ?? allLessons[0];
  const activeModule = course?.modules?.find((mod) => mod.lessons.some((lesson) => lesson.id === activeLesson?.id));
  const activeQuizzes = activeModule?.quizzes ?? [];
  const completedLessons = progress?.completed ?? [];
  const progressPercentage = progress?.percentage ?? 0;

  const selectLesson = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
    setActiveTab("content");
  };

  const markComplete = async () => {
    if (!activeLesson) return;
    await markCompleteMutation.mutateAsync(activeLesson.id);
  };

  if (isLoading) return <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6"><Skeleton className="h-[600px]" /><Skeleton className="h-[600px]" /></div>;
  if (!course || !activeLesson) return <div className="text-center py-16">Course not found</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 max-w-7xl mx-auto">
      <aside>
        <Card className="lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-hidden flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-sm"><span>Progress</span><span>{progressPercentage}%</span></div>
              <Progress value={progressPercentage} />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            {course.modules?.map((mod, mi) => (
              <div key={mod.id} className="border-b last:border-0">
                <div className="px-4 py-3 bg-muted/50 font-medium text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">{mi + 1}.</span> {mod.title}
                </div>
                <div className="py-1">
                  {mod.lessons.map((lesson) => {
                    const isActive = activeLesson.id === lesson.id;
                    const isCompleted = completedLessons.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent transition-colors",
                          isActive && "bg-primary/10 text-primary"
                        )}
                      >
                        {isCompleted ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <ContentTypeIcon lesson={lesson} />
                        <span className="flex-1 line-clamp-2">{lesson.title}</span>
                        {isActive && <ChevronRight className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                  {mod.quizzes?.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => { setActiveLessonId(mod.lessons[0]?.id ?? activeLesson.id); setActiveTab("quiz"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      <span className="flex-1 line-clamp-2">{quiz.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>

      <main className="space-y-6">
        <motion.div key={activeLesson.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ContentTypeIcon lesson={activeLesson} />
                <Badge variant="outline">{activeLesson.contentType.toLowerCase()}</Badge>
                {activeLesson.duration && <Badge variant="secondary">{activeLesson.duration}m</Badge>}
              </div>
              <h1 className="text-2xl font-bold">{activeLesson.title}</h1>
              {activeModule && <p className="text-muted-foreground">{activeModule.title}</p>}
            </div>
            <Button onClick={markComplete} disabled={completedLessons.includes(activeLesson.id) || markCompleteMutation.isPending}>
              {completedLessons.includes(activeLesson.id) ? (
                <><CheckCircle className="h-4 w-4 mr-2" /> Completed</>
              ) : (
                "Mark Complete"
              )}
            </Button>
          </div>

          <div className="flex gap-2 mb-6 border-b">
            {[
              { id: "content" as const, label: "Content", icon: FileText },
              { id: "quiz" as const, label: "Quizzes", icon: HelpCircle },
              { id: "notes" as const, label: "Notes", icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "content" && <LessonContent lesson={activeLesson} />}
          {activeTab === "quiz" && (
            <div className="space-y-4">
              {activeQuizzes.length > 0 ? activeQuizzes.map((quiz) => <QuizRunner key={quiz.id} quiz={quiz} />) : (
                <Card><CardContent className="p-8 text-center text-muted-foreground">No quizzes for this module yet.</CardContent></Card>
              )}
            </div>
          )}
          {activeTab === "notes" && <LessonNotes lessonId={activeLesson.id} />}
        </motion.div>
      </main>
    </div>
  );
}
