import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse, User } from "@/types";

export function useCurrentUser() {
  const { setUser, setLoading } = useAuthStore();

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
        return null;
      } catch {
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

export function useRegister() {
  const { login: storeLogin } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
      return api.post<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>>("/auth/register", data);
    },
    onSuccess: (res) => {
      if (res.data) {
        storeLogin(res.data.user, res.data.tokens.accessToken, res.data.tokens.refreshToken);
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }
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
