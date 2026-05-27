import type { FastifyInstance } from "fastify";
import { requireRole } from "../../middleware/auth.js";
import * as service from "./academic-levels.service.js";
import { z } from "zod";

const createLevelSchema = z.object({
  type: z.enum(["HIGH_SCHOOL", "COLLEGE"]),
  gradeLabel: z.string().min(1).max(50),
  orderIndex: z.number().int().default(0),
});

const updateLevelSchema = z.object({
  gradeLabel: z.string().min(1).max(50).optional(),
  orderIndex: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const createSectionSchema = z.object({
  name: z.string().min(1).max(100),
  academicLevelId: z.string(),
  schoolYear: z.string().min(4).max(20),
  semester: z.enum(["FIRST", "SECOND", "SUMMER"]).optional(),
  capacity: z.number().int().min(1).max(200).default(40),
});

const updateSectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  schoolYear: z.string().min(4).max(20).optional(),
  semester: z.enum(["FIRST", "SECOND", "SUMMER"]).optional(),
  capacity: z.number().int().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
});

export async function academicLevelRoutes(app: FastifyInstance): Promise<void> {
  // ── Academic Levels ─────────────────────────────────────────
  app.get("/levels", async (request, reply) => {
    const { type } = request.query as { type?: string };
    const levels = await service.listAcademicLevels(type as "HIGH_SCHOOL" | "COLLEGE" | undefined);
    reply.send({ success: true, data: levels });
  });

  app.get("/levels/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const level = await service.getAcademicLevel(id);
    if (!level) {
      reply.code(404).send({ success: false, error: "Academic level not found" });
      return;
    }
    reply.send({ success: true, data: level });
  });

  app.post("/levels", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const input = createLevelSchema.parse(request.body);
    try {
      const level = await service.createAcademicLevel(input);
      reply.code(201).send({ success: true, data: level });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create academic level";
      reply.code(400).send({ success: false, error: message });
    }
  });

  app.put("/levels/:id", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = updateLevelSchema.parse(request.body);
    try {
      const level = await service.updateAcademicLevel(id, input);
      reply.send({ success: true, data: level });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update academic level";
      reply.code(400).send({ success: false, error: message });
    }
  });

  app.delete("/levels/:id", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await service.deleteAcademicLevel(id);
      reply.send({ success: true, message: "Academic level deleted" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete academic level";
      reply.code(400).send({ success: false, error: message });
    }
  });

  // ── Sections ────────────────────────────────────────────────
  app.get("/sections", async (request, reply) => {
    const { academicLevelId, schoolYear, semester } = request.query as Record<string, string | undefined>;
    const sections = await service.listSections({
      academicLevelId,
      schoolYear,
      semester: semester as "FIRST" | "SECOND" | "SUMMER" | undefined,
    });
    reply.send({ success: true, data: sections });
  });

  app.get("/sections/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const section = await service.getSection(id);
    if (!section) {
      reply.code(404).send({ success: false, error: "Section not found" });
      return;
    }
    reply.send({ success: true, data: section });
  });

  app.get("/levels/:levelId/sections", async (request, reply) => {
    const { levelId } = request.params as { levelId: string };
    const sections = await service.getSectionsForLevel(levelId);
    reply.send({ success: true, data: sections });
  });

  app.post("/sections", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const input = createSectionSchema.parse(request.body);
    try {
      const section = await service.createSection(input);
      reply.code(201).send({ success: true, data: section });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create section";
      reply.code(400).send({ success: false, error: message });
    }
  });

  app.put("/sections/:id", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = updateSectionSchema.parse(request.body);
    try {
      const section = await service.updateSection(id, input);
      reply.send({ success: true, data: section });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update section";
      reply.code(400).send({ success: false, error: message });
    }
  });

  app.delete("/sections/:id", { preHandler: [requireRole("ADMIN")] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await service.deleteSection(id);
      reply.send({ success: true, message: "Section deleted" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete section";
      reply.code(400).send({ success: false, error: message });
    }
  });
}
