import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../lib/prisma.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

export async function generateWeeklyDigest(
  instructorId: string,
  onChunk?: (text: string) => void
): Promise<string> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const courses = await prisma.course.findMany({
    where: { instructorId },
    include: {
      enrollments: {
        where: { createdAt: { gte: oneWeekAgo } },
        select: { id: true, progress: true, status: true },
      },
      _count: { select: { enrollments: true, reviews: true } },
    },
  });

  const stats = courses.map((c) => ({
    title: c.title,
    totalEnrollments: c._count.enrollments,
    newEnrollments: c.enrollments.length,
    avgProgress: c.enrollments.length > 0
      ? Math.round(c.enrollments.reduce((sum, e) => sum + e.progress, 0) / c.enrollments.length)
      : 0,
    completions: c.enrollments.filter((e) => e.status === "COMPLETED").length,
    rating: c.rating,
  }));

  const systemPrompt = `You are an educational analytics assistant. Generate a weekly digest report for an instructor based on their course statistics. Be concise, highlight key trends, and provide actionable suggestions.`;

  const userMessage = `Generate a weekly digest for the instructor's courses:

${JSON.stringify(stats, null, 2)}

Include:
1. Overall summary
2. Course-by-course highlights
3. Key trends (enrollment, completion rates)
4. Actionable recommendations`;

  let fullResponse = "";

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      fullResponse += event.delta.text;
      onChunk?.(event.delta.text);
    }
  }

  return fullResponse;
}
