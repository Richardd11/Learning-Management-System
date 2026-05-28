import { prisma } from "../../lib/prisma.js";

export async function listAnnouncements(filters?: {
  courseId?: string;
  isInstitutionWide?: boolean;
  authorId?: string;
}) {
  const where: Record<string, unknown> = { isPublished: true };
  if (filters?.courseId) where.courseId = filters.courseId;
  if (filters?.isInstitutionWide) where.isInstitutionWide = true;
  if (filters?.authorId) where.authorId = filters.authorId;

  return prisma.announcement.findMany({
    where,
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
      },
      course: {
        select: { id: true, title: true, subjectCode: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAnnouncement(id: string) {
  return prisma.announcement.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
      },
      course: {
        select: { id: true, title: true, subjectCode: true },
      },
    },
  });
}

export async function createAnnouncement(data: {
  title: string;
  body: string;
  authorId: string;
  courseId?: string;
  isInstitutionWide?: boolean;
  scheduledFor?: Date;
}) {
  return prisma.announcement.create({ data });
}

export async function updateAnnouncement(
  id: string,
  data: {
    title?: string;
    body?: string;
    courseId?: string;
    isInstitutionWide?: boolean;
    scheduledFor?: Date;
    isPublished?: boolean;
  }
) {
  return prisma.announcement.update({ where: { id }, data });
}

export async function deleteAnnouncement(id: string) {
  return prisma.announcement.delete({ where: { id } });
}

// Get announcements visible to a specific student (their enrolled courses + institution-wide)
export async function getStudentAnnouncements(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: studentId, status: "ACTIVE" },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  return prisma.announcement.findMany({
    where: {
      isPublished: true,
      scheduledFor: { lte: new Date() },
      OR: [
        { isInstitutionWide: true },
        { courseId: { in: courseIds } },
      ],
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
      },
      course: {
        select: { id: true, title: true, subjectCode: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
