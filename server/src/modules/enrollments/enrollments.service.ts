import { prisma } from "../../lib/prisma.js";
import { certificateQueue } from "../../lib/queue.js";
import type { Enrollment, LessonProgress } from "@prisma/client";

export async function enrollInCourse(userId: string, courseId: string, sectionId?: string): Promise<Enrollment> {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) throw new Error("Already enrolled");

  // If no sectionId provided, try to use the student's assigned section
  if (!sectionId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { sectionId: true } });
    sectionId = user?.sectionId ?? undefined;
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
      sectionId: sectionId ?? null,
    },
    include: {
      section: true,
      course: {
        include: {
          academicLevel: true,
        },
      },
    },
  });

  await prisma.course.update({
    where: { id: courseId },
    data: { enrollCount: { increment: 1 } },
  });

  return enrollment;
}

/**
 * Bulk enroll all students in a section to a course.
 */
export async function bulkEnrollSection(sectionId: string, courseId: string): Promise<{ enrolled: number; alreadyEnrolled: number }> {
  const students = await prisma.user.findMany({
    where: { sectionId, role: "STUDENT" },
    select: { id: true },
  });

  let enrolled = 0;
  let alreadyEnrolled = 0;

  for (const student of students) {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: student.id, courseId } },
    });
    if (existing) {
      alreadyEnrolled++;
      continue;
    }

    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId,
        sectionId,
      },
    });
    enrolled++;
  }

  if (enrolled > 0) {
    await prisma.course.update({
      where: { id: courseId },
      data: { enrollCount: { increment: enrolled } },
    });
  }

  return { enrolled, alreadyEnrolled };
}

export async function getEnrollment(userId: string, courseId: string) {
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: {
      section: true,
    },
  });
}

export async function getUserEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          academicLevel: true,
          _count: { select: { modules: true } },
        },
      },
      section: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function markLessonComplete(userId: string, lessonId: string): Promise<LessonProgress> {
  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, completed: true, completedAt: new Date() },
    update: { completed: true, completedAt: new Date() },
  });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });

  if (lesson) {
    await recalculateProgress(userId, lesson.module.courseId);
  }

  return progress;
}

export async function getLessonProgress(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: true } } },
  });

  if (!course) return { completed: [], total: 0, percentage: 0 };

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

  const completed = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessonIds }, completed: true },
  });

  return {
    completed: completed.map((p) => p.lessonId),
    total: lessonIds.length,
    percentage: lessonIds.length > 0 ? Math.round((completed.length / lessonIds.length) * 100) : 0,
  };
}

async function recalculateProgress(userId: string, courseId: string): Promise<void> {
  const progressData = await getLessonProgress(userId, courseId);
  const progressPercent = progressData.percentage;

  await prisma.enrollment.update({
    where: { userId_courseId: { userId, courseId } },
    data: { progress: progressPercent },
  });

  if (progressPercent >= 100) {
    await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    await certificateQueue?.add("generate-certificate", { userId, courseId });
  }
}

export async function getUserNotes(userId: string, lessonId: string) {
  return prisma.note.findMany({
    where: { userId, lessonId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createNote(userId: string, lessonId: string, content: string, timestamp?: number) {
  return prisma.note.create({
    data: { userId, lessonId, content, timestamp },
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  await prisma.note.delete({ where: { id: noteId } });
}