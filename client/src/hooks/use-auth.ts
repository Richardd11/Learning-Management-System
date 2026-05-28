import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse, User, Role } from "@/types";

export function useCurrentUser() {
  const { setUser, setLoading, logout } = useAuthStore();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return null;
      }
      try {
        const res = await api.get<ApiResponse<{ user: User }>>("/auth/me");
        if (res.data?.user) {
          setUser(res.data.user);
          return res.data.user;
        }
        // Unexpected: success:false without a throw
        logout();
        return null;
      } catch (err) {
        // "Session expired" means tokens are invalid — clear auth state silently
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("Session expired") || msg.includes("401")) {
          logout();
        }
        setLoading(false);
        return null;
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const { login: storeLogin } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return api.post<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>>("/auth/login", data);
    },
    onSuccess: (res) => {
      if (res.data) {
        storeLogin(res.data.user, res.data.tokens.accessToken, res.data.tokens.refreshToken);
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }
    },
  });
}

/**
 * Admin-only user creation hook.
 * Self-registration is disabled — admins create all accounts.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: Role;
      academicLevelId?: string | null;
      sectionId?: string | null;
      studentIdNumber?: string | null;
      dateOfBirth?: string | null;
    }) => {
      return api.post<ApiResponse<{ user: User }>>("/auth/register", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useLogout() {
  const { logout: storeLogout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post("/auth/logout");
      } catch {
        // Still logout locally even if API call fails
      }
    },
    onSettled: () => {
      storeLogout();
      queryClient.clear();
    },
  });
}
