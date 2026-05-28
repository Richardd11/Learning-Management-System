import type { FastifyInstance } from "fastify";
import { requireRole } from "../../middleware/auth.js";
import * as service from "./youtube.service.js";
import { z } from "zod";

const fetchMetadataSchema = z.object({
  url: z.string().url(),
});

const attachYouTubeSchema = z.object({
  ytVideoId: z.string(),
  ytTitle: z.string().optional(),
  ytThumbnail: z.string().optional(),
  ytChannel: z.string().optional(),
  ytDuration: z.string().optional(),
  embedUrl: z.string().optional(),
  teacherNotes: z.string().optional(),
});

const bulkImportSchema = z.object({
  items: z.array(z.object({
    url: z.string().url(),
    moduleId: z.string(),
    teacherNotes: z.string().optional(),
  })),
});

export async function youtubeRoutes(app: FastifyInstance): Promise<void> {
  // Fetch YouTube metadata from URL (no auth required for basic oEmbed)
  app.post("/fetch-metadata", async (request, reply) => {
    const { url } = fetchMetadataSchema.parse(request.body);
    try {
      const metadata = await service.fetchYouTubeMetadata(url);
      reply.send({ success: true, data: metadata });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch YouTube metadata";
      reply.code(400).send({ success: false, error: message });
    }
  });

  // Attach YouTube tutorial to a lesson
  app.post("/lessons/:lessonId/youtube", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const input = attachYouTubeSchema.parse(request.body);
    try {
      const tutorial = await service.attachYouTubeToLesson(lessonId, input);
      reply.code(201).send({ success: true, data: tutorial });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to attach YouTube tutorial";
      reply.code(400).send({ success: false, error: message });
    }
  });

  // Remove YouTube tutorial from a lesson
  app.delete("/lessons/:lessonId/youtube", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    try {
      await service.removeYouTubeFromLesson(lessonId);
      reply.send({ success: true, message: "YouTube tutorial removed" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove YouTube tutorial";
      reply.code(400).send({ success: false, error: message });
    }
  });

  // Bulk import YouTube videos
  app.post("/bulk-import", { preHandler: [requireRole("ADMIN", "TEACHER")] }, async (request, reply) => {
    const { items } = bulkImportSchema.parse(request.body);
    try {
      const result = await service.bulkImportYouTube(items);
      reply.send({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bulk import failed";
      reply.code(400).send({ success: false, error: message });
    }
  });
}
