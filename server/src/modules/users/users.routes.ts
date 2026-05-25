import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth.js";
import { prisma } from "../../lib/prisma.js";
import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
});

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.put("/profile", { preHandler: [authenticate] }, async (request, reply) => {
    const input = updateProfileSchema.parse(request.body);
    const user = await prisma.user.update({
      where: { id: request.user!.userId },
      data: input,
    });
    const { passwordHash, refreshToken, ...safe } = user;
    reply.send({ success: true, data: safe });
  });

  app.get("/profile/:userId", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        role: true,
        socialLinks: true,
        xp: true,
        streak: true,
        createdAt: true,
      },
    });
    if (!user) {
      reply.code(404).send({ success: false, error: "User not found" });
      return;
    }
    reply.send({ success: true, data: user });
  });

  app.get("/certificates", { preHandler: [authenticate] }, async (request, reply) => {
    const certs = await prisma.certificate.findMany({
      where: { userId: request.user!.userId },
      include: { course: { select: { id: true, title: true, thumbnail: true } } },
      orderBy: { issuedAt: "desc" },
    });
    reply.send({ success: true, data: certs });
  });

  app.get("/certificates/verify/:verificationId", async (request, reply) => {
    const { verificationId } = request.params as { verificationId: string };
    const cert = await prisma.certificate.findUnique({
      where: { verificationId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        course: { select: { id: true, title: true } },
      },
    });
    if (!cert) {
      reply.code(404).send({ success: false, error: "Certificate not found" });
      return;
    }
    reply.send({ success: true, data: cert });
  });

  app.get("/stats", { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user!.userId;
    const [enrollments, completedCourses, totalXp, certificates] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.enrollment.count({ where: { userId, status: "COMPLETED" } }),
      prisma.user.findUnique({ where: { id: userId }, select: { xp: true, streak: true } }),
      prisma.certificate.count({ where: { userId } }),
    ]);
    reply.send({
      success: true,
      data: { enrollments, completedCourses, xp: totalXp?.xp ?? 0, streak: totalXp?.streak ?? 0, certificates },
    });
  });
}
