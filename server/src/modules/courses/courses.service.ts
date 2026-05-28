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

  const { academicLevelId, subjectCode, ...rest } = input;

  const data: Prisma.CourseCreateInput = {
    ...rest,
    slug,
    subjectCode: subjectCode ?? null,
    instructor: { connect: { id: instructorId } },
    academicLevel: academicLevelId ? { connect: { id: academicLevelId } } : undefined,
  };

  return prisma.course.create({
    data,
    include: {
      academicLevel: true,
      instructor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });
}

export async function updateCourse(courseId: string, input: UpdateCourseInput): Promise<Course> {
  const data: Prisma.CourseUpdateInput = {};
  
  if (input.title) {
    data.title = input.title;
    data.slug = slugify(input.title);
  }
  if (input.description !== undefined) data.description = input.description;
  if (input.shortDesc !== undefined) data.shortDesc = input.shortDesc;
  if (input.price !== undefined) data.price = input.price;
  if (input.difficulty !== undefined) data.difficulty = input.difficulty;
  if (input.tags !== undefined) data.tags = input.tags;
  if (input.thumbnail !== undefined) data.thumbnail = input.thumbnail;
  if (input.subjectCode !== undefined) data.subjectCode = input.subjectCode;
  if (input.academicLevelId !== undefined) {
    data.academicLevel = input.academicLevelId
      ? { connect: { id: input.academicLevelId } }
      : { disconnect: true };
  }

  return prisma.course.update({
    where: { id: courseId },
    data,
    include: {
      academicLevel: true,
      instructor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });
}

export async function getCourseOwner(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });
}

export async function getModuleOwner(moduleId: string) {
  return prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      course: { select: { id: true, instructorId: true } },
    },
  });
}

export async function getLessonOwner(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      module: {
        select: {
          id: true,
          course: { select: { id: true, instructorId: true } },
        },
      },
    },
  });
}

export async function getQuizOwner(quizId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      module: {
        select: {
          id: true,
          course: { select: { id: true, instructorId: true } },
        },
      },
    },
  });
}

export async function deleteCourse(courseId: string): Promise<void> {
  await prisma.course.delete({ where: { id: courseId } });
}

export async function getCourseById(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true, avatar: true, bio: true } },
      academicLevel: true,
      sections: { select: { id: true, name: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              youtubeTutorial: true,
            },
          },
          quizzes: {
            orderBy: { order: "asc" },
            include: {
              questions: { orderBy: { order: "asc" } },
            },
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
      academicLevel: true,
      sections: { select: { id: true, name: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              youtubeTutorial: true,
            },
          },
          quizzes: {
            orderBy: { order: "asc" },
            include: {
              questions: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  });
}

export async function listCourses(filters: CourseFilters & { page: number; limit: number; academicLevelId?: string }): Promise<PaginatedResponse<Course>> {
  const where: Prisma.CourseWhereInput = { status: "PUBLISHED" };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { subjectCode: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.tags?.length) where.tags = { hasSome: filters.tags };
  if (filters.academicLevelId) where.academicLevelId = filters.academicLevelId;
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
        academicLevel: true,
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

// ── Module CRUD ────────────────────────────────────────────────────────

export async function createModule(courseId: string, input: CreateModuleInput): Promise<Module> {
  return prisma.module.create({
    data: {
      title: input.title,
      order: input.order,
      courseId,
      isPublished: input.isPublished ?? false,
    },
  });
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

// ── Lesson CRUD ────────────────────────────────────────────────────────

export async function createLesson(moduleId: string, input: CreateLessonInput): Promise<Lesson> {
  const { contentType, contentUrl, isPublished, ...rest } = input;
  return prisma.lesson.create({
    data: {
      ...rest,
      moduleId,
      contentType: contentType ?? "TEXT",
      contentUrl: contentUrl ?? null,
      isPublished: isPublished ?? false,
    },
  });
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

// ── Quiz CRUD ──────────────────────────────────────────────────────────

export async function createQuiz(moduleId: string, input: CreateQuizInput): Promise<Quiz> {
  return prisma.quiz.create({
    data: {
      title: input.title,
      moduleId,
      timeLimit: input.timeLimit,
      passingScore: input.passingScore,
      order: input.order,
    },
  });
}

export async function deleteQuiz(quizId: string): Promise<void> {
  await prisma.quiz.delete({ where: { id: quizId } });
}

// ── Reviews ────────────────────────────────────────────────────────────

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

// ── Instructor/Teacher courses ─────────────────────────────────────────

export async function getInstructorCourses(instructorId: string) {
  return prisma.course.findMany({
    where: { instructorId },
    orderBy: { createdAt: "desc" },
    include: {
      academicLevel: true,
      _count: { select: { enrollments: true, reviews: true, modules: true } },
    },
  });
}