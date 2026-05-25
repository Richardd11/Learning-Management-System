import { prisma } from "../../lib/prisma.js";
import { certificateQueue } from "../../lib/queue.js";
import type { Enrollment, LessonProgress } from "@prisma/client";

export async function enrollInCourse(userId: string, courseId: string): Promise<Enrollment> {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) throw new Error("Already enrolled");

  const enrollment = await prisma.enrollment.create({
    data: { userId, courseId },
  });

  await prisma.course.update({
    where: { id: courseId },
    data: { enrollCount: { increment: 1 } },
  });

  return enrollment;
}

export async function getEnrollment(userId: string, courseId: string) {
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
}

export async function getUserEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          _count: { select: { modules: true } },
        },
      },
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

    await certificateQueue.add("generate-certificate", { userId, courseId });
  }
}

export async function submitQuizAnswer(userId: string, quizId: string, answer: string) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw new Error("Quiz not found");

  const isCorrect = quiz.type === "SHORT_ANSWER" ? undefined : answer.toLowerCase() === quiz.answer.toLowerCase();

  const submission = await prisma.submission.create({
    data: { userId, quizId, answer, isCorrect },
  });

  if (isCorrect !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: isCorrect ? 10 : 0 } },
    });
  }

  return { ...submission, correctAnswer: quiz.answer };
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
