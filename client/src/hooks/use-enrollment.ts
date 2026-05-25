import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, Enrollment, LessonProgressData } from "@/types";

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

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: ({ quizId, answer }: { quizId: string; answer: string }) =>
      api.post<ApiResponse<{ isCorrect: boolean; correctAnswer: string }>>(`/enrollments/quizzes/${quizId}/submit`, { answer }),
  });
}
