import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  shortDesc: z.string().max(300).optional(),
  subjectCode: z.string().max(20).optional(),
  academicLevelId: z.string().uuid().optional().nullable(),
  price: z.number().min(0).default(0),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createModuleSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().min(0),
  isPublished: z.boolean().default(false),
});

export const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  order: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export const createLessonSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  contentType: z.enum(["VIDEO", "PDF", "TEXT", "YOUTUBE"]).default("TEXT"),
  contentUrl: z.string().optional(),
  duration: z.number().int().optional(),
  order: z.number().int().min(0),
  isPublished: z.boolean().default(false),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  contentType: z.enum(["VIDEO", "PDF", "TEXT", "YOUTUBE"]).optional(),
  contentUrl: z.string().optional(),
  duration: z.number().int().optional(),
  order: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  timeLimit: z.number().int().min(1).optional(),
  passingScore: z.number().min(0).max(100).default(50),
  order: z.number().int().default(0),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const courseFiltersSchema = z.object({
  search: z.string().optional(),
  difficulty: z.string().optional(),
  tags: z.string().optional(),
  academicLevelId: z.string().uuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number().int() })),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
