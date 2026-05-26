import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse, Notification } from "@/types";

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<ApiResponse<Notification[]>>("/notifications"),
    select: (res) => res.data,
    refetchInterval: 30000,
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useNotificationCount() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["notificationCount"],
    queryFn: () => api.get<ApiResponse<{ count: number }>>("/notifications/unread-count"),
    select: (res) => res.data?.count ?? 0,
    refetchInterval: 15000,
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.put("/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });
}
