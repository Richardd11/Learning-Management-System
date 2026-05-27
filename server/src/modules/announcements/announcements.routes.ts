import type { FastifyInstance } from "fastify";
import { authenticate, requireRole } from "../../middleware/auth.js";
import * as service from "./announcements.service.js";
import { z } from "zod";

const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  courseId: z.string().optional(),
  isInstitutionWide: z.boolean().default(false),
  scheduledFor: z.string().datetime().optional(),
});

const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  courseId: z.string().optional().nullable(),
  isInstitutionWide: z.boolean().optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  isPublished: z.boolean().optional(),
});

export async function announcementRoutes(app: FastifyInstance): Promise<void> {
  // List announcements (with filters)
  app.get("/", async (request, reply) => {
    const { courseId, isInstitutionWide } = request.query as Record<string, string | undefined>;
    const announcements = await service.listAnnouncements({
      courseId,
      isInstitutionWide: isInstitutionWide === "true" ? true : undefined,
    });
    reply.send({ success: true, data: announcements });
  });

  // Get student-specific announcements
  app.get("/my", { preHandler: [authenticate] }, async (request, reply) => {
    if (request.user?.role !== "STUDENT") {
      reply.code(403).send({ success: false, error: "Only students can access this endpoint" });
      return;
    }
    const announcements = await service.getStudentAnnouncements(request.user.userId);
    reply.send({ success: true, data: announcements });
  });

  // Get single announcement
  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const announcement = await service.getAnnouncement(id);
    if (!announcement) {
      reply.code(404).send({ success: false, error: "Announcement not found" });
      return;
    }
    reply.send({ success: true, data: announcement });
  });

  // Create announcement (Admin/Teacher)
  app.post("/", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const input = createAnnouncementSchema.parse(request.body);
    const announcement = await service.createAnnouncement({
      ...input,
      authorId: request.user!.userId,
      scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
    });
    reply.code(201).send({ success: true, data: announcement });
  });

  // Update announcement
  app.put("/:id", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = updateAnnouncementSchema.parse(request.body);
    const updateData: {
      title?: string;
      body?: string;
      courseId?: string;
      isInstitutionWide?: boolean;
      scheduledFor?: Date;
      isPublished?: boolean;
    } = {};
    // Copy non-null values from input
    if (input.title !== undefined) updateData.title = input.title;
    if (input.body !== undefined) updateData.body = input.body;
    if (input.courseId !== undefined && input.courseId !== null) updateData.courseId = input.courseId;
    if (input.isInstitutionWide !== undefined) updateData.isInstitutionWide = input.isInstitutionWide;
    if (input.isPublished !== undefined) updateData.isPublished = input.isPublished;
    if (input.scheduledFor) {
      updateData.scheduledFor = new Date(input.scheduledFor);
    }
    const announcement = await service.updateAnnouncement(id, updateData);
    reply.send({ success: true, data: announcement });
  });

  // Delete announcement
  app.delete("/:id", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.deleteAnnouncement(id);
    reply.send({ success: true, message: "Announcement deleted" });
  });
}
