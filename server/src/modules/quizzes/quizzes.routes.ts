import type { FastifyInstance } from "fastify";
import { authenticate, requireRole } from "../../middleware/auth.js";
import * as service from "./quizzes.service.js";
import { z } from "zod";

const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  moduleId: z.string(),
  timeLimit: z.number().int().min(1).optional(),
  passingScore: z.number().min(0).max(100).default(50),
  order: z.number().int().default(0),
});

const updateQuizSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  timeLimit: z.number().int().min(1).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  order: z.number().int().optional(),
});

const createQuestionSchema = z.object({
  questionText: z.string().min(1),
  questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  points: z.number().min(0).default(1),
  order: z.number().int().default(0),
});

const updateQuestionSchema = z.object({
  questionText: z.string().min(1).optional(),
  questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]).optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1).optional(),
  points: z.number().min(0).optional(),
  order: z.number().int().optional(),
});

const submitAttemptSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })),
});

export async function quizRoutes(app: FastifyInstance): Promise<void> {
  // ── Quiz CRUD (Teacher/Admin) ───────────────────────────────
  app.post("/", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const input = createQuizSchema.parse(request.body);
    const quiz = await service.createQuiz(input);
    reply.code(201).send({ success: true, data: quiz });
  });

  app.get("/:quizId", { preHandler: [authenticate] }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    const quiz = await service.getQuiz(quizId);
    if (!quiz) {
      reply.code(404).send({ success: false, error: "Quiz not found" });
      return;
    }
    // For students, don't include correct answers
    if (request.user?.role === "STUDENT") {
      const { questions, ...rest } = quiz;
      const safeQuestions = questions.map(({ correctAnswer, ...q }) => ({
        ...q,
        options: q.options ? JSON.parse(q.options as string) : null,
      }));
      reply.send({ success: true, data: { ...rest, questions: safeQuestions } });
    } else {
      const parsedQuestions = quiz.questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options as string) : null,
      }));
      reply.send({ success: true, data: { ...quiz, questions: parsedQuestions } });
    }
  });

  app.put("/:quizId", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    const input = updateQuizSchema.parse(request.body);
    const quiz = await service.updateQuiz(quizId, input);
    reply.send({ success: true, data: quiz });
  });

  app.delete("/:quizId", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    await service.deleteQuiz(quizId);
    reply.send({ success: true, message: "Quiz deleted" });
  });

  app.get("/module/:moduleId", { preHandler: [authenticate] }, async (request, reply) => {
    const { moduleId } = request.params as { moduleId: string };
    const quizzes = await service.getModuleQuizzes(moduleId);
    reply.send({ success: true, data: quizzes });
  });

  // ── Quiz Questions (Teacher/Admin) ──────────────────────────
  app.post("/:quizId/questions", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    const input = createQuestionSchema.parse(request.body);
    const question = await service.createQuestion({ ...input, quizId });
    reply.code(201).send({ success: true, data: question });
  });

  app.put("/questions/:questionId", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    const input = updateQuestionSchema.parse(request.body);
    const question = await service.updateQuestion(questionId, input);
    reply.send({ success: true, data: question });
  });

  app.delete("/questions/:questionId", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    await service.deleteQuestion(questionId);
    reply.send({ success: true, message: "Question deleted" });
  });

  // ── Quiz Attempt (Student) ──────────────────────────────────
  app.post("/:quizId/attempt", { preHandler: [requireRole("STUDENT")] }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    const { answers } = submitAttemptSchema.parse(request.body);
    try {
      const result = await service.submitQuizAttempt(request.user!.userId, quizId, answers);
      reply.send({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Quiz attempt failed";
      reply.code(400).send({ success: false, error: message });
    }
  });

  app.get("/:quizId/my-result", { preHandler: [requireRole("STUDENT")] }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    const attempt = await service.getQuizAttempt(request.user!.userId, quizId);
    if (!attempt) {
      reply.code(404).send({ success: false, error: "No attempt found" });
      return;
    }
    reply.send({ success: true, data: attempt });
  });

  // ── Quiz History (Student) ──────────────────────────────────
  app.get("/history/my", { preHandler: [requireRole("STUDENT")] }, async (request, reply) => {
    const history = await service.getStudentQuizHistory(request.user!.userId);
    reply.send({ success: true, data: history });
  });

  // ── Quiz Results (Teacher/Admin) ────────────────────────────
  app.get("/:quizId/results", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    const results = await service.getQuizResults(quizId);
    reply.send({ success: true, data: results });
  });
}
