export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type AcademicLevelType = "HIGH_SCHOOL" | "COLLEGE";

export type Semester = "FIRST" | "SECOND" | "SUMMER";

export type LessonContentType = "VIDEO" | "PDF" | "TEXT" | "YOUTUBE";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  role: Role;
  academicLevelId: string | null;
  sectionId: string | null;
  studentIdNumber: string | null;
  dateOfBirth: string | null;
  xp: number;
  streak: number;
  socialLinks: Record<string, string> | null;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  academicLevel?: AcademicLevel;
  section?: Section;
}

export interface AcademicLevel {
  id: string;
  type: AcademicLevelType;
  gradeLabel: string;
  schoolYear: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  name: string;
  academicLevelId: string;
  schoolYear: string;
  semester: Semester | null;
  capacity: number | null;
  currentEnrollment: number;
  academicLevel?: AcademicLevel;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  subjectCode: string | null;
  academicLevelId: string | null;
  thumbnail: string | null;
  price: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags: string[];
  rating: number;
  ratingCount: number;
  enrollCount: number;
  instructorId: string;
  instructor?: Pick<User, "id" | "firstName" | "lastName" | "avatar">;
  academicLevel?: AcademicLevel;
  sections?: Pick<Section, "id" | "name">[];
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
  isPublished: boolean;
  courseId: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  contentType: LessonContentType;
  contentUrl: string | null;
  duration: number | null;
  isPublished: boolean;
  order: number;
  moduleId: string;
  youtubeTutorial?: YoutubeTutorial | null;
  quizzes: Quiz[];
  createdAt: string;
  updatedAt: string;
}

export interface YoutubeTutorial {
  id: string;
  lessonId: string;
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  moduleId: string;
  passingScore: number;
  timeLimit: number | null;
  attempts: number;
  questions: QuizQuestion[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[] | null;
  correctAnswer: string;
  points: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: Record<string, string | number>;
  timeTaken: number | null;
  completedAt: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  sectionId: string | null;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  progress: number;
  completedAt: string | null;
  createdAt: string;
  course?: Course;
  section?: Section;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  courseId: string | null;
  isInstitutionWide: boolean;
  scheduledFor: string | null;
  isPublished: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  author?: Pick<User, "id" | "firstName" | "lastName" | "avatar">;
  course?: Pick<Course, "id" | "title">;
  createdAt: string;
  updatedAt: string;
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
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
  totalSections: number;
  totalAcademicLevels: number;
  enrollmentByLevel: Array<{ level: string; count: number }>;
  averageCompletionRate: number;
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