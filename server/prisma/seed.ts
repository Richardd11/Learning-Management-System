import { PrismaClient, AcademicLevelType, Semester, Role, CourseStatus, LessonContentType, QuestionType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.courseEmbedding.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.note.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.review.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.youtubeTutorial.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.section.deleteMany();
  await prisma.user.deleteMany();
  await prisma.academicLevel.deleteMany();

  // ── Academic Levels ─────────────────────────────────────────────
  console.log("Creating academic levels...");

  const highSchoolLevels = await Promise.all([
    prisma.academicLevel.create({ data: { type: AcademicLevelType.HIGH_SCHOOL, gradeLabel: "Grade 7", orderIndex: 0 } }),
    prisma.academicLevel.create({ data: { type: AcademicLevelType.HIGH_SCHOOL, gradeLabel: "Grade 8", orderIndex: 1 } }),
    prisma.academicLevel.create({ data: { type: AcademicLevelType.HIGH_SCHOOL, gradeLabel: "Grade 9", orderIndex: 2 } }),
    prisma.academicLevel.create({ data: { type: AcademicLevelType.HIGH_SCHOOL, gradeLabel: "Grade 10", orderIndex: 3 } }),
    prisma.academicLevel.create({ data: { type: AcademicLevelType.HIGH_SCHOOL, gradeLabel: "Grade 11", orderIndex: 4 } }),
    prisma.academicLevel.create({ data: { type: AcademicLevelType.HIGH_SCHOOL, gradeLabel: "Grade 12", orderIndex: 5 } }),
  ]);

  const collegeLevels = await Promise.all([
    prisma.academicLevel.create({ data: { type: AcademicLevelType.COLLEGE, gradeLabel: "1st Year", orderIndex: 0 } }),
    prisma.academicLevel.create({ data: { type: AcademicLevelType.COLLEGE, gradeLabel: "2nd Year", orderIndex: 1 } }),
    prisma.academicLevel.create({ data: { type: AcademicLevelType.COLLEGE, gradeLabel: "3rd Year", orderIndex: 2 } }),
    prisma.academicLevel.create({ data: { type: AcademicLevelType.COLLEGE, gradeLabel: "4th Year", orderIndex: 3 } }),
  ]);

  // ── Sections ─────────────────────────────────────────────────────
  console.log("Creating sections...");

  const schoolYear = "2024-2025";

  const sections = await Promise.all([
    // High School Sections
    prisma.section.create({ data: { name: "Section A", academicLevelId: highSchoolLevels[2].id, schoolYear, capacity: 40 } }),
    prisma.section.create({ data: { name: "Section B", academicLevelId: highSchoolLevels[2].id, schoolYear, capacity: 40 } }),
    prisma.section.create({ data: { name: "Section A", academicLevelId: highSchoolLevels[3].id, schoolYear, capacity: 35 } }),
    prisma.section.create({ data: { name: "Section A", academicLevelId: highSchoolLevels[4].id, schoolYear, capacity: 35 } }),
    prisma.section.create({ data: { name: "Section A", academicLevelId: highSchoolLevels[5].id, schoolYear, capacity: 35 } }),
    // College Sections
    prisma.section.create({ data: { name: "BSCS Block 1", academicLevelId: collegeLevels[0].id, schoolYear, semester: Semester.FIRST, capacity: 30 } }),
    prisma.section.create({ data: { name: "BSIT Block 1", academicLevelId: collegeLevels[0].id, schoolYear, semester: Semester.FIRST, capacity: 30 } }),
    prisma.section.create({ data: { name: "BSCS Block 1", academicLevelId: collegeLevels[1].id, schoolYear, semester: Semester.FIRST, capacity: 30 } }),
    prisma.section.create({ data: { name: "BSCS Block 1", academicLevelId: collegeLevels[2].id, schoolYear, semester: Semester.FIRST, capacity: 30 } }),
  ]);

  // ── Users ────────────────────────────────────────────────────────
  console.log("Creating users...");

  const passwordHash = await hash("password123", 12);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@school.edu",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: Role.ADMIN,
    },
  });

  // Teachers
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        email: "maria.garcia@school.edu",
        passwordHash,
        firstName: "Maria",
        lastName: "Garcia",
        role: Role.TEACHER,
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Maria",
      },
    }),
    prisma.user.create({
      data: {
        email: "john.smith@school.edu",
        passwordHash,
        firstName: "John",
        lastName: "Smith",
        role: Role.TEACHER,
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=John",
      },
    }),
    prisma.user.create({
      data: {
        email: "ana.reyes@school.edu",
        passwordHash,
        firstName: "Ana",
        lastName: "Reyes",
        role: Role.TEACHER,
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Ana",
      },
    }),
  ]);

  // Students
  const students = await Promise.all([
    // Grade 9 - Section A students
    prisma.user.create({
      data: {
        email: "juan.delacruz@school.edu",
        passwordHash,
        firstName: "Juan",
        lastName: "Dela Cruz",
        role: Role.STUDENT,
        academicLevelId: highSchoolLevels[2].id,
        sectionId: sections[0].id,
        studentIdNumber: "2024-09001",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Juan",
      },
    }),
    prisma.user.create({
      data: {
        email: "pedro.santos@school.edu",
        passwordHash,
        firstName: "Pedro",
        lastName: "Santos",
        role: Role.STUDENT,
        academicLevelId: highSchoolLevels[2].id,
        sectionId: sections[0].id,
        studentIdNumber: "2024-09002",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Pedro",
      },
    }),
    prisma.user.create({
      data: {
        email: "maria.clara@school.edu",
        passwordHash,
        firstName: "Maria",
        lastName: "Clara",
        role: Role.STUDENT,
        academicLevelId: highSchoolLevels[2].id,
        sectionId: sections[0].id,
        studentIdNumber: "2024-09003",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Clara",
      },
    }),
    // Grade 10 - Section A students
    prisma.user.create({
      data: {
        email: "rico.bautista@school.edu",
        passwordHash,
        firstName: "Rico",
        lastName: "Bautista",
        role: Role.STUDENT,
        academicLevelId: highSchoolLevels[3].id,
        sectionId: sections[2].id,
        studentIdNumber: "2024-10001",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Rico",
      },
    }),
    // 1st Year College - BSCS Block 1 students
    prisma.user.create({
      data: {
        email: "carlos.villanueva@school.edu",
        passwordHash,
        firstName: "Carlos",
        lastName: "Villanueva",
        role: Role.STUDENT,
        academicLevelId: collegeLevels[0].id,
        sectionId: sections[5].id,
        studentIdNumber: "2024-CS001",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Carlos",
      },
    }),
    prisma.user.create({
      data: {
        email: "sophia.lim@school.edu",
        passwordHash,
        firstName: "Sophia",
        lastName: "Lim",
        role: Role.STUDENT,
        academicLevelId: collegeLevels[0].id,
        sectionId: sections[5].id,
        studentIdNumber: "2024-CS002",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sophia",
      },
    }),
    // 2nd Year College - BSCS Block 1
    prisma.user.create({
      data: {
        email: "alex.tan@school.edu",
        passwordHash,
        firstName: "Alex",
        lastName: "Tan",
        role: Role.STUDENT,
        academicLevelId: collegeLevels[1].id,
        sectionId: sections[7].id,
        studentIdNumber: "2023-CS015",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex",
      },
    }),
  ]);

  // ── Courses ─────────────────────────────────────────────────────
  console.log("Creating courses...");

  const courseMath9 = await prisma.course.create({
    data: {
      title: "Mathematics 9",
      slug: "mathematics-9",
      description: "A comprehensive course covering algebra, geometry, and statistics for Grade 9 students. Students will develop critical thinking skills through problem-solving and real-world applications.",
      shortDesc: "Algebra, Geometry & Statistics for Grade 9",
      subjectCode: "MATH9",
      difficulty: "intermediate",
      status: CourseStatus.PUBLISHED,
      instructorId: teachers[0].id,
      academicLevelId: highSchoolLevels[2].id,
      enrollCount: 3,
      publishedAt: new Date(),
      sections: { connect: [{ id: sections[0].id }, { id: sections[1].id }] },
    },
  });

  const courseEnglish9 = await prisma.course.create({
    data: {
      title: "English 9",
      slug: "english-9",
      description: "Develop reading, writing, and communication skills through literature analysis, essay writing, and oral presentations.",
      shortDesc: "Reading, Writing & Communication for Grade 9",
      subjectCode: "ENG9",
      difficulty: "beginner",
      status: CourseStatus.PUBLISHED,
      instructorId: teachers[1].id,
      academicLevelId: highSchoolLevels[2].id,
      enrollCount: 2,
      publishedAt: new Date(),
      sections: { connect: [{ id: sections[0].id }] },
    },
  });

  const courseCS101 = await prisma.course.create({
    data: {
      title: "Introduction to Computer Science",
      slug: "intro-computer-science",
      description: "An introductory course covering programming fundamentals, data structures, and algorithms. Designed for first-year college students in the BSCS program.",
      shortDesc: "Programming Fundamentals for 1st Year CS",
      subjectCode: "CS101",
      difficulty: "beginner",
      status: CourseStatus.PUBLISHED,
      instructorId: teachers[2].id,
      academicLevelId: collegeLevels[0].id,
      enrollCount: 2,
      publishedAt: new Date(),
      sections: { connect: [{ id: sections[5].id }] },
    },
  });

  const courseDataStructures = await prisma.course.create({
    data: {
      title: "Data Structures and Algorithms",
      slug: "data-structures-algorithms",
      description: "Advanced study of data structures including trees, graphs, hash tables, and algorithm design techniques.",
      shortDesc: "Advanced Data Structures for 2nd Year CS",
      subjectCode: "CS201",
      difficulty: "advanced",
      status: CourseStatus.PUBLISHED,
      instructorId: teachers[2].id,
      academicLevelId: collegeLevels[1].id,
      enrollCount: 1,
      publishedAt: new Date(),
      sections: { connect: [{ id: sections[7].id }] },
    },
  });

  const courseScience10 = await prisma.course.create({
    data: {
      title: "Science 10",
      slug: "science-10",
      description: "Earth and Space Science, including geology, meteorology, astronomy, and environmental science for Grade 10 students.",
      shortDesc: "Earth & Space Science for Grade 10",
      subjectCode: "SCI10",
      difficulty: "intermediate",
      status: CourseStatus.DRAFT,
      instructorId: teachers[0].id,
      academicLevelId: highSchoolLevels[3].id,
      sections: { connect: [{ id: sections[2].id }] },
    },
  });

  // ── Modules & Lessons ──────────────────────────────────────────
  console.log("Creating modules and lessons...");

  // Math 9 modules
  const mathMod1 = await prisma.module.create({
    data: { title: "Module 1: Algebra Fundamentals", order: 0, isPublished: true, courseId: courseMath9.id },
  });

  const mathMod2 = await prisma.module.create({
    data: { title: "Module 2: Linear Equations", order: 1, isPublished: true, courseId: courseMath9.id },
  });

  const mathMod3 = await prisma.module.create({
    data: { title: "Module 3: Geometry Basics", order: 2, isPublished: false, courseId: courseMath9.id },
  });

  // Math 9 lessons
  await Promise.all([
    prisma.lesson.create({
      data: {
        title: "Introduction to Variables and Expressions",
        content: "<h2>Understanding Variables</h2><p>In algebra, a variable is a symbol used to represent an unknown number. The most common variables are x, y, and z.</p><p>An algebraic expression combines variables, numbers, and operations. For example: <strong>3x + 5</strong> is an algebraic expression where 3 is the coefficient, x is the variable, and 5 is the constant.</p>",
        contentType: LessonContentType.TEXT,
        order: 0,
        isPublished: true,
        moduleId: mathMod1.id,
        duration: 30,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Solving One-Step Equations",
        content: "<h2>One-Step Equations</h2><p>A one-step equation requires only one operation to solve. The goal is to isolate the variable on one side of the equation.</p>",
        contentType: LessonContentType.TEXT,
        order: 1,
        isPublished: true,
        moduleId: mathMod1.id,
        duration: 25,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Solving Two-Step Equations - Video Tutorial",
        contentType: LessonContentType.YOUTUBE,
        contentUrl: "https://www.youtube.com/watch?v=_y46x2gAH6k",
        order: 2,
        isPublished: true,
        moduleId: mathMod1.id,
        duration: 15,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Understanding Linear Equations",
        content: "<h2>What is a Linear Equation?</h2><p>A linear equation is an equation that forms a straight line when graphed. The standard form is <strong>y = mx + b</strong>, where m is the slope and b is the y-intercept.</p>",
        contentType: LessonContentType.TEXT,
        order: 0,
        isPublished: true,
        moduleId: mathMod2.id,
        duration: 35,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Graphing Linear Equations",
        contentType: LessonContentType.VIDEO,
        contentUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        order: 1,
        isPublished: true,
        moduleId: mathMod2.id,
        duration: 20,
      },
    }),
  ]);

  // Add YouTube tutorial to the YouTube lesson
  const ytLesson = await prisma.lesson.findFirst({
    where: { moduleId: mathMod1.id, contentType: LessonContentType.YOUTUBE },
  });
  if (ytLesson) {
    await prisma.youtubeTutorial.create({
      data: {
        lessonId: ytLesson.id,
        ytVideoId: "_y46x2gAH6k",
        ytTitle: "Solving Two-Step Equations | Algebra",
        ytThumbnail: "https://img.youtube.com/vi/_y46x2gAH6k/hqdefault.jpg",
        ytChannel: "Math Antics",
        ytDuration: "PT11M32S",
        embedUrl: "https://www.youtube.com/embed/_y46x2gAH6k",
        teacherNotes: "Make sure students understand the concept of inverse operations before watching this video. Pause at key examples for class discussion.",
      },
    });
  }

  // CS101 modules
  const csMod1 = await prisma.module.create({
    data: { title: "Module 1: Introduction to Programming", order: 0, isPublished: true, courseId: courseCS101.id },
  });

  const csMod2 = await prisma.module.create({
    data: { title: "Module 2: Variables and Data Types", order: 1, isPublished: true, courseId: courseCS101.id },
  });

  // CS101 lessons
  await Promise.all([
    prisma.lesson.create({
      data: {
        title: "What is Programming?",
        content: "<h2>Introduction to Programming</h2><p>Programming is the process of writing instructions for a computer to execute. These instructions are written in programming languages like Python, Java, and JavaScript.</p>",
        contentType: LessonContentType.TEXT,
        order: 0,
        isPublished: true,
        moduleId: csMod1.id,
        duration: 20,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Setting Up Your Development Environment",
        contentType: LessonContentType.YOUTUBE,
        contentUrl: "https://www.youtube.com/watch?v=1fM8dJ7zPB8",
        order: 1,
        isPublished: true,
        moduleId: csMod1.id,
        duration: 15,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Course Syllabus and Overview",
        contentType: LessonContentType.PDF,
        contentUrl: "https://example.com/syllabus.pdf",
        order: 2,
        isPublished: true,
        moduleId: csMod1.id,
        duration: 10,
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Variables and Data Types in Python",
        content: "<h2>Variables</h2><p>A variable is a named container for storing data values. In Python, you don't need to declare a variable type explicitly.</p><pre><code>x = 5\nname = 'Alice'\npi = 3.14159</code></pre>",
        contentType: LessonContentType.TEXT,
        order: 0,
        isPublished: true,
        moduleId: csMod2.id,
        duration: 30,
      },
    }),
  ]);

  // Add YouTube tutorial for CS101
  const csYtLesson = await prisma.lesson.findFirst({
    where: { moduleId: csMod1.id, contentType: LessonContentType.YOUTUBE },
  });
  if (csYtLesson) {
    await prisma.youtubeTutorial.create({
      data: {
        lessonId: csYtLesson.id,
        ytVideoId: "1fM8dJ7zPB8",
        ytTitle: "Python Setup Tutorial",
        ytThumbnail: "https://img.youtube.com/vi/1fM8dJ7zPB8/hqdefault.jpg",
        ytChannel: "Programming with Mosh",
        ytDuration: "PT15M45S",
        embedUrl: "https://www.youtube.com/embed/1fM8dJ7zPB8",
        teacherNotes: "Students should follow along and install Python on their machines. Ensure they have Python 3.11+ installed.",
      },
    });
  }

  // ── Quizzes ─────────────────────────────────────────────────────
  console.log("Creating quizzes...");

  const mathQuiz1 = await prisma.quiz.create({
    data: {
      title: "Algebra Fundamentals Quiz",
      moduleId: mathMod1.id,
      timeLimit: 20,
      passingScore: 60,
      order: 0,
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: mathQuiz1.id,
        questionText: "What is the value of x in the equation 2x + 3 = 11?",
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: JSON.stringify(["2", "4", "5", "7"]),
        correctAnswer: "1", // Index 1 = "4"
        points: 2,
        order: 0,
      },
      {
        quizId: mathQuiz1.id,
        questionText: "A variable represents an unknown value.",
        questionType: QuestionType.TRUE_FALSE,
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "0", // Index 0 = "True"
        points: 1,
        order: 1,
      },
      {
        quizId: mathQuiz1.id,
        questionText: "Simplify the expression: 3x + 2x",
        questionType: QuestionType.SHORT_ANSWER,
        correctAnswer: "5x",
        points: 2,
        order: 2,
      },
      {
        quizId: mathQuiz1.id,
        questionText: "Which of the following is a coefficient in 5y + 3?",
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: JSON.stringify(["5", "y", "3", "+"]),
        correctAnswer: "0", // Index 0 = "5"
        points: 1,
        order: 3,
      },
    ],
  });

  const csQuiz1 = await prisma.quiz.create({
    data: {
      title: "Introduction to Programming Quiz",
      moduleId: csMod1.id,
      timeLimit: 15,
      passingScore: 70,
      order: 0,
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: csQuiz1.id,
        questionText: "Which of the following is a programming language?",
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: JSON.stringify(["HTML", "Python", "HTTP", "CSS"]),
        correctAnswer: "1", // Python
        points: 2,
        order: 0,
      },
      {
        quizId: csQuiz1.id,
        questionText: "A compiler translates source code to machine code.",
        questionType: QuestionType.TRUE_FALSE,
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "0",
        points: 1,
        order: 1,
      },
      {
        quizId: csQuiz1.id,
        questionText: "Name one high-level programming language.",
        questionType: QuestionType.SHORT_ANSWER,
        correctAnswer: "Python",
        points: 2,
        order: 2,
      },
    ],
  });

  // ── Enrollments ─────────────────────────────────────────────────
  console.log("Creating enrollments...");

  // Enroll Grade 9 students in Math 9
  for (const student of students.slice(0, 3)) {
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: courseMath9.id,
        sectionId: sections[0].id,
        status: "ACTIVE",
        progress: Math.random() * 60,
      },
    });
  }

  // Enroll Grade 9 students in English 9
  for (const student of students.slice(0, 2)) {
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: courseEnglish9.id,
        sectionId: sections[0].id,
        status: "ACTIVE",
        progress: Math.random() * 40,
      },
    });
  }

  // Enroll 1st Year College students in CS101
  for (const student of students.slice(4, 6)) {
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: courseCS101.id,
        sectionId: sections[5].id,
        status: "ACTIVE",
        progress: Math.random() * 50,
      },
    });
  }

  // Enroll 2nd Year College student in Data Structures
  await prisma.enrollment.create({
    data: {
      userId: students[6].id,
      courseId: courseDataStructures.id,
      sectionId: sections[7].id,
      status: "ACTIVE",
      progress: Math.random() * 30,
    },
  });

  // ── Lesson Progress ─────────────────────────────────────────────
  console.log("Creating lesson progress...");

  const mathLessons = await prisma.lesson.findMany({
    where: { module: { courseId: courseMath9.id } },
  });

  // Add some progress for the first student
  for (let i = 0; i < Math.min(3, mathLessons.length); i++) {
    await prisma.lessonProgress.create({
      data: {
        userId: students[0].id,
        lessonId: mathLessons[i].id,
        completed: i < 2, // First 2 completed, 3rd in progress
        completedAt: i < 2 ? new Date() : null,
        lastAccessed: new Date(),
      },
    });
  }

  // ── Announcements ──────────────────────────────────────────────
  console.log("Creating announcements...");

  await prisma.announcement.createMany({
    data: [
      {
        title: "Welcome to the New School Year 2024-2025!",
        body: "We are excited to welcome all students and teachers to the new academic year. Please check your enrolled courses for updated materials and schedules. Should you have any questions, reach out to your assigned teacher or the admin office.",
        authorId: admin.id,
        isInstitutionWide: true,
        isPublished: true,
      },
      {
        title: "Algebra Quiz Schedule",
        body: "The Algebra Fundamentals Quiz for Mathematics 9 is scheduled for next week. Please review Module 1 lessons before attempting the quiz. Time limit: 20 minutes. Passing score: 60%.",
        authorId: teachers[0].id,
        courseId: courseMath9.id,
        isPublished: true,
      },
      {
        title: "Python Development Environment Setup",
        body: "All CS101 students must have Python 3.11+ installed on their machines by the end of this week. Follow the video tutorial in Module 1 for step-by-step instructions. Lab sessions are available on Wednesdays for those who need help.",
        authorId: teachers[2].id,
        courseId: courseCS101.id,
        isPublished: true,
      },
      {
        title: "Midterm Examination Schedule",
        body: "Midterm examinations will be held from October 14-18, 2024. Check your course pages for specific schedules and coverage. Study hard and good luck!",
        authorId: admin.id,
        isInstitutionWide: true,
        scheduledFor: new Date("2024-10-01"),
        isPublished: true,
      },
    ],
  });

  // ── Notifications ──────────────────────────────────────────────
  console.log("Creating notifications...");

  await prisma.notification.createMany({
    data: [
      {
        userId: students[0].id,
        type: "ENROLLMENT",
        title: "Course Enrollment Confirmed",
        message: "You have been enrolled in Mathematics 9 — Grade 9, Section A",
      },
      {
        userId: students[0].id,
        type: "ANNOUNCEMENT",
        title: "New Announcement",
        message: "Algebra Quiz Schedule — Check the Math 9 course page for details",
      },
      {
        userId: students[4].id,
        type: "ENROLLMENT",
        title: "Course Enrollment Confirmed",
        message: "You have been enrolled in Introduction to Computer Science — 1st Year, BSCS Block 1",
      },
    ],
  });

  console.log("✅ Seeding complete!");
  console.log(`  📊 Academic Levels: ${highSchoolLevels.length + collegeLevels.length}`);
  console.log(`  📂 Sections: ${sections.length}`);
  console.log(`  👥 Users: ${1 + teachers.length + students.length} (1 admin, ${teachers.length} teachers, ${students.length} students)`);
  console.log(`  📚 Courses: 5`);
  console.log(`  📝 Quizzes: 2`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
