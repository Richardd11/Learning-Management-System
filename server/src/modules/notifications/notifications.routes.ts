import type { FastifyInstance } from "fastify";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { prisma } from "../../lib/prisma.js";
import { z } from "zod";

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", { preHandler: [authenticate] }, async (request, reply) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: request.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    reply.send({ success: true, data: notifications });
  });

  app.get("/unread-count", { preHandler: [authenticate] }, async (request, reply) => {
    const count = await prisma.notification.count({
      where: { userId: request.user!.userId, read: false },
    });
    reply.send({ success: true, data: { count } });
  });

  app.put("/:id/read", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    reply.send({ success: true });
  });

  app.put("/mark-all-read", { preHandler: [authenticate] }, async (request, reply) => {
    await prisma.notification.updateMany({
      where: { userId: request.user!.userId, read: false },
      data: { read: true },
    });
    reply.send({ success: true });
  });

  app.post("/broadcast", { preHandler: [requireRole("ADMIN", "SUPER_ADMIN")] }, async (request, reply) => {
    const { title, message } = z.object({ title: z.string(), message: z.string() }).parse(request.body);

    const users = await prisma.user.findMany({ select: { id: true } });

    await prisma.announcement.create({
      data: { title, message, authorId: request.user!.userId },
    });

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: "ANNOUNCEMENT" as const,
        title,
        message,
      })),
    });

    reply.send({ success: true, message: "Broadcast sent" });
  });
}
