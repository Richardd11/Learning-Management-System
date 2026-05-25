import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

interface GradeResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export async function gradeSubmission(
  question: string,
  studentAnswer: string,
  rubric?: string,
  onChunk?: (text: string) => void
): Promise<GradeResult> {
  const systemPrompt = `You are an expert educational grader. Grade the student's answer based on the question and rubric provided. Return JSON:
{
  "score": number (0-100),
  "feedback": "string (detailed feedback)",
  "strengths": ["string"],
  "improvements": ["string"]
}
Be fair, constructive, and specific.`;

  const userMessage = `Question: ${question}
${rubric ? `\nRubric: ${rubric}` : ""}

Student Answer: ${studentAnswer}

Grade this answer and provide detailed feedback.`;

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

  const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse grading response");

  return JSON.parse(jsonMatch[0]) as GradeResult;
}
