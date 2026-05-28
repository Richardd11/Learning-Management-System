import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authenticate, requireRole } from "../../middleware/auth.js";
import * as schema from "./courses.schema.js";
import * as service from "./courses.service.js";

async function ensureCourseManager(request: FastifyRequest, reply: FastifyReply, courseId: string): Promise<boolean> {
  if (request.user?.role === "ADMIN") return true;

  const course = await service.getCourseOwner(courseId);
  if (course?.instructorId === request.user?.userId) return true;

  reply.code(403).send({ success: false, error: "You can only manage content for courses assigned to you" });
  return false;
}

async function ensureModuleManager(request: FastifyRequest, reply: FastifyReply, moduleId: string): Promise<boolean> {
  if (request.user?.role === "ADMIN") return true;

  const mod = await service.getModuleOwner(moduleId);
  if (mod?.course.instructorId === request.user?.userId) return true;

  reply.code(403).send({ success: false, error: "You can only manage content for courses assigned to you" });
  return false;
}

async function ensureLessonManager(request: FastifyRequest, reply: FastifyReply, lessonId: string): Promise<boolean> {
  if (request.user?.role === "ADMIN") return true;

  const lesson = await service.getLessonOwner(lessonId);
  if (lesson?.module.course.instructorId === request.user?.userId) return true;

  reply.code(403).send({ success: false, error: "You can only manage content for courses assigned to you" });
  return false;
}

async function ensureQuizManager(request: FastifyRequest, reply: FastifyReply, quizId: string): Promise<boolean> {
  if (request.user?.role === "ADMIN") return true;

  const quiz = await service.getQuizOwner(quizId);
  if (quiz?.module.course.instructorId === request.user?.userId) return true;

  reply.code(403).send({ success: false, error: "You can only manage content for courses assigned to you" });
  return false;
}

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

  // Admin owns course/subject offering setup. Teachers manage assigned course content below.
  app.post("/", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const input = schema.createCourseSchema.parse(request.body);
    const course = await service.createCourse(request.user!.userId, input);
    reply.code(201).send({ success: true, data: course });
  });

  app.put("/:id", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = schema.updateCourseSchema.parse(request.body);
    const course = await service.updateCourse(id, input);
    reply.send({ success: true, data: course });
  });

  app.delete("/:id", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.deleteCourse(id);
    reply.send({ success: true, message: "Course deleted" });
  });

  app.post("/:id/publish", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const course = await service.publishCourse(id);
    reply.send({ success: true, data: course });
  });

  app.get("/instructor/my-courses", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const courses = await service.getInstructorCourses(request.user!.userId);
    reply.send({ success: true, data: courses });
  });

  // Modules
  app.post("/:courseId/modules", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    if (!(await ensureCourseManager(request, reply, courseId))) return;
    const input = schema.createModuleSchema.parse(request.body);
    const mod = await service.createModule(courseId, input);
    reply.code(201).send({ success: true, data: mod });
  });

  app.put("/modules/:moduleId", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { moduleId } = request.params as { moduleId: string };
    if (!(await ensureModuleManager(request, reply, moduleId))) return;
    const input = schema.createModuleSchema.partial().parse(request.body);
    const mod = await service.updateModule(moduleId, input);
    reply.send({ success: true, data: mod });
  });

  app.delete("/modules/:moduleId", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { moduleId } = request.params as { moduleId: string };
    if (!(await ensureModuleManager(request, reply, moduleId))) return;
    await service.deleteModule(moduleId);
    reply.send({ success: true, message: "Module deleted" });
  });

  app.post("/modules/reorder", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { items } = schema.reorderSchema.parse(request.body);
    for (const reorderItem of items) {
      if (!(await ensureModuleManager(request, reply, reorderItem.id))) return;
    }
    await service.reorderModules(items);
    reply.send({ success: true });
  });

  // Lessons
  app.post("/modules/:moduleId/lessons", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { moduleId } = request.params as { moduleId: string };
    if (!(await ensureModuleManager(request, reply, moduleId))) return;
    const input = schema.createLessonSchema.parse(request.body);
    const lesson = await service.createLesson(moduleId, input);
    reply.code(201).send({ success: true, data: lesson });
  });

  app.put("/lessons/:lessonId", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    if (!(await ensureLessonManager(request, reply, lessonId))) return;
    const input = schema.createLessonSchema.partial().parse(request.body);
    const lesson = await service.updateLesson(lessonId, input);
    reply.send({ success: true, data: lesson });
  });

  app.delete("/lessons/:lessonId", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    if (!(await ensureLessonManager(request, reply, lessonId))) return;
    await service.deleteLesson(lessonId);
    reply.send({ success: true, message: "Lesson deleted" });
  });

  app.post("/lessons/reorder", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { items } = schema.reorderSchema.parse(request.body);
    for (const reorderItem of items) {
      if (!(await ensureLessonManager(request, reply, reorderItem.id))) return;
    }
    await service.reorderLessons(items);
    reply.send({ success: true });
  });

  // Quizzes
  app.post("/lessons/:lessonId/quizzes", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    if (!(await ensureLessonManager(request, reply, lessonId))) return;
    const input = schema.createQuizSchema.parse(request.body);
    const quiz = await service.createQuiz(lessonId, input);
    reply.code(201).send({ success: true, data: quiz });
  });

  app.delete("/quizzes/:quizId", { preHandler: [requireRole("TEACHER", "ADMIN")] }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    if (!(await ensureQuizManager(request, reply, quizId))) return;
    await service.deleteQuiz(quizId);
    reply.send({ success: true, message: "Quiz deleted" });
  });

  // Reviews (authenticated students)
  app.post("/:courseId/reviews", { preHandler: [authenticate] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const input = schema.createReviewSchema.parse(request.body);
    const review = await service.createReview(request.user!.userId, courseId, input.rating, input.comment);
    reply.code(201).send({ success: true, data: review });
  });
}