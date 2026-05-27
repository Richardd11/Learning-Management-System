import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, Course, LessonContentType, PaginatedResponse } from "@/types";

export function useCourses(filters?: Record<string, string | number>) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
    });
  }

  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => api.get<ApiResponse<PaginatedResponse<Course>>>(`/courses?${params.toString()}`),
    select: (res) => res.data,
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.get<ApiResponse<Course>>(`/courses/${slug}`),
    select: (res) => res.data,
    enabled: !!slug,
  });
}

export function useCourseById(id: string) {
  return useQuery({
    queryKey: ["courseById", id],
    queryFn: () => api.get<ApiResponse<Course>>(`/courses/id/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useInstructorCourses() {
  return useQuery({
    queryKey: ["instructorCourses"],
    queryFn: () => api.get<ApiResponse<Course[]>>("/courses/instructor/my-courses"),
    select: (res) => res.data,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Course>) => api.post<ApiResponse<Course>>("/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Course> & { id: string }) =>
      api.put<ApiResponse<Course>>(`/courses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
    },
  });
}

export function usePublishCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<ApiResponse<Course>>(`/courses/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
    },
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, ...data }: { courseId: string; title: string; order: number }) =>
      api.post(`/courses/${courseId}/modules`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseById"] });
    },
  });
}

interface CreateLessonPayload {
  moduleId: string;
  title: string;
  order: number;
  content?: string;
  contentType?: LessonContentType;
  contentUrl?: string;
  duration?: number;
  isPublished?: boolean;
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, ...data }: CreateLessonPayload) =>
      api.post(`/courses/modules/${moduleId}/lessons`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseById"] });
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, ...data }: { courseId: string; rating: number; comment?: string }) =>
      api.post(`/courses/${courseId}/reviews`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}
