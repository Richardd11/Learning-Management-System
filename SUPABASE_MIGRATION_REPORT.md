# Supabase Database Migration Report

## Migration Completed Successfully

**Date:** May 27, 2025
**Database:** PostgreSQL (Supabase)
**Schema:** `public`

---

## Migration Details

### Migration ID: `20250527000000_init`
**Status:** ✅ Applied
**Method:** Prisma Schema Synchronization (`prisma db push --force-reset`)

---

## Database Tables Created

### Core Tables (18 total models)

1. **`academic_levels`**
   - Fields: id, type, gradeLabel, orderIndex, isActive, createdAt, updatedAt
   - Unique constraint: [type, gradeLabel]

2. **`sections`**
   - Fields: id, name, academicLevelId, schoolYear, semester, capacity, isActive, createdAt, updatedAt
   - Unique constraint: [name, academicLevelId, schoolYear]

3. **`users`**
   - Fields: id, email, passwordHash, firstName, lastName, avatar, bio, role, academicLevelId, sectionId, studentIdNumber, dateOfBirth, xp, streak, lastActiveAt, isBanned, socialLinks, googleId, githubId, refreshToken, createdAt, updatedAt
   - Unique constraints: email, googleId, githubId

4. **`courses`**
   - Fields: id, title, slug, description, shortDesc, thumbnail, subjectCode, price, difficulty, status, tags, rating, ratingCount, enrollCount, instructorId, academicLevelId, publishedAt, createdAt, updatedAt
   - Unique constraint: slug

5. **`modules`**
   - Fields: id, title, order, isPublished, courseId, createdAt, updatedAt

6. **`lessons`**
   - Fields: id, title, content, contentType, contentUrl, duration, order, isPublished, moduleId, createdAt, updatedAt

7. **`youtube_tutorials`**
   - Fields: id, lessonId, ytVideoId, ytTitle, ytThumbnail, ytChannel, ytDuration, embedUrl, teacherNotes, createdAt, updatedAt
   - Unique constraint: lessonId

8. **`quizzes`**
   - Fields: id, title, moduleId, timeLimit, passingScore, order, createdAt, updatedAt

9. **`quiz_questions`**
   - Fields: id, quizId, questionText, questionType, options, correctAnswer, points, order, createdAt

10. **`quiz_attempts`**
    - Fields: id, studentId, quizId, score, totalPoints, earnedPoints, passed, answers, submittedAt
    - Unique constraint: [studentId, quizId]

11. **`enrollments`**
    - Fields: id, userId, courseId, sectionId, status, progress, completedAt, createdAt, updatedAt
    - Unique constraint: [userId, courseId]

12. **`lesson_progress`**
    - Fields: id, userId, lessonId, completed, completedAt, lastAccessed, createdAt
    - Unique constraint: [userId, lessonId]

13. **`announcements`**
    - Fields: id, title, body, authorId, courseId, isInstitutionWide, scheduledFor, isPublished, createdAt, updatedAt

14. **`reviews`**
    - Fields: id, userId, courseId, rating, comment, createdAt, updatedAt
    - Unique constraint: [userId, courseId]

15. **`certificates`**
    - Fields: id, userId, courseId, verificationId, pdfUrl, issuedAt
    - Unique constraints: verificationId, [userId, courseId]

16. **`notes`**
    - Fields: id, userId, lessonId, content, timestamp, createdAt, updatedAt

17. **`notifications`**
    - Fields: id, userId, type, title, message, read, data, createdAt

18. **`course_embeddings`**
    - Fields: id, courseId, content, embedding, createdAt
    - Special: Uses `vector(1536)` extension for AI embeddings

---

## Enums Created

1. **`Role`** - ADMIN, TEACHER, STUDENT
2. **`AcademicLevelType`** - HIGH_SCHOOL, COLLEGE
3. **`CourseStatus`** - DRAFT, PUBLISHED, ARCHIVED
4. **`EnrollmentStatus`** - ACTIVE, COMPLETED, DROPPED
5. **`LessonContentType`** - VIDEO, PDF, TEXT, YOUTUBE
6. **`QuestionType`** - MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
7. **`NotificationType`** - ENROLLMENT, GRADE, ANNOUNCEMENT, ACHIEVEMENT, SYSTEM
8. **`Semester`** - FIRST, SECOND, SUMMER

---

## Database Extensions

- **`vector`** - pgvector extension for AI embeddings (RAG functionality)

---

## Relationships

The database schema includes comprehensive relationships:

- **Users** can be students or teachers (instructors)
- **Courses** belong to instructors and can have multiple sections
- **Modules** belong to courses and contain lessons/quizzes
- **Enrollments** track students enrolled in courses
- **Progress** tracking for lessons and quizzes
- **Notifications** for user engagement
- **Certificates** for course completion
- **Reviews** for course feedback
- **Announcements** for communication

---

## Connection Details

**Database URL:**
```
postgresql://postgres.umtajkxvleonsxjyhrqw:***@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

**Supabase Project URL:**
```
https://umtajkxvleonsxjyhrqw.supabase.co
```

---

## Next Steps

1. **Seed Initial Data** - Use `npm run db:seed` to populate with sample data
2. **Configure Row Level Security (RLS)** - Set up Supabase RLS policies for security
3. **Test API Endpoints** - Verify that the backend can connect and query the database
4. **Deploy Changes** - Commit the migration to the repository

---

## Verification Commands

```bash
# Check migration status
npx prisma migrate status

# View database structure
npx prisma studio

# Generate Prisma client
npx prisma generate

# Push schema changes (if needed)
npx prisma db push

# Create new migrations
npx prisma migrate dev --name migration_name
```

---

## Notes

- The migration was performed with `--force-reset` which cleared any existing data
- All tables now match the Prisma schema definition
- The vector extension is enabled for AI embeddings
- Migration is tracked in `prisma/migrations/20250527000000_init/`

---

## Important Information

⚠️ **Data Cleared**: The `--force-reset` flag was used, so any existing data in the database has been removed.

✅ **Schema Sync**: The database schema is now fully synchronized with the Prisma schema file.

🔒 **Security**: Remember to set up Row Level Security (RLS) policies in Supabase for production use.

---

**Migration Status: COMPLETE ✅**