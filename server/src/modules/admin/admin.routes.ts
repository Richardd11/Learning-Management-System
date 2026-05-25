import type { FastifyInstance } from "fastify";
import { requireRole } from "../../middleware/auth.js";
import { prisma } from "../../lib/prisma.js";
import { z } from "zod";
import type { Role } from "@prisma/client";

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // Users
  app.get("/users", { preHandler: [requireRole("ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { page = "1", limit = "20", search, role } = request.query as Record<string, string | undefined>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isBanned: true, xp: true, createdAt: true, avatar: true,
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

  app.put("/users/:userId/role", { preHandler: [requireRole("SUPER_ADMIN")] }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { role } = z.object({ role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]) }).parse(request.body);
    const user = await prisma.user.update({ where: { id: userId }, data: { role } });
    reply.send({ success: true, data: { id: user.id, role: user.role } });
  });

  app.put("/users/:userId/ban", { preHandler: [requireRole("ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { isBanned } = z.object({ isBanned: z.boolean() }).parse(request.body);
    await prisma.user.update({ where: { id: userId }, data: { isBanned } });
    reply.send({ success: true, message: isBanned ? "User banned" : "User unbanned" });
  });

  app.delete("/users/:userId", { preHandler: [requireRole("SUPER_ADMIN")] }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    await prisma.user.delete({ where: { id: userId } });
    reply.send({ success: true, message: "User deleted" });
  });

  // Platform stats
  app.get("/stats", { preHandler: [requireRole("ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const [totalUsers, totalCourses, totalEnrollments, activeStudents, recentEnrollments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.user.count({ where: { role: "STUDENT", lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.enrollment.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { user: { select: { firstName: true, lastName: true } }, course: { select: { title: true } } } }),
    ]);

    reply.send({
      success: true,
      data: { totalUsers, totalCourses, totalEnrollments, activeStudents, recentEnrollments },
    });
  });

  // Course moderation
  app.get("/courses/pending", { preHandler: [requireRole("ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const courses = await prisma.course.findMany({
      where: { status: "DRAFT" },
      include: { instructor: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    reply.send({ success: true, data: courses });
  });
}
