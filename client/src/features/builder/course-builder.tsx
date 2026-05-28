import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus, Trash2, GripVertical, Sparkles,
  Save, Upload, FileText, Youtube, AlignLeft, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateCourse, useCreateModule, useCreateLesson } from "@/hooks/use-courses";
import { useNavigate } from "@tanstack/react-router";
import { courseSchema, type CourseForm } from "@/lib/schemas";

interface BuilderModule {
  id: string;
  title: string;
  lessons: BuilderLesson[];
}

type LessonType = "TEXT" | "VIDEO" | "PDF" | "YOUTUBE";

interface BuilderLesson {
  id: string;
  title: string;
  content: string;
  contentType: LessonType;
  contentUrl: string;
}

export function CourseBuilder() {
  const navigate = useNavigate();
  const createCourseMutation = useCreateCourse();
  const createModuleMutation = useCreateModule();
  const createLessonMutation = useCreateLesson();

  const [step, setStep] = useState<"details" | "content">("details");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [modules, setModules] = useState<BuilderModule[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { difficulty: "beginner", price: 0 },
  });

  const onSubmitDetails = async (data: CourseForm) => {
    try {
      const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      const res = await createCourseMutation.mutateAsync({
        title: data.title,
        description: data.description,
        shortDesc: data.shortDesc,
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
      { id: `temp-${Date.now()}`, title: "", lessons: [] },
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
          ? { ...m, lessons: [...m.lessons, { id: `temp-${Date.now()}`, title: "", content: "", contentType: "TEXT" as LessonType, contentUrl: "" }] }
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
          await createLessonMutation.mutateAsync({
            moduleId: (modRes as { data?: { id: string } }).data?.id ?? "",
            title: lesson.title,
            content: lesson.contentType === "TEXT" ? lesson.content : undefined,
            contentType: lesson.contentType,
            contentUrl: lesson.contentUrl || undefined,
            order: li,
          } as Parameters<typeof createLessonMutation.mutateAsync>[0]);
        }
      }
      toast.success("Course content saved!");
      navigate({ to: "/instructor" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save content");
    }
  };

  const handleAiGenerate = async () => {
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
              Enter a topic and let AI generate a complete course outline with modules, lessons, quizzes, and flashcards.
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
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Course title" {...register("title")} />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="w-full min-h-[120px] border rounded-md px-3 py-2 text-sm resize-y"
                      placeholder="Describe your course..."
                      {...register("description")}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Short Description</label>
                    <Input placeholder="One-line summary" {...register("shortDesc")} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price ($)</label>
                      <Input type="number" step="0.01" {...register("price")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulty</label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm h-9" {...register("difficulty")}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
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
                            <select
                              className="border rounded-md px-2 py-1 text-xs h-8"
                              value={lesson.contentType}
                              onChange={(e) => updateLesson(mi, li, "contentType", e.target.value)}
                            >
                              <option value="TEXT">Text</option>
                              <option value="VIDEO">Video</option>
                              <option value="YOUTUBE">YouTube</option>
                              <option value="PDF">PDF</option>
                            </select>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeLesson(mi, li)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          {lesson.contentType === "TEXT" && (
                            <textarea
                              value={lesson.content}
                              onChange={(e) => updateLesson(mi, li, "content", e.target.value)}
                              placeholder="Lesson content (Markdown supported)"
                              className="w-full min-h-[80px] border rounded-md px-3 py-2 text-sm resize-y"
                            />
                          )}
                          {(lesson.contentType === "VIDEO" || lesson.contentType === "PDF") && (
                            <Input
                              value={lesson.contentUrl}
                              onChange={(e) => updateLesson(mi, li, "contentUrl", e.target.value)}
                              placeholder={lesson.contentType === "VIDEO" ? "Video URL (mp4, etc.)" : "PDF URL"}
                              className="text-sm"
                            />
                          )}
                          {lesson.contentType === "YOUTUBE" && (
                            <Input
                              value={lesson.contentUrl}
                              onChange={(e) => updateLesson(mi, li, "contentUrl", e.target.value)}
                              placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)"
                              className="text-sm"
                            />
                          )}
                        </motion.div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addLesson(mi)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Lesson
                      </Button>
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
