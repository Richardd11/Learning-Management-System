import type { FastifyInstance } from "fastify";
import { authenticate, requireRole } from "../../middleware/auth.js";
import * as service from "./enrollments.service.js";
import { z } from "zod";

const bulkEnrollSchema = z.object({
  sectionId: z.string().uuid(),
});

export async function enrollmentRoutes(app: FastifyInstance): Promise<void> {
  // Student self-enroll (with optional sectionId)
  app.post("/:courseId/enroll", { preHandler: [authenticate] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    try {
      const enrollment = await service.enrollInCourse(request.user!.userId, courseId);
      reply.code(201).send({ success: true, data: enrollment });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Enrollment failed";
      reply.code(400).send({ success: false, error: message });
    }
  });

  // Admin/Teacher: Bulk enroll a section to a course
  app.post("/:courseId/bulk-enroll", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const { sectionId } = bulkEnrollSchema.parse(request.body);
    try {
      const result = await service.bulkEnrollSection(sectionId, courseId);
      reply.send({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bulk enrollment failed";
      reply.code(400).send({ success: false, error: message });
    }
  });

  app.get("/my-enrollments", { preHandler: [authenticate] }, async (request, reply) => {
    const enrollments = await service.getUserEnrollments(request.user!.userId);
    reply.send({ success: true, data: enrollments });
  });

  app.get("/:courseId/enrollment", { preHandler: [authenticate] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const enrollment = await service.getEnrollment(request.user!.userId, courseId);
    reply.send({ success: true, data: enrollment });
  });

  app.post("/lessons/:lessonId/complete", { preHandler: [authenticate] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const progress = await service.markLessonComplete(request.user!.userId, lessonId);
    reply.send({ success: true, data: progress });
  });

  app.get("/:courseId/progress", { preHandler: [authenticate] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const progress = await service.getLessonProgress(request.user!.userId, courseId);
    reply.send({ success: true, data: progress });
  });

  app.get("/lessons/:lessonId/notes", { preHandler: [authenticate] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const notes = await service.getUserNotes(request.user!.userId, lessonId);
    reply.send({ success: true, data: notes });
  });

  app.post("/lessons/:lessonId/notes", { preHandler: [authenticate] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const { content, timestamp } = z.object({ content: z.string(), timestamp: z.number().optional() }).parse(request.body);
    const note = await service.createNote(request.user!.userId, lessonId, content, timestamp);
    reply.code(201).send({ success: true, data: note });
  });

  app.delete("/notes/:noteId", { preHandler: [authenticate] }, async (request, reply) => {
    const { noteId } = request.params as { noteId: string };
    await service.deleteNote(noteId);
    reply.send({ success: true, message: "Note deleted" });
  });
}