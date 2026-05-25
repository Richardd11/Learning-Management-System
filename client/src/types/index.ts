export type Role = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  role: Role;
  xp: number;
  streak: number;
  socialLinks: Record<string, string> | null;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  thumbnail: string | null;
  price: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags: string[];
  rating: number;
  ratingCount: number;
  enrollCount: number;
  instructorId: string;
  instructor?: Pick<User, "id" | "firstName" | "lastName" | "avatar" | "bio">;
  modules?: Module[];
  reviews?: Review[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { enrollments: number; reviews: number; modules: number };
}

export interface Module {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number;
  moduleId: string;
  quizzes: Quiz[];
  flashcards: Flashcard[];
}

export interface Quiz {
  id: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[] | null;
  answer: string;
  order: number;
  lessonId: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  order: number;
  lessonId: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  progress: number;
  completedAt: string | null;
  createdAt: string;
  course?: Course;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: Pick<User, "id" | "firstName" | "lastName" | "avatar">;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  verificationId: string;
  pdfUrl: string | null;
  issuedAt: string;
  course?: Pick<Course, "id" | "title" | "thumbnail">;
  user?: Pick<User, "id" | "firstName" | "lastName">;
}

export interface Notification {
  id: string;
  userId: string;
  type: "ENROLLMENT" | "GRADE" | "ANNOUNCEMENT" | "ACHIEVEMENT" | "SYSTEM";
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  timestamp: number | null;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  enrollments: number;
  completedCourses: number;
  xp: number;
  streak: number;
  certificates: number;
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
  recentEnrollments: Array<{
    id: string;
    user: Pick<User, "firstName" | "lastName">;
    course: Pick<Course, "title">;
    createdAt: string;
  }>;
}

export interface LessonProgressData {
  completed: string[];
  total: number;
  percentage: number;
}
