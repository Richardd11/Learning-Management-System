import type { FastifyInstance } from "fastify";
import { authenticate, requireRole } from "../../middleware/auth.js";
import * as schema from "./courses.schema.js";
import * as service from "./courses.service.js";

export async function courseRoutes(app: FastifyInstance): Promise<void> {
  // Public
  app.get("/", async (request, reply) => {
    const filters = schema.courseFiltersSchema.parse(request.query);
    const tagArray = filters.tags ? filters.tags.split(",") : undefined;
    const result = await service.listCourses({ ...filters, tags: tagArray });
    reply.send({ success: true, data: result });
  });

  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const course = await service.getCourseBySlug(slug);
    if (!course) {
      reply.code(404).send({ success: false, error: "Course not found" });
      return;
    }
    reply.send({ success: true, data: course });
  });

  app.get("/id/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const course = await service.getCourseById(id);
    if (!course) {
      reply.code(404).send({ success: false, error: "Course not found" });
      return;
    }
    reply.send({ success: true, data: course });
  });

  // Instructor
  app.post("/", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const input = schema.createCourseSchema.parse(request.body);
    const course = await service.createCourse(request.user!.userId, input);
    reply.code(201).send({ success: true, data: course });
  });

  app.put("/:id", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = schema.updateCourseSchema.parse(request.body);
    const course = await service.updateCourse(id, input);
    reply.send({ success: true, data: course });
  });

  app.delete("/:id", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.deleteCourse(id);
    reply.send({ success: true, message: "Course deleted" });
  });

  app.post("/:id/publish", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const course = await service.publishCourse(id);
    reply.send({ success: true, data: course });
  });

  app.get("/instructor/my-courses", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const courses = await service.getInstructorCourses(request.user!.userId);
    reply.send({ success: true, data: courses });
  });

  // Modules
  app.post("/:courseId/modules", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const input = schema.createModuleSchema.parse(request.body);
    const mod = await service.createModule(courseId, input);
    reply.code(201).send({ success: true, data: mod });
  });

  app.put("/modules/:moduleId", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { moduleId } = request.params as { moduleId: string };
    const input = schema.createModuleSchema.partial().parse(request.body);
    const mod = await service.updateModule(moduleId, input);
    reply.send({ success: true, data: mod });
  });

  app.delete("/modules/:moduleId", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { moduleId } = request.params as { moduleId: string };
    await service.deleteModule(moduleId);
    reply.send({ success: true, message: "Module deleted" });
  });

  app.post("/modules/reorder", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { items } = schema.reorderSchema.parse(request.body);
    await service.reorderModules(items);
    reply.send({ success: true });
  });

  // Lessons
  app.post("/modules/:moduleId/lessons", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { moduleId } = request.params as { moduleId: string };
    const input = schema.createLessonSchema.parse(request.body);
    const lesson = await service.createLesson(moduleId, input);
    reply.code(201).send({ success: true, data: lesson });
  });

  app.put("/lessons/:lessonId", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const input = schema.createLessonSchema.partial().parse(request.body);
    const lesson = await service.updateLesson(lessonId, input);
    reply.send({ success: true, data: lesson });
  });

  app.delete("/lessons/:lessonId", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    await service.deleteLesson(lessonId);
    reply.send({ success: true, message: "Lesson deleted" });
  });

  app.post("/lessons/reorder", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { items } = schema.reorderSchema.parse(request.body);
    await service.reorderLessons(items);
    reply.send({ success: true });
  });

  // Quizzes
  app.post("/lessons/:lessonId/quizzes", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const input = schema.createQuizSchema.parse(request.body);
    const quiz = await service.createQuiz(lessonId, input);
    reply.code(201).send({ success: true, data: quiz });
  });

  app.delete("/quizzes/:quizId", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    await service.deleteQuiz(quizId);
    reply.send({ success: true, message: "Quiz deleted" });
  });

  // Flashcards
  app.post("/lessons/:lessonId/flashcards", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const input = schema.createFlashcardSchema.parse(request.body);
    const card = await service.createFlashcard(lessonId, input);
    reply.code(201).send({ success: true, data: card });
  });

  app.delete("/flashcards/:id", { preHandler: [requireRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.deleteFlashcard(id);
    reply.send({ success: true, message: "Flashcard deleted" });
  });

  // Reviews (authenticated students)
  app.post("/:courseId/reviews", { preHandler: [authenticate] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const input = schema.createReviewSchema.parse(request.body);
    const review = await service.createReview(request.user!.userId, courseId, input.rating, input.comment);
    reply.code(201).send({ success: true, data: review });
  });
}
