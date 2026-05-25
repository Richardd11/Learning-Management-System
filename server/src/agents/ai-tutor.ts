import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../lib/prisma.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

export async function chatWithTutor(
  courseId: string,
  message: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  onChunk?: (text: string) => void
): Promise<string> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: { select: { title: true, content: true } },
        },
      },
    },
  });

  if (!course) throw new Error("Course not found");

  const courseContext = course.modules
    .map((m) =>
      `Module: ${m.title}\n${m.lessons.map((l) => `  Lesson: ${l.title}\n  ${l.content ?? ""}`).join("\n")}`
    )
    .join("\n\n");

  const systemPrompt = `You are an AI tutor for the course "${course.title}". 
You have deep knowledge of this course material:

${courseContext.slice(0, 6000)}

Help students understand the material. Be encouraging, clear, and provide examples.
If a question is outside the course scope, guide them back to relevant topics.
Keep responses concise but thorough.`;

  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: message },
  ];

  let fullResponse = "";

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      fullResponse += event.delta.text;
      onChunk?.(event.delta.text);
    }
  }

  return fullResponse;
}
