import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../lib/prisma.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

interface GeneratedCourse {
  title: string;
  description: string;
  shortDesc: string;
  difficulty: string;
  tags: string[];
  modules: Array<{
    title: string;
    order: number;
    lessons: Array<{
      title: string;
      content: string;
      order: number;
      quizzes: Array<{
        question: string;
        type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
        options?: string[];
        answer: string;
      }>;
      flashcards: Array<{ front: string; back: string }>;
    }>;
  }>;
}

export async function generateCourse(topic: string, instructorId: string, onChunk?: (text: string) => void): Promise<string> {
  const systemPrompt = `You are an expert curriculum designer. Generate a comprehensive course structure for the given topic. Return valid JSON matching this exact schema:
{
  "title": "string",
  "description": "string (2-3 paragraphs)",
  "shortDesc": "string (1 sentence)",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "tags": ["string"],
  "modules": [{
    "title": "string",
    "order": number,
    "lessons": [{
      "title": "string",
      "content": "string (detailed lesson content in markdown, 500+ words)",
      "order": number,
      "quizzes": [{
        "question": "string",
        "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
        "options": ["string"] (for MULTIPLE_CHOICE only),
        "answer": "string"
      }],
      "flashcards": [{ "front": "string", "back": "string" }]
    }]
  }]
}
Generate 3-5 modules with 2-4 lessons each. Each lesson should have 2-3 quizzes and 3-5 flashcards.`;

  let fullResponse = "";

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: "user", content: `Create a complete course about: ${topic}` }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      fullResponse += event.delta.text;
      onChunk?.(event.delta.text);
    }
  }

  const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");

  const courseData: GeneratedCourse = JSON.parse(jsonMatch[0]);

  const slug = courseData.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

  const course = await prisma.course.create({
    data: {
      title: courseData.title,
      slug: `${slug}-${Date.now()}`,
      description: courseData.description,
      shortDesc: courseData.shortDesc,
      difficulty: courseData.difficulty,
      tags: courseData.tags,
      instructorId,
      modules: {
        create: courseData.modules.map((mod) => ({
          title: mod.title,
          order: mod.order,
          lessons: {
            create: mod.lessons.map((lesson) => ({
              title: lesson.title,
              content: lesson.content,
              order: lesson.order,
              quizzes: {
                create: lesson.quizzes.map((q, idx) => ({
                  question: q.question,
                  type: q.type,
                  options: q.options ?? null,
                  answer: q.answer,
                  order: idx,
                })),
              },
              flashcards: {
                create: lesson.flashcards.map((f, idx) => ({
                  front: f.front,
                  back: f.back,
                  order: idx,
                })),
              },
            })),
          },
        })),
      },
    },
  });

  return course.id;
}
