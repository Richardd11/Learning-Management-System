import { prisma } from "../lib/prisma.js";

export async function generateCertificate(userId: string, courseId: string): Promise<string> {
  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
  ]);

  if (!user || !course) throw new Error("User or course not found");

  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return existing.id;

  const certificate = await prisma.certificate.create({
    data: {
      userId,
      courseId,
    },
  });

  return certificate.id;
}
