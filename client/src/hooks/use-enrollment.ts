import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, Enrollment, LessonProgressData, Note, QuizAttemptResult } from "@/types";

export function useEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: () => api.get<ApiResponse<Enrollment[]>>("/enrollments/my-enrollments"),
    select: (res) => res.data,
  });
}

export function useEnrollment(courseId: string) {
  return useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: () => api.get<ApiResponse<Enrollment | null>>(`/enrollments/${courseId}/enrollment`),
    select: (res) => res.data,
    enabled: !!courseId,
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => api.post<ApiResponse<Enrollment>>(`/enrollments/${courseId}/enroll`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    },
  });
}

export function useCourseProgress(courseId: string) {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: () => api.get<ApiResponse<LessonProgressData>>(`/enrollments/${courseId}/progress`),
    select: (res) => res.data,
    enabled: !!courseId,
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => api.post(`/enrollments/lessons/${lessonId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseProgress"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}


export function useLessonNotes(lessonId: string) {
  return useQuery({
    queryKey: ["lessonNotes", lessonId],
    queryFn: () => api.get<ApiResponse<Note[]>>(`/enrollments/lessons/${lessonId}/notes`),
    select: (res) => res.data,
    enabled: !!lessonId,
  });
}

export function useCreateLessonNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, content, timestamp }: { lessonId: string; content: string; timestamp?: number }) =>
      api.post<ApiResponse<Note>>(`/enrollments/lessons/${lessonId}/notes`, { content, timestamp }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lessonNotes", variables.lessonId] });
    },
  });
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: Array<{ questionId: string; answer: string }> }) =>
      api.post<ApiResponse<QuizAttemptResult>>(`/quizzes/${quizId}/attempt`, { answers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
