import { Settings, BookOpen, TrendingUp } from "lucide-react";

export interface Step {
  number: number;
  icon: typeof Settings;
  title: string;
  desc: string;
}

export const steps: Step[] = [
  {
    number: 1,
    icon: Settings,
    title: "Set up your institution",
    desc: "Your administrator configures academic levels, sections, and user roles. Teachers and students receive their accounts.",
  },
  {
    number: 2,
    icon: BookOpen,
    title: "Add courses & cohorts",
    desc: "Teachers build courses with lessons, quizzes, and resources. Students are enrolled in cohorts based on their academic level.",
  },
  {
    number: 3,
    icon: TrendingUp,
    title: "Track progress & outcomes",
    desc: "Monitor completion rates, grade distributions, and engagement metrics. Generate reports for institutional review.",
  },
];
