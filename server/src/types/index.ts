import type { Role } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CourseFilters {
  search?: string;
  difficulty?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  instructorId?: string;
}

export interface StreamEvent {
  type: "text" | "tool_call" | "done" | "error";
  data: string;
}
