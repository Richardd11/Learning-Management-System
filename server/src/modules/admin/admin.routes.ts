import type { FastifyInstance } from "fastify";
import { requireRole } from "../../middleware/auth.js";
import { prisma } from "../../lib/prisma.js";
import { hash } from "bcryptjs";
import { z } from "zod";

// ── Schemas ──────────────────────────────────────────────────────

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  academicLevelId: z.string().optional(),
  sectionId: z.string().optional(),
  studentIdNumber: z.string().optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
  academicLevelId: z.string().optional().nullable(),
  sectionId: z.string().optional().nullable(),
  studentIdNumber: z.string().optional().nullable(),
  isBanned: z.boolean().optional(),
});

const bulkImportSchema = z.object({
  users: z.array(z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
    academicLevelId: z.string().optional(),
    sectionId: z.string().optional(),
    studentIdNumber: z.string().optional(),
  })),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8).max(100),
});

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // ── Enhanced User Management ──────────────────────────────────
  app.get("/users", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const {
      page = "1", limit = "20", search, role, academicLevelId, sectionId,
    } = request.query as Record<string, string | undefined>;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { studentIdNumber: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (academicLevelId) where.academicLevelId = academicLevelId;
    if (sectionId) where.sectionId = sectionId;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isBanned: true, xp: true, createdAt: true, avatar: true,
          academicLevelId: true, sectionId: true, studentIdNumber: true,
          academicLevel: { select: { id: true, type: true, gradeLabel: true } },
          section: { select: { id: true, name: true } },
          _count: { select: { enrollments: true, courses: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    reply.send({
      success: true,
      data: { data: users, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  });

  // Create single user (admin-only, no self-registration)
  app.post("/users", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const input = createUserSchema.parse(request.body);
    try {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) {
        reply.code(400).send({ success: false, error: "Email already registered" });
        return;
      }

      const passwordHash = await hash(input.password, 12);
      const user = await prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          academicLevelId: input.academicLevelId,
          sectionId: input.sectionId,
          studentIdNumber: input.studentIdNumber,
        },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, academicLevelId: true, sectionId: true, studentIdNumber: true,
        },
      });

      reply.code(201).send({ success: true, data: user });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      reply.code(400).send({ success: false, error: message });
    }
  });

  // Update user
  app.put("/users/:userId", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const input = updateUserSchema.parse(request.body);
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: input,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, academicLevelId: true, sectionId: true, studentIdNumber: true,
          isBanned: true,
        },
      });
      reply.send({ success: true, data: user });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      reply.code(400).send({ success: false, error: message });
    }
  });

  // Delete user
  app.delete("/users/:userId", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    await prisma.user.delete({ where: { id: userId } });
    reply.send({ success: true, message: "User deleted" });
  });

  // Reset user password (admin)
  app.post("/users/:userId/reset-password", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { newPassword } = resetPasswordSchema.parse(request.body);
    const passwordHash = await hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash, refreshToken: null } });
    reply.send({ success: true, message: "Password reset successfully" });
  });

  // Bulk import users via JSON (CSV support can be added later)
  app.post("/users/bulk-import", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { users } = bulkImportSchema.parse(request.body);
    const results = { successful: 0, failed: 0, errors: [] as string[] };

    for (const userData of users) {
      try {
        const existing = await prisma.user.findUnique({ where: { email: userData.email } });
        if (existing) {
          results.failed++;
          results.errors.push(`${userData.email}: Already exists`);
          continue;
        }

        const passwordHash = await hash(userData.password, 12);
        await prisma.user.create({
          data: {
            email: userData.email,
            passwordHash,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            academicLevelId: userData.academicLevelId,
            sectionId: userData.sectionId,
            studentIdNumber: userData.studentIdNumber,
          },
        });
        results.successful++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${userData.email}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    reply.send({ success: true, data: results });
  });

  // ── Platform Stats (Enhanced) ────────────────────────────────
  app.get("/stats", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalEnrollments,
      activeStudents,
      totalSections,
      totalAcademicLevels,
      recentEnrollments,
      enrollmentByLevel,
      courseCompletionRates,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.user.count({ where: { role: "STUDENT", lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.section.count({ where: { isActive: true } }),
      prisma.academicLevel.count({ where: { isActive: true } }),
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true, section: { select: { name: true } } } },
          course: { select: { title: true, subjectCode: true } },
        },
      }),
      prisma.academicLevel.findMany({
        include: {
          _count: { select: { users: true, courses: true } },
        },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.enrollment.aggregate({
        _avg: { progress: true },
      }),
    ]);

    reply.send({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalCourses,
        totalEnrollments,
        activeStudents,
        totalSections,
        totalAcademicLevels,
        recentEnrollments,
        enrollmentByLevel,
        averageCompletionRate: Math.round(courseCompletionRates._avg.progress ?? 0),
      },
    });
  });

  // ── Course Management ────────────────────────────────────────
  app.get("/courses", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { status, academicLevelId } = request.query as Record<string, string | undefined>;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (academicLevelId) where.academicLevelId = academicLevelId;

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        academicLevel: { select: { id: true, type: true, gradeLabel: true } },
        sections: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    reply.send({ success: true, data: courses });
  });

  // Assign sections to course
  app.post("/courses/:courseId/sections", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const { sectionIds } = z.object({ sectionIds: z.array(z.string()) }).parse(request.body);
    const course = await prisma.course.update({
      where: { id: courseId },
      data: { sections: { set: sectionIds.map((id: string) => ({ id })) } },
    });
    reply.send({ success: true, data: course });
  });

  // ── Analytics Endpoints ──────────────────────────────────────
  app.get("/analytics/course/:courseId", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const [enrollments, avgProgress, quizStats] = await Promise.all([
      prisma.enrollment.count({ where: { courseId } }),
      prisma.enrollment.aggregate({ where: { courseId }, _avg: { progress: true } }),
      prisma.quizAttempt.aggregate({
        where: { quiz: { module: { courseId } } },
        _avg: { score: true },
        _count: true,
      }),
    ]);

    reply.send({
      success: true,
      data: {
        enrollmentCount: enrollments,
        averageProgress: Math.round(avgProgress._avg.progress ?? 0),
        averageQuizScore: Math.round(quizStats._avg.score ?? 0),
        totalQuizAttempts: quizStats._count,
      },
    });
  });

  app.get("/analytics/student/:studentId", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const [enrollments, lessonProgress, quizAttempts] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: studentId },
        include: { course: { select: { id: true, title: true } } },
      }),
      prisma.lessonProgress.count({ where: { userId: studentId, completed: true } }),
      prisma.quizAttempt.findMany({
        where: { studentId },
        select: { score: true, passed: true, quiz: { select: { title: true } } },
      }),
    ]);

    reply.send({
      success: true,
      data: {
        coursesEnrolled: enrollments.length,
        lessonsCompleted: lessonProgress,
        quizHistory: quizAttempts,
        averageQuizScore: quizAttempts.length > 0
          ? Math.round(quizAttempts.reduce((sum, q) => sum + q.score, 0) / quizAttempts.length)
          : 0,
      },
    });
  });

  app.get("/analytics/section/:sectionId", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { sectionId } = request.params as { sectionId: string };
    const students = await prisma.user.findMany({
      where: { sectionId, role: "STUDENT" },
      select: { id: true, firstName: true, lastName: true },
    });

    const enrollmentData = await prisma.enrollment.aggregate({
      where: { userId: { in: students.map((s) => s.id) } },
      _avg: { progress: true },
      _count: true,
    });

    const quizData = await prisma.quizAttempt.aggregate({
      where: { studentId: { in: students.map((s) => s.id) } },
      _avg: { score: true },
      _count: true,
    });

    reply.send({
      success: true,
      data: {
        totalStudents: students.length,
        averageProgress: Math.round(enrollmentData._avg.progress ?? 0),
        totalEnrollments: enrollmentData._count,
        averageQuizScore: Math.round(quizData._avg.score ?? 0),
        totalQuizAttempts: quizData._count,
      },
    });
  });
}
