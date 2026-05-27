import { prisma } from "../../lib/prisma.js";
import type { QuestionType } from "@prisma/client";

// ── Quiz Management ──────────────────────────────────────────────

export async function createQuiz(data: {
  title: string;
  moduleId: string;
  timeLimit?: number;
  passingScore?: number;
  order?: number;
}) {
  return prisma.quiz.create({ data });
}

export async function getQuiz(quizId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { orderBy: { order: "asc" } },
      module: { include: { course: true } },
    },
  });
}

export async function updateQuiz(quizId: string, data: {
  title?: string;
  timeLimit?: number;
  passingScore?: number;
  order?: number;
}) {
  return prisma.quiz.update({ where: { id: quizId }, data });
}

export async function deleteQuiz(quizId: string) {
  return prisma.quiz.delete({ where: { id: quizId } });
}

export async function getModuleQuizzes(moduleId: string) {
  return prisma.quiz.findMany({
    where: { moduleId },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { order: "asc" },
  });
}

// ── Quiz Questions ────────────────────────────────────────────────

export async function createQuestion(data: {
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string;
  points?: number;
  order?: number;
}) {
  return prisma.quizQuestion.create({
    data: {
      quizId: data.quizId,
      questionText: data.questionText,
      questionType: data.questionType,
      options: data.options ? JSON.stringify(data.options) : undefined,
      correctAnswer: data.correctAnswer,
      points: data.points ?? 1,
      order: data.order ?? 0,
    },
  });
}

export async function updateQuestion(questionId: string, data: {
  questionText?: string;
  questionType?: QuestionType;
  options?: string[];
  correctAnswer?: string;
  points?: number;
  order?: number;
}) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.options) updateData.options = JSON.stringify(data.options);
  return prisma.quizQuestion.update({ where: { id: questionId }, data: updateData });
}

export async function deleteQuestion(questionId: string) {
  return prisma.quizQuestion.delete({ where: { id: questionId } });
}

// ── Quiz Attempt (Student taking quiz) ────────────────────────────

interface AnswerSubmission {
  questionId: string;
  answer: string;
}

export async function submitQuizAttempt(studentId: string, quizId: string, answers: AnswerSubmission[]) {
  // Check if student already attempted this quiz
  const existingAttempt = await prisma.quizAttempt.findUnique({
    where: { studentId_quizId: { studentId, quizId } },
  });
  if (existingAttempt) {
    throw new Error("You have already attempted this quiz");
  }

  // Get quiz with questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!quiz) throw new Error("Quiz not found");

  // Grade the quiz
  let earnedPoints = 0;
  let totalPoints = 0;
  const gradedAnswers = [];

  for (const question of quiz.questions) {
    totalPoints += question.points;
    const studentAnswer = answers.find((a) => a.questionId === question.id);
    let isCorrect = false;
    const answer = studentAnswer?.answer ?? "";

    if (question.questionType === "MULTIPLE_CHOICE" || question.questionType === "TRUE_FALSE") {
      const options = question.options ? JSON.parse(question.options as string) as string[] : [];
      const correctIndex = parseInt(question.correctAnswer, 10);
      const selectedOption = parseInt(answer, 10);

      if (!isNaN(selectedOption) && selectedOption === correctIndex) {
        isCorrect = true;
        earnedPoints += question.points;
      }
    } else if (question.questionType === "SHORT_ANSWER") {
      // Simple string comparison (case-insensitive)
      if (answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
        isCorrect = true;
        earnedPoints += question.points;
      }
    }

    gradedAnswers.push({
      questionId: question.id,
      answer,
      isCorrect,
      correctAnswer: question.correctAnswer,
      points: question.points,
    });
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= quiz.passingScore;

  // Create the attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      studentId,
      quizId,
      score,
      totalPoints,
      earnedPoints,
      passed,
      answers: JSON.stringify(gradedAnswers),
    },
  });

  // Update student XP for passing
  if (passed) {
    await prisma.user.update({
      where: { id: studentId },
      data: { xp: { increment: 25 } },
    });
  }

  return {
    attempt,
    results: {
      score,
      totalPoints,
      earnedPoints,
      passed,
      answers: gradedAnswers,
    },
  };
}

export async function getQuizAttempt(studentId: string, quizId: string) {
  return prisma.quizAttempt.findUnique({
    where: { studentId_quizId: { studentId, quizId } },
  });
}

export async function getStudentQuizHistory(studentId: string) {
  return prisma.quizAttempt.findMany({
    where: { studentId },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          passingScore: true,
          module: { select: { title: true, course: { select: { title: true } } } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}

// ── Quiz Results for Teacher/Admin ─────────────────────────────────

export async function getQuizResults(quizId: string) {
  return prisma.quizAttempt.findMany({
    where: { quizId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          studentIdNumber: true,
          section: { select: { name: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}
