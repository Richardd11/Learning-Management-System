import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@lms.dev" },
    update: {},
    create: {
      email: "admin@lms.dev",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "SUPER_ADMIN",
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@lms.dev" },
    update: {},
    create: {
      email: "instructor@lms.dev",
      passwordHash,
      firstName: "Jane",
      lastName: "Smith",
      role: "INSTRUCTOR",
      bio: "Full-stack developer with 10+ years of experience. Passionate about teaching and making complex topics accessible.",
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: "instructor2@lms.dev" },
    update: {},
    create: {
      email: "instructor2@lms.dev",
      passwordHash,
      firstName: "Alex",
      lastName: "Johnson",
      role: "INSTRUCTOR",
      bio: "Data scientist and machine learning engineer. Loves helping others learn AI.",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@lms.dev" },
    update: {},
    create: {
      email: "student@lms.dev",
      passwordHash,
      firstName: "John",
      lastName: "Doe",
      role: "STUDENT",
      xp: 150,
      streak: 5,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student2@lms.dev" },
    update: {},
    create: {
      email: "student2@lms.dev",
      passwordHash,
      firstName: "Emily",
      lastName: "Chen",
      role: "STUDENT",
      xp: 320,
      streak: 12,
    },
  });

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { slug: "react-masterclass" },
    update: {},
    create: {
      title: "React 19 Masterclass",
      slug: "react-masterclass",
      description: "Master React 19 from basics to advanced patterns. Learn hooks, server components, suspense, and build production-ready applications with TypeScript.",
      shortDesc: "Complete guide to modern React development",
      difficulty: "intermediate",
      price: 49.99,
      tags: ["react", "typescript", "frontend", "web-development"],
      status: "PUBLISHED",
      publishedAt: new Date(),
      instructorId: instructor.id,
      rating: 4.8,
      ratingCount: 24,
      enrollCount: 156,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "intro-to-machine-learning" },
    update: {},
    create: {
      title: "Introduction to Machine Learning",
      slug: "intro-to-machine-learning",
      description: "Learn the fundamentals of machine learning, from linear regression to neural networks. Hands-on projects with Python and scikit-learn.",
      shortDesc: "Start your ML journey with practical projects",
      difficulty: "beginner",
      price: 39.99,
      tags: ["machine-learning", "python", "ai", "data-science"],
      status: "PUBLISHED",
      publishedAt: new Date(),
      instructorId: instructor2.id,
      rating: 4.6,
      ratingCount: 18,
      enrollCount: 89,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: "advanced-typescript" },
    update: {},
    create: {
      title: "Advanced TypeScript Patterns",
      slug: "advanced-typescript",
      description: "Deep dive into TypeScript's type system. Learn generics, conditional types, mapped types, and build type-safe libraries.",
      shortDesc: "Master TypeScript's advanced type system",
      difficulty: "advanced",
      price: 59.99,
      tags: ["typescript", "programming", "web-development"],
      status: "PUBLISHED",
      publishedAt: new Date(),
      instructorId: instructor.id,
      rating: 4.9,
      ratingCount: 31,
      enrollCount: 112,
    },
  });

  const course4 = await prisma.course.upsert({
    where: { slug: "fullstack-nodejs" },
    update: {},
    create: {
      title: "Full-Stack Node.js Development",
      slug: "fullstack-nodejs",
      description: "Build production-ready applications with Node.js, Express, PostgreSQL, and React. Covers authentication, deployment, and testing.",
      shortDesc: "End-to-end full-stack development with Node.js",
      difficulty: "intermediate",
      price: 44.99,
      tags: ["nodejs", "fullstack", "postgresql", "backend"],
      status: "PUBLISHED",
      publishedAt: new Date(),
      instructorId: instructor.id,
      rating: 4.7,
      ratingCount: 15,
      enrollCount: 67,
    },
  });

  // Create modules and lessons for course1
  const mod1 = await prisma.module.create({
    data: {
      title: "Getting Started with React",
      order: 0,
      courseId: course1.id,
    },
  });

  const mod2 = await prisma.module.create({
    data: {
      title: "Hooks Deep Dive",
      order: 1,
      courseId: course1.id,
    },
  });

  const mod3 = await prisma.module.create({
    data: {
      title: "Advanced Patterns",
      order: 2,
      courseId: course1.id,
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      title: "What is React?",
      content: "# What is React?\n\nReact is a JavaScript library for building user interfaces. It was created by Facebook and is maintained by Meta and a community of developers.\n\n## Key Concepts\n\n- **Components**: React apps are built using components, which are reusable pieces of UI.\n- **Virtual DOM**: React uses a virtual DOM to efficiently update the browser DOM.\n- **JSX**: A syntax extension that lets you write HTML-like code in JavaScript.\n- **Unidirectional Data Flow**: Data flows down from parent to child components.\n\n## Why React?\n\n1. Component-based architecture promotes reusability\n2. Large ecosystem and community\n3. Performance optimizations with virtual DOM\n4. React Native for mobile development",
      order: 0,
      duration: 15,
      moduleId: mod1.id,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: "Setting Up Your Environment",
      content: "# Setting Up Your Development Environment\n\n## Prerequisites\n\n- Node.js 18+ installed\n- A code editor (VS Code recommended)\n- Basic knowledge of HTML, CSS, and JavaScript\n\n## Creating a New React Project\n\n```bash\nnpm create vite@latest my-app -- --template react-ts\ncd my-app\nnpm install\nnpm run dev\n```\n\n## Project Structure\n\nA typical React project with Vite includes:\n- `src/` - Source code\n- `public/` - Static assets\n- `vite.config.ts` - Vite configuration\n- `tsconfig.json` - TypeScript configuration",
      order: 1,
      duration: 20,
      moduleId: mod1.id,
    },
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      title: "useState and useEffect",
      content: "# useState and useEffect\n\n## useState\n\nThe `useState` hook lets you add state to functional components.\n\n```typescript\nconst [count, setCount] = useState(0);\n```\n\n## useEffect\n\nThe `useEffect` hook lets you perform side effects in components.\n\n```typescript\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```\n\n## Rules of Hooks\n\n1. Only call hooks at the top level\n2. Only call hooks from React functions",
      order: 0,
      duration: 30,
      moduleId: mod2.id,
    },
  });

  // Add quizzes
  await prisma.quiz.createMany({
    data: [
      {
        question: "What is the Virtual DOM in React?",
        type: "MULTIPLE_CHOICE",
        options: JSON.parse(JSON.stringify([
          "A lightweight copy of the actual DOM",
          "A physical device",
          "A CSS framework",
          "A database technology",
        ])),
        answer: "A lightweight copy of the actual DOM",
        order: 0,
        lessonId: lesson1.id,
      },
      {
        question: "React uses a bidirectional data flow.",
        type: "TRUE_FALSE",
        options: JSON.parse(JSON.stringify(["True", "False"])),
        answer: "False",
        order: 1,
        lessonId: lesson1.id,
      },
      {
        question: "Which hook is used to add state to a functional component?",
        type: "MULTIPLE_CHOICE",
        options: JSON.parse(JSON.stringify(["useEffect", "useState", "useContext", "useRef"])),
        answer: "useState",
        order: 0,
        lessonId: lesson3.id,
      },
    ],
  });

  // Add flashcards
  await prisma.flashcard.createMany({
    data: [
      { front: "What is JSX?", back: "A syntax extension for JavaScript that lets you write HTML-like code in your JS files.", order: 0, lessonId: lesson1.id },
      { front: "What is a React component?", back: "A reusable piece of UI that can accept props and manage its own state.", order: 1, lessonId: lesson1.id },
      { front: "What is the Virtual DOM?", back: "A lightweight JavaScript representation of the actual DOM that React uses to optimize updates.", order: 2, lessonId: lesson1.id },
      { front: "What does useState return?", back: "An array with two elements: the current state value and a function to update it.", order: 0, lessonId: lesson3.id },
      { front: "When does useEffect run?", back: "After the component renders. The dependency array controls when it re-runs.", order: 1, lessonId: lesson3.id },
    ],
  });

  // Create enrollments
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course1.id } },
    update: {},
    create: { userId: student.id, courseId: course1.id, progress: 35 },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course2.id } },
    update: {},
    create: { userId: student.id, courseId: course2.id, progress: 10 },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student2.id, courseId: course1.id } },
    update: {},
    create: { userId: student2.id, courseId: course1.id, progress: 80 },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student2.id, courseId: course3.id } },
    update: {},
    create: { userId: student2.id, courseId: course3.id, progress: 60 },
  });

  // Create reviews
  await prisma.review.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course1.id } },
    update: {},
    create: { userId: student.id, courseId: course1.id, rating: 5, comment: "Excellent course! The explanations are clear and the projects are practical." },
  });

  await prisma.review.upsert({
    where: { userId_courseId: { userId: student2.id, courseId: course1.id } },
    update: {},
    create: { userId: student2.id, courseId: course1.id, rating: 4, comment: "Great content, would love more advanced examples." },
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { userId: student.id, type: "ENROLLMENT", title: "Welcome!", message: "You have been enrolled in React 19 Masterclass." },
      { userId: student.id, type: "ACHIEVEMENT", title: "5-Day Streak!", message: "You've been learning for 5 days in a row. Keep it up!" },
      { userId: instructor.id, type: "ENROLLMENT", title: "New Student", message: "John Doe has enrolled in your React 19 Masterclass." },
    ],
  });

  console.log("Seed completed successfully!");
  console.log("\nTest accounts:");
  console.log("  Admin:      admin@lms.dev / password123");
  console.log("  Instructor: instructor@lms.dev / password123");
  console.log("  Student:    student@lms.dev / password123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
