import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  shortDesc: z.string().max(300).optional(),
  price: z.number().min(0).default(0),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createModuleSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().min(0),
});

export const createLessonSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.number().int().optional(),
  order: z.number().int().min(0),
});

export const createQuizSchema = z.object({
  question: z.string().min(1),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1),
  order: z.number().int().default(0),
});

export const createFlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
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
