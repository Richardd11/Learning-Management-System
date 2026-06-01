import { Shield, BookOpen, GraduationCap } from "lucide-react";

export interface Role {
  id: string;
  icon: typeof Shield;
  title: string;
  description: string;
  bullets: string[];
}

export const roles: Role[] = [
  {
    id: "administrators",
    icon: Shield,
    title: "Administrators",
    description: "Full institutional control",
    bullets: [
      "Manage users, academic levels, and course sections across your institution",
      "Create and manage teacher and student accounts with role-based permissions",
      "Access institution-wide analytics and announcement tools",
    ],
  },
  {
    id: "teachers",
    icon: BookOpen,
    title: "Teachers",
    description: "Build and manage courses",
    bullets: [
      "Create courses with drag-and-drop modules, YouTube integration, and quizzes",
      "Track individual student progress and provide feedback on assignments",
      "Auto-grade quizzes and generate performance reports",
    ],
  },
  {
    id: "students",
    icon: GraduationCap,
    title: "Students",
    description: "Learn at your own pace",
    bullets: [
      "Access course materials, take quizzes, and track your progress in real time",
      "View teacher announcements and stay up to date with coursework",
      "Download completion certificates for finished courses",
    ],
  },
];
