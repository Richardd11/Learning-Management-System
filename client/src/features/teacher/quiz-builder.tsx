import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, CheckCircle2, HelpCircle, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useInstructorCourses } from "@/hooks/use-courses";
import type { ApiResponse, Quiz, QuizQuestion } from "@/types";

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";

interface DraftQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
}

const emptyQuestion = (): DraftQuestion => ({
  id: `q-${Date.now()}`,
  questionText: "",
  questionType: "MULTIPLE_CHOICE",
  options: ["", "", "", ""],
  correctAnswer: "0",
  points: 1,
});

export function QuizBuilder() {
  const queryClient = useQueryClient();
  const { data: courses } = useInstructorCourses();

  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);

  const allModules = courses?.flatMap((c) =>
    (c.modules ?? []).map((m) => ({ ...m, courseTitle: c.title }))
  ) ?? [];

  const { data: existingQuizzes } = useQuery({
    queryKey: ["moduleQuizzes", selectedModuleId],
    queryFn: () => api.get<ApiResponse<Quiz[]>>(`/quizzes/module/${selectedModuleId}`),
    select: (res) => res.data,
    enabled: !!selectedModuleId,
  });

  const createQuizMutation = useMutation({
    mutationFn: (data: { title: string; moduleId: string; passingScore: number; timeLimit?: number }) =>
      api.post<ApiResponse<Quiz>>("/quizzes", data),
    onSuccess: (res) => {
      setSavedQuizId(res.data?.id ?? null);
      queryClient.invalidateQueries({ queryKey: ["moduleQuizzes", selectedModuleId] });
      toast.success("Quiz created! Now saving questions...");
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: ({ quizId, q }: { quizId: string; q: DraftQuestion }) =>
      api.post(`/quizzes/${quizId}/questions`, {
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.questionType !== "SHORT_ANSWER" ? q.options.filter(Boolean) : undefined,
        correctAnswer: q.correctAnswer,
        points: q.points,
        order: 0,
      }),
  });

  const handleSaveQuiz = async () => {
    if (!selectedModuleId) { toast.error("Select a module first"); return; }
    if (!quizTitle.trim()) { toast.error("Enter a quiz title"); return; }
    if (questions.some((q) => !q.questionText.trim())) { toast.error("All questions need text"); return; }

    try {
      const quizRes = await createQuizMutation.mutateAsync({
        title: quizTitle,
        moduleId: selectedModuleId,
        passingScore,
        timeLimit: timeLimit !== "" ? Number(timeLimit) : undefined,
      });
      const quizId = quizRes.data?.id;
      if (!quizId) return;

      for (const q of questions) {
        await addQuestionMutation.mutateAsync({ quizId, q });
      }
      toast.success(`Quiz "${quizTitle}" saved with ${questions.length} questions!`);
      setQuizTitle("");
      setQuestions([emptyQuestion()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save quiz");
    }
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  const updateQuestion = (id: string, patch: Partial<DraftQuestion>) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const updateOption = (qId: string, idx: number, value: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) } : q
      )
    );

  const typeIcon = (type: QuestionType) => {
    if (type === "MULTIPLE_CHOICE") return <CheckCircle2 className="h-4 w-4" />;
    if (type === "TRUE_FALSE") return <HelpCircle className="h-4 w-4" />;
    return <AlignLeft className="h-4 w-4" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-1">Quiz Builder</h1>
        <p className="text-muted-foreground">Create quizzes and attach them to your course modules</p>
      </motion.div>

      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
          <CardDescription>Configure the quiz metadata before adding questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Module</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm h-9"
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
            >
              <option value="">Select a module…</option>
              {allModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.courseTitle} — {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Quiz Title</label>
            <Input
              placeholder="e.g. Chapter 1 Assessment"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Passing Score (%)</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Time Limit (min, optional)</label>
              <Input
                type="number"
                min={1}
                placeholder="No limit"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing quizzes */}
      {existingQuizzes && existingQuizzes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Existing Quizzes in Module</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {existingQuizzes.map((q) => (
              <Badge key={q.id} variant="secondary">
                {q.title} · {q.questions.length} Qs · Pass: {q.passingScore}%
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-1" /> Add Question
          </Button>
        </div>

        <AnimatePresence>
          {questions.map((q, qi) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              layout
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">Q{qi + 1}</span>
                    <div className="flex-1">
                      <Input
                        placeholder="Question text…"
                        value={q.questionText}
                        onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                      />
                    </div>
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={q.questionType}
                      onChange={(e) => {
                        const type = e.target.value as QuestionType;
                        const opts = type === "TRUE_FALSE" ? ["True", "False"] : ["", "", "", ""];
                        const correct = type === "TRUE_FALSE" ? "0" : q.correctAnswer;
                        updateQuestion(q.id, { questionType: type, options: opts, correctAnswer: correct });
                      }}
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TRUE_FALSE">True / False</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-muted-foreground">Pts</label>
                      <Input
                        type="number"
                        min={1}
                        className="w-16 text-sm"
                        value={q.points}
                        onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={questions.length === 1}
                      onClick={() => removeQuestion(q.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-2">
                  {q.questionType === "SHORT_ANSWER" ? (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Correct Answer (exact match)</label>
                      <Input
                        placeholder="Expected answer…"
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Options — select the correct one
                      </label>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === String(oi)}
                            onChange={() => updateQuestion(q.id, { correctAnswer: String(oi) })}
                            className="accent-primary"
                          />
                          <Input
                            placeholder={`Option ${oi + 1}`}
                            value={opt}
                            disabled={q.questionType === "TRUE_FALSE"}
                            onChange={(e) => updateOption(q.id, oi, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          className="flex-1"
          onClick={handleSaveQuiz}
          disabled={createQuizMutation.isPending || addQuestionMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {createQuizMutation.isPending || addQuestionMutation.isPending ? "Saving…" : "Save Quiz"}
        </Button>
      </div>
    </div>
  );
}
