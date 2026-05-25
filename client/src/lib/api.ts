import type { ApiResponse } from "@/types";

const API_BASE = "/api";

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) ?? {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (response.status === 401) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        headers.Authorization = `Bearer ${this.getToken()}`;
        const retryResponse = await fetch(`${API_BASE}${path}`, { ...options, headers });
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ error: "Request failed" }));
          throw new Error((error as ApiResponse).error ?? "Request failed");
        }
        return retryResponse.json() as Promise<T>;
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error((error as ApiResponse).error ?? "Request failed");
    }

    return response.json() as Promise<T>;
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>;
      if (data.data?.tokens) {
        localStorage.setItem("accessToken", data.data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  async upload<T>(path: string, file: File): Promise<T> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error((error as ApiResponse).error ?? "Upload failed");
    }

    return response.json() as Promise<T>;
  }

  createSSEStream(path: string, body: unknown): EventSource | ReadableStream<string> {
    const token = this.getToken();
    const controller = new AbortController();

    const stream = new ReadableStream<string>({
      start(streamController) {
        fetch(`${API_BASE}${path}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        })
          .then((response) => {
            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();

            function pump(): Promise<void> {
              return reader!.read().then(({ done, value }) => {
                if (done) {
                  streamController.close();
                  return;
                }
                const text = decoder.decode(value);
                streamController.enqueue(text);
                return pump();
              });
            }

            return pump();
          })
          .catch((err) => {
            if (err instanceof Error && err.name !== "AbortError") {
              streamController.error(err);
            }
          });
      },
      cancel() {
        controller.abort();
      },
    });

    return stream;
  }
}

export const api = new ApiClient();
