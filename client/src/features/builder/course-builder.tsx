import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus, Trash2, GripVertical, ChevronDown, Sparkles,
  Save, Eye, Upload, FileText, Youtube, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateCourse, useCreateModule, useCreateLesson } from "@/hooks/use-courses";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { courseSchema, type CourseForm } from "@/lib/schemas";
import type { AcademicLevel, ApiResponse, LessonContentType, Quiz } from "@/types";

interface BuilderModule {
  id: string;
  title: string;
  lessons: BuilderLesson[];
  quizzes: BuilderQuiz[];
}

interface BuilderLesson {
  id: string;
  title: string;
  content: string;
  contentType: LessonContentType;
  contentUrl: string;
  duration: string;
  youtubeUrl: string;
  youtubeTitle: string;
  youtubeChannel: string;
  youtubeThumbnail: string;
  youtubeVideoId: string;
  youtubeEmbedUrl: string;
}

interface BuilderQuiz {
  id: string;
  title: string;
  passingScore: string;
  timeLimit: string;
  questions: BuilderQuestion[];
}

interface BuilderQuestion {
  id: string;
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[];
  correctAnswer: string;
  points: string;
}

interface YouTubeMetadata {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  embedUrl: string;
}

function createLesson(): BuilderLesson {
  return {
    id: `temp-${Date.now()}-${Math.random()}`,
    title: "",
    content: "",
    contentType: "TEXT",
    contentUrl: "",
    duration: "",
    youtubeUrl: "",
    youtubeTitle: "",
    youtubeChannel: "",
    youtubeThumbnail: "",
    youtubeVideoId: "",
    youtubeEmbedUrl: "",
  };
}

function createQuestion(): BuilderQuestion {
  return {
    id: `temp-${Date.now()}-${Math.random()}`,
    questionText: "",
    questionType: "MULTIPLE_CHOICE",
    options: ["", "", "", ""],
    correctAnswer: "0",
    points: "1",
  };
}

export function CourseBuilder() {
  const navigate = useNavigate();
  const createCourseMutation = useCreateCourse();
  const createModuleMutation = useCreateModule();
  const createLessonMutation = useCreateLesson();
  const { data: academicLevels } = useQuery({
    queryKey: ["academicLevels", "builder"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/levels/levels"),
    select: (res) => res.data ?? [],
  });

  const [step, setStep] = useState<"details" | "content">("details");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [modules, setModules] = useState<BuilderModule[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { difficulty: "beginner", price: 0, academicLevelId: "none" },
  });

  const onSubmitDetails = async (data: CourseForm) => {
    try {
      const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      const res = await createCourseMutation.mutateAsync({
        title: data.title,
        description: data.description,
        shortDesc: data.shortDesc,
        subjectCode: data.subjectCode || undefined,
        academicLevelId: data.academicLevelId && data.academicLevelId !== "none" ? data.academicLevelId : undefined,
        price: data.price,
        difficulty: data.difficulty,
        tags,
      });
      if (res.data) {
        setCourseId(res.data.id);
        setStep("content");
        toast.success("Course created! Now add modules and lessons.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create course");
    }
  };

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, title: "", lessons: [], quizzes: [] },
    ]);
  };

  const updateModuleTitle = (idx: number, title: string) => {
    setModules((prev) => prev.map((m, i) => (i === idx ? { ...m, title } : m)));
  };

  const removeModule = (idx: number) => {
    setModules((prev) => prev.filter((_, i) => i !== idx));
  };

  const addLesson = (moduleIdx: number) => {
    setModules((prev) =>
      prev.map((m, i) =>
        i === moduleIdx
          ? { ...m, lessons: [...m.lessons, createLesson()] }
          : m
      )
    );
  };

  const updateLesson = (moduleIdx: number, lessonIdx: number, field: keyof BuilderLesson, value: string) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIdx
          ? {
              ...m,
              lessons: m.lessons.map((l, li) =>
                li === lessonIdx ? { ...l, [field]: value } : l
              ),
            }
          : m
      )
    );
  };

  const removeLesson = (moduleIdx: number, lessonIdx: number) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIdx
          ? { ...m, lessons: m.lessons.filter((_, li) => li !== lessonIdx) }
          : m
      )
    );
  };

  const fetchLessonYoutube = async (moduleIdx: number, lessonIdx: number) => {
    const lesson = modules[moduleIdx]?.lessons[lessonIdx];
    if (!lesson?.youtubeUrl) return;
    try {
      const res = await api.post<ApiResponse<YouTubeMetadata>>("/youtube/fetch-metadata", { url: lesson.youtubeUrl });
      const metadata = res.data;
      if (!metadata) return;
      setModules((prev) =>
        prev.map((m, mi) =>
          mi === moduleIdx
            ? {
                ...m,
                lessons: m.lessons.map((l, li) =>
                  li === lessonIdx
                    ? {
                        ...l,
                        contentType: "YOUTUBE",
                        contentUrl: l.youtubeUrl,
                        title: l.title || metadata.title,
                        youtubeVideoId: metadata.videoId,
                        youtubeTitle: metadata.title,
                        youtubeChannel: metadata.channel,
                        youtubeThumbnail: metadata.thumbnail,
                        youtubeEmbedUrl: metadata.embedUrl,
                      }
                    : l
                ),
              }
            : m
        )
      );
      toast.success("YouTube metadata added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch YouTube metadata");
    }
  };

  const addQuiz = (moduleIdx: number) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIdx
          ? {
              ...m,
              quizzes: [
                ...m.quizzes,
                { id: `temp-${Date.now()}`, title: "", passingScore: "70", timeLimit: "", questions: [createQuestion()] },
              ],
            }
          : m
      )
    );
  };

  const updateQuiz = (moduleIdx: number, quizIdx: number, field: keyof BuilderQuiz, value: string) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIdx
          ? { ...m, quizzes: m.quizzes.map((q, qi) => (qi === quizIdx ? { ...q, [field]: value } : q)) }
          : m
      )
    );
  };

  const removeQuiz = (moduleIdx: number, quizIdx: number) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIdx
          ? { ...m, quizzes: m.quizzes.filter((_, qi) => qi !== quizIdx) }
          : m
      )
    );
  };

  const addQuestion = (moduleIdx: number, quizIdx: number) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIdx
          ? {
              ...m,
              quizzes: m.quizzes.map((q, qi) =>
                qi === quizIdx ? { ...q, questions: [...q.questions, createQuestion()] } : q
              ),
            }
          : m
      )
    );
  };

  const updateQuestion = (moduleIdx: number, quizIdx: number, questionIdx: number, field: keyof BuilderQuestion, value: string) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIdx
          ? {
              ...m,
              quizzes: m.quizzes.map((q, qi) =>
                qi === quizIdx
                  ? {
                      ...q,
                      questions: q.questions.map((question, qii) =>
                        qii === questionIdx ? { ...question, [field]: value } : question
                      ),
                    }
                  : q
              ),
            }
          : m
      )
    );
  };

  const updateQuestionOption = (moduleIdx: number, quizIdx: number, questionIdx: number, optionIdx: number, value: string) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIdx
          ? {
              ...m,
              quizzes: m.quizzes.map((q, qi) =>
                qi === quizIdx
                  ? {
                      ...q,
                      questions: q.questions.map((question, qii) =>
                        qii === questionIdx
                          ? { ...question, options: question.options.map((opt, oi) => (oi === optionIdx ? value : opt)) }
                          : question
                      ),
                    }
                  : q
              ),
            }
          : m
      )
    );
  };

  const removeQuestion = (moduleIdx: number, quizIdx: number, questionIdx: number) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === moduleIdx
          ? {
              ...m,
              quizzes: m.quizzes.map((q, qi) =>
                qi === quizIdx ? { ...q, questions: q.questions.filter((_, qii) => qii !== questionIdx) } : q
              ),
            }
          : m
      )
    );
  };

  const saveContent = async () => {
    if (!courseId) return;
    try {
      for (let mi = 0; mi < modules.length; mi++) {
        const mod = modules[mi];
        if (!mod.title) continue;
        const modRes = await createModuleMutation.mutateAsync({
          courseId,
          title: mod.title,
          order: mi,
        });

        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          if (!lesson.title) continue;
          const lessonRes = await createLessonMutation.mutateAsync({
            moduleId: (modRes as { data?: { id: string } }).data?.id ?? "",
            title: lesson.title,
            content: lesson.content || undefined,
            contentType: lesson.contentType,
            contentUrl: lesson.contentUrl || lesson.youtubeUrl || undefined,
            duration: lesson.duration ? Number(lesson.duration) : undefined,
            order: li,
          });
          const savedLessonId = (lessonRes as { data?: { id: string } }).data?.id;
          if (savedLessonId && lesson.contentType === "YOUTUBE" && lesson.youtubeVideoId) {
            await api.post(`/youtube/lessons/${savedLessonId}/youtube`, {
              ytVideoId: lesson.youtubeVideoId,
              ytTitle: lesson.youtubeTitle || lesson.title,
              ytThumbnail: lesson.youtubeThumbnail || undefined,
              ytChannel: lesson.youtubeChannel || undefined,
              embedUrl: lesson.youtubeEmbedUrl || undefined,
            });
          }
        }

        for (let qi = 0; qi < mod.quizzes.length; qi++) {
          const quiz = mod.quizzes[qi];
          if (!quiz.title) continue;
          const quizRes = await api.post<ApiResponse<Quiz>>("/quizzes", {
            moduleId: (modRes as { data?: { id: string } }).data?.id ?? "",
            title: quiz.title,
            passingScore: Number(quiz.passingScore) || 70,
            timeLimit: quiz.timeLimit ? Number(quiz.timeLimit) : undefined,
            order: qi,
          });
          const quizId = quizRes.data?.id;
          if (!quizId) continue;
          for (let qii = 0; qii < quiz.questions.length; qii++) {
            const question = quiz.questions[qii];
            if (!question.questionText || !question.correctAnswer) continue;
            const options = question.questionType === "SHORT_ANSWER"
              ? undefined
              : question.options.map((opt) => opt.trim()).filter(Boolean);
            await api.post(`/quizzes/${quizId}/questions`, {
              questionText: question.questionText,
              questionType: question.questionType,
              options,
              correctAnswer: question.correctAnswer,
              points: Number(question.points) || 1,
              order: qii,
            });
          }
        }
      }
      toast.success("Course content saved!");
      navigate({ to: "/instructor" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save content");
    }
  };

  const handleAiGenerate = () => {
    if (!aiTopic.trim()) { toast.error("Enter a topic"); return; }
    setAiGenerating(true);
    toast.info("AI course generation requires ANTHROPIC_API_KEY. Configure it in your .env file.");
    setTimeout(() => setAiGenerating(false), 2000);
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Course Builder</h1>
        <p className="text-muted-foreground mb-8">Create a new course with modules and lessons</p>
      </motion.div>

      {/* AI Generate Modal */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Course Generator</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a topic and let AI generate a complete course outline with modules, lessons, and quizzes.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Introduction to Machine Learning"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              />
              <Button onClick={handleAiGenerate} disabled={aiGenerating}>
                <Sparkles className="h-4 w-4 mr-2" />
                {aiGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "details" && (
          <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Course title" {...register("title")} />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      className="min-h-[120px] resize-y"
                      placeholder="Describe your course..."
                      {...register("description")}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Short Description</Label>
                    <Input placeholder="One-line summary" {...register("shortDesc")} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <Input type="number" step="0.01" {...register("price")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm h-9 bg-background" {...register("difficulty")}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject Code</Label>
                      <Input placeholder="MATH101" {...register("subjectCode")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Academic Level</Label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm h-9 bg-background" {...register("academicLevelId")}>
                        <option value="none">No level</option>
                        {academicLevels?.map((level) => (
                          <option key={level.id} value={level.id}>{level.gradeLabel}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags (comma-separated)</Label>
                    <Input placeholder="react, typescript, web-dev" {...register("tags")} />
                  </div>

                  <Button type="submit" className="w-full" disabled={createCourseMutation.isPending}>
                    {createCourseMutation.isPending ? "Creating..." : "Create Course & Continue"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "content" && (
          <motion.div key="content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
              {modules.map((mod, mi) => (
                <motion.div key={mod.id} variants={item} layout>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <Input
                          value={mod.title}
                          onChange={(e) => updateModuleTitle(mi, e.target.value)}
                          placeholder={`Module ${mi + 1} title`}
                          className="font-semibold"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeModule(mi)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mod.lessons.map((lesson, li) => (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab" />
                            <Input
                              value={lesson.title}
                              onChange={(e) => updateLesson(mi, li, "title", e.target.value)}
                              placeholder={`Lesson ${li + 1} title`}
                              className="text-sm"
                            />
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeLesson(mi, li)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Content Type</Label>
                              <Select value={lesson.contentType} onValueChange={(value) => updateLesson(mi, li, "contentType", value)}>
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TEXT">Text</SelectItem>
                                  <SelectItem value="YOUTUBE">YouTube</SelectItem>
                                  <SelectItem value="VIDEO">Video</SelectItem>
                                  <SelectItem value="PDF">PDF</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Duration (minutes)</Label>
                              <Input
                                value={lesson.duration}
                                onChange={(e) => updateLesson(mi, li, "duration", e.target.value)}
                                placeholder="45"
                                type="number"
                                min="0"
                              />
                            </div>
                            {lesson.contentType !== "TEXT" && (
                              <div className="space-y-1">
                                <Label className="text-xs">Content URL</Label>
                                <Input
                                  value={lesson.contentUrl}
                                  onChange={(e) => updateLesson(mi, li, "contentUrl", e.target.value)}
                                  placeholder="https://..."
                                />
                              </div>
                            )}
                          </div>

                          {lesson.contentType === "YOUTUBE" && (
                            <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                              <Label className="text-xs">YouTube URL</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={lesson.youtubeUrl}
                                  onChange={(e) => updateLesson(mi, li, "youtubeUrl", e.target.value)}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                />
                                <Button type="button" variant="outline" onClick={() => fetchLessonYoutube(mi, li)}>
                                  <Youtube className="h-4 w-4 mr-1" /> Fetch
                                </Button>
                              </div>
                              {lesson.youtubeTitle && (
                                <div className="flex items-center gap-3 text-sm">
                                  {lesson.youtubeThumbnail && (
                                    <img src={lesson.youtubeThumbnail} alt="YouTube thumbnail" className="h-14 w-24 rounded object-cover" />
                                  )}
                                  <div>
                                    <p className="font-medium">{lesson.youtubeTitle}</p>
                                    <p className="text-muted-foreground">{lesson.youtubeChannel}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <Textarea
                            value={lesson.content}
                            onChange={(e) => updateLesson(mi, li, "content", e.target.value)}
                            placeholder="Lesson content or teacher notes"
                            className="min-h-[80px] resize-y"
                          />
                        </motion.div>
                      ))}
                      {mod.quizzes.map((quiz, qi) => (
                        <div key={quiz.id} className="border rounded-lg p-3 space-y-3 bg-primary/5">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            <Input
                              value={quiz.title}
                              onChange={(e) => updateQuiz(mi, qi, "title", e.target.value)}
                              placeholder={`Quiz ${qi + 1} title`}
                              className="font-medium"
                            />
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeQuiz(mi, qi)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Passing Score (%)</Label>
                              <Input value={quiz.passingScore} type="number" onChange={(e) => updateQuiz(mi, qi, "passingScore", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Time Limit (minutes)</Label>
                              <Input value={quiz.timeLimit} type="number" placeholder="No limit" onChange={(e) => updateQuiz(mi, qi, "timeLimit", e.target.value)} />
                            </div>
                          </div>
                          {quiz.questions.map((question, qii) => (
                            <div key={question.id} className="rounded-md border bg-background p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={question.questionText}
                                  onChange={(e) => updateQuestion(mi, qi, qii, "questionText", e.target.value)}
                                  placeholder={`Question ${qii + 1}`}
                                />
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeQuestion(mi, qi, qii)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Select value={question.questionType} onValueChange={(value) => updateQuestion(mi, qi, qii, "questionType", value)}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MULTIPLE_CHOICE">Multiple choice</SelectItem>
                                    <SelectItem value="TRUE_FALSE">True / false</SelectItem>
                                    <SelectItem value="SHORT_ANSWER">Short answer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={question.correctAnswer}
                                  onChange={(e) => updateQuestion(mi, qi, qii, "correctAnswer", e.target.value)}
                                  placeholder={question.questionType === "MULTIPLE_CHOICE" ? "Correct option index (0-3)" : "Correct answer"}
                                />
                                <Input
                                  value={question.points}
                                  onChange={(e) => updateQuestion(mi, qi, qii, "points", e.target.value)}
                                  type="number"
                                  min="0"
                                  placeholder="Points"
                                />
                              </div>
                              {question.questionType !== "SHORT_ANSWER" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {(question.questionType === "TRUE_FALSE" ? ["True", "False"] : question.options).map((option, optionIdx) => (
                                    <Input
                                      key={optionIdx}
                                      value={option}
                                      disabled={question.questionType === "TRUE_FALSE"}
                                      onChange={(e) => updateQuestionOption(mi, qi, qii, optionIdx, e.target.value)}
                                      placeholder={`Option ${optionIdx + 1}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => addQuestion(mi, qi)}>
                            <Plus className="h-3 w-3 mr-1" /> Add Question
                          </Button>
                        </div>
                      ))}

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => addLesson(mi)}>
                          <Plus className="h-3 w-3 mr-1" /> Add Lesson
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addQuiz(mi)}>
                          <Plus className="h-3 w-3 mr-1" /> Add Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <Button variant="outline" className="w-full" onClick={addModule}>
                <Plus className="h-4 w-4 mr-2" /> Add Module
              </Button>

              <div className="flex gap-3 pt-4">
                <Button onClick={saveContent} disabled={modules.length === 0} className="flex-1">
                  <Save className="h-4 w-4 mr-2" /> Save Course
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
