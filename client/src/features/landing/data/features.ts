import { BookOpen, Brain, BarChart3, Award, Users, Monitor } from "lucide-react";

export interface Feature {
  icon: typeof BookOpen;
  title: string;
  desc: string;
  featured: boolean;
}

export const features: Feature[] = [
  {
    icon: BookOpen,
    title: "Course Builder",
    desc: "Create and organize courses with drag-and-drop modules, video integration, and structured lessons. Teachers control their content.",
    featured: true,
  },
  {
    icon: Brain,
    title: "Quizzes & Auto-grading",
    desc: "Build quizzes with multiple question types. Automatic grading saves teachers time and provides instant feedback to students.",
    featured: false,
  },
  {
    icon: Monitor,
    title: "Live Classes",
    desc: "Schedule and conduct live virtual classes. Record sessions for students who cannot attend in real time.",
    featured: false,
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track course completion rates, grade distributions, and student engagement. Data-driven insights for administrators and teachers.",
    featured: true,
  },
  {
    icon: Award,
    title: "Certificates",
    desc: "Generate completion certificates for courses. Students can download and share their achievements.",
    featured: false,
  },
  {
    icon: Users,
    title: "Role-based Access",
    desc: "Three roles — Administrator, Teacher, Student — each with appropriate permissions and a dedicated portal experience.",
    featured: false,
  },
];
