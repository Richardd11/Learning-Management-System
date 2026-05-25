import type { FastifyInstance } from "fastify";
import { authenticate, requireRole } from "../middleware/auth.js";
import { generateCourse } from "./course-generator.js";
import { gradeSubmission } from "./ai-grader.js";
import { chatWithTutor } from "./ai-tutor.js";
import { generateWeeklyDigest } from "./progress-summarizer.js";
import { z } from "zod";

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  // AI Course Generator (streaming SSE)
  app.post("/generate-course", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { topic } = z.object({ topic: z.string().min(3) }).parse(request.body);

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      const courseId = await generateCourse(topic, request.user!.userId, (chunk) => {
        reply.raw.write(`data: ${JSON.stringify({ type: "text", data: chunk })}\n\n`);
      });

      reply.raw.write(`data: ${JSON.stringify({ type: "done", data: courseId })}\n\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      reply.raw.write(`data: ${JSON.stringify({ type: "error", data: message })}\n\n`);
    }

    reply.raw.end();
  });

  // AI Grader (streaming SSE)
  app.post("/grade", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { question, studentAnswer, rubric } = z.object({
      question: z.string(),
      studentAnswer: z.string(),
      rubric: z.string().optional(),
    }).parse(request.body);

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      const result = await gradeSubmission(question, studentAnswer, rubric, (chunk) => {
        reply.raw.write(`data: ${JSON.stringify({ type: "text", data: chunk })}\n\n`);
      });

      reply.raw.write(`data: ${JSON.stringify({ type: "done", data: result })}\n\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Grading failed";
      reply.raw.write(`data: ${JSON.stringify({ type: "error", data: message })}\n\n`);
    }

    reply.raw.end();
  });

  // AI Tutor Chat (streaming SSE)
  app.post("/tutor", { preHandler: [authenticate] }, async (request, reply) => {
    const { courseId, message, history } = z.object({
      courseId: z.string(),
      message: z.string(),
      history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([]),
    }).parse(request.body);

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      const response = await chatWithTutor(courseId, message, history, (chunk) => {
        reply.raw.write(`data: ${JSON.stringify({ type: "text", data: chunk })}\n\n`);
      });

      reply.raw.write(`data: ${JSON.stringify({ type: "done", data: response })}\n\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tutor error";
      reply.raw.write(`data: ${JSON.stringify({ type: "error", data: message })}\n\n`);
    }

    reply.raw.end();
  });

  // Weekly Digest (streaming SSE)
  app.post("/digest", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      const digest = await generateWeeklyDigest(request.user!.userId, (chunk) => {
        reply.raw.write(`data: ${JSON.stringify({ type: "text", data: chunk })}\n\n`);
      });

      reply.raw.write(`data: ${JSON.stringify({ type: "done", data: digest })}\n\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Digest generation failed";
      reply.raw.write(`data: ${JSON.stringify({ type: "error", data: message })}\n\n`);
    }

    reply.raw.end();
  });
}
