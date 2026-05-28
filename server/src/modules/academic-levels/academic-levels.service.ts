import { prisma } from "../../lib/prisma.js";
import type { AcademicLevelType, Semester } from "@prisma/client";

export async function listAcademicLevels(type?: AcademicLevelType) {
  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  return prisma.academicLevel.findMany({
    where,
    include: {
      _count: { select: { sections: true, users: true, courses: true } },
    },
    orderBy: { orderIndex: "asc" },
  });
}

export async function getAcademicLevel(id: string) {
  return prisma.academicLevel.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { name: "asc" } },
      _count: { select: { users: true, courses: true } },
    },
  });
}

export async function createAcademicLevel(data: {
  type: AcademicLevelType;
  gradeLabel: string;
  orderIndex?: number;
}) {
  return prisma.academicLevel.create({ data });
}

export async function updateAcademicLevel(
  id: string,
  data: { gradeLabel?: string; orderIndex?: number; isActive?: boolean }
) {
  return prisma.academicLevel.update({ where: { id }, data });
}

export async function deleteAcademicLevel(id: string) {
  // Check if any users or courses are associated
  const level = await prisma.academicLevel.findUnique({
    where: { id },
    include: { _count: { select: { users: true, courses: true } } },
  });
  if (!level) throw new Error("Academic level not found");
  if (level._count.users > 0 || level._count.courses > 0) {
    throw new Error("Cannot delete academic level with associated users or courses. Deactivate it instead.");
  }
  return prisma.academicLevel.delete({ where: { id } });
}

// ── Sections ──────────────────────────────────────────────────────

export async function listSections(filters?: {
  academicLevelId?: string;
  schoolYear?: string;
  semester?: Semester;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.academicLevelId) where.academicLevelId = filters.academicLevelId;
  if (filters?.schoolYear) where.schoolYear = filters.schoolYear;
  if (filters?.semester) where.semester = filters.semester;

  return prisma.section.findMany({
    where,
    include: {
      academicLevel: true,
      _count: { select: { users: true, courses: true, enrollments: true } },
    },
    orderBy: [{ academicLevel: { orderIndex: "asc" } }, { name: "asc" }],
  });
}

export async function getSection(id: string) {
  return prisma.section.findUnique({
    where: { id },
    include: {
      academicLevel: true,
      users: {
        select: {
          id: true, firstName: true, lastName: true, email: true,
          role: true, studentIdNumber: true, avatar: true,
        },
        orderBy: { lastName: "asc" },
      },
      _count: { select: { courses: true, enrollments: true } },
    },
  });
}

export async function createSection(data: {
  name: string;
  academicLevelId: string;
  schoolYear: string;
  semester?: Semester;
  capacity?: number;
}) {
  return prisma.section.create({ data });
}

export async function updateSection(
  id: string,
  data: { name?: string; schoolYear?: string; semester?: Semester; capacity?: number; isActive?: boolean }
) {
  return prisma.section.update({ where: { id }, data });
}

export async function deleteSection(id: string) {
  const section = await prisma.section.findUnique({
    where: { id },
    include: { _count: { select: { users: true, enrollments: true } } },
  });
  if (!section) throw new Error("Section not found");
  if (section._count.users > 0) {
    throw new Error("Cannot delete section with assigned students. Remove students first.");
  }
  return prisma.section.delete({ where: { id } });
}

export async function getSectionsForLevel(academicLevelId: string) {
  return prisma.section.findMany({
    where: { academicLevelId, isActive: true },
    include: {
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });
}
