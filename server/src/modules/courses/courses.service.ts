import { prisma } from "../../lib/prisma.js";
import type { CreateCourseInput, UpdateCourseInput, CreateModuleInput, CreateLessonInput, CreateQuizInput } from "./courses.schema.js";
import type { CourseFilters, PaginatedResponse } from "../../types/index.js";
import type { Course, Module, Lesson, Quiz, Prisma } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createCourse(instructorId: string, input: CreateCourseInput): Promise<Course> {
  const baseSlug = slugify(input.title);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return prisma.course.create({
    data: { ...input, slug, instructorId },
  });
}

export async function updateCourse(courseId: string, input: UpdateCourseInput): Promise<Course> {
  const data: Prisma.CourseUpdateInput = { ...input };
  if (input.title) {
    data.slug = slugify(input.title);
  }
  return prisma.course.update({ where: { id: courseId }, data });
}

export async function deleteCourse(courseId: string): Promise<void> {
  await prisma.course.delete({ where: { id: courseId } });
}

export async function getCourseById(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true, avatar: true, bio: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { quizzes: { orderBy: { order: "asc" } }, flashcards: { orderBy: { order: "asc" } } },
          },
        },
      },
      reviews: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
    },
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true, avatar: true, bio: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { quizzes: { orderBy: { order: "asc" } }, flashcards: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
}

export async function listCourses(filters: CourseFilters & { page: number; limit: number }): Promise<PaginatedResponse<Course>> {
  const where: Prisma.CourseWhereInput = { status: "PUBLISHED" };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.tags?.length) where.tags = { hasSome: filters.tags };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }
  if (filters.instructorId) where.instructorId = filters.instructorId;

  const [data, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: { createdAt: "desc" },
      include: {
        instructor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return { data, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
}

export async function publishCourse(courseId: string): Promise<Course> {
  return prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
}

// ── Module CRUD ───────────────────────────────────────

export async function createModule(courseId: string, input: CreateModuleInput): Promise<Module> {
  return prisma.module.create({ data: { ...input, courseId } });
}

export async function updateModule(moduleId: string, input: Partial<CreateModuleInput>): Promise<Module> {
  return prisma.module.update({ where: { id: moduleId }, data: input });
}

export async function deleteModule(moduleId: string): Promise<void> {
  await prisma.module.delete({ where: { id: moduleId } });
}

export async function reorderModules(items: Array<{ id: string; order: number }>): Promise<void> {
  await prisma.$transaction(items.map((item) => prisma.module.update({ where: { id: item.id }, data: { order: item.order } })));
}

// ── Lesson CRUD ───────────────────────────────────────

export async function createLesson(moduleId: string, input: CreateLessonInput): Promise<Lesson> {
  return prisma.lesson.create({ data: { ...input, moduleId } });
}

export async function updateLesson(lessonId: string, input: Partial<CreateLessonInput>): Promise<Lesson> {
  return prisma.lesson.update({ where: { id: lessonId }, data: input });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await prisma.lesson.delete({ where: { id: lessonId } });
}

export async function reorderLessons(items: Array<{ id: string; order: number }>): Promise<void> {
  await prisma.$transaction(items.map((item) => prisma.lesson.update({ where: { id: item.id }, data: { order: item.order } })));
}

// ── Quiz CRUD ─────────────────────────────────────────

export async function createQuiz(lessonId: string, input: CreateQuizInput): Promise<Quiz> {
  return prisma.quiz.create({ data: { ...input, lessonId } });
}

export async function deleteQuiz(quizId: string): Promise<void> {
  await prisma.quiz.delete({ where: { id: quizId } });
}

// ── Flashcards ────────────────────────────────────────

export async function createFlashcard(lessonId: string, input: { front: string; back: string; order: number }) {
  return prisma.flashcard.create({ data: { ...input, lessonId } });
}

export async function deleteFlashcard(id: string) {
  await prisma.flashcard.delete({ where: { id } });
}

// ── Reviews ───────────────────────────────────────────

export async function createReview(userId: string, courseId: string, rating: number, comment?: string) {
  const review = await prisma.review.create({
    data: { userId, courseId, rating, comment },
  });

  const agg = await prisma.review.aggregate({
    where: { courseId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.course.update({
    where: { id: courseId },
    data: { rating: agg._avg.rating ?? 0, ratingCount: agg._count.rating },
  });

  return review;
}

// ── Instructor courses ────────────────────────────────

export async function getInstructorCourses(instructorId: string) {
  return prisma.course.findMany({
    where: { instructorId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, reviews: true, modules: true } },
    },
  });
}
