# LMS Codebase Analysis & Build Plan

## Current State Assessment

### Existing Tech Stack
- **Backend**: Fastify + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: React 19 + Vite + TanStack Router + Tailwind CSS + shadcn/ui components
- **Authentication**: JWT with bcrypt password hashing
- **State Management**: Zustand + React Query (TanStack Query)
- **Storage**: AWS S3 (for file uploads)
- **Queue**: BullMQ + Redis (for background jobs)
- **Real-time**: WebSockets (Fastify WebSocket plugin)

### Existing Features
✅ Authentication system (login, register, JWT)
✅ Course management (CRUD operations)
✅ Module and lesson structure
✅ Enrollment system
✅ Progress tracking (LessonProgress model)
✅ Quiz system (quizzes, submissions, grading)
✅ Flashcard system
✅ Note-taking functionality
✅ Review and rating system
✅ Certificate generation
✅ Notification system
✅ Course builder interface
✅ Instructor dashboard
✅ Admin panel (basic)
✅ AI-powered features (tutor, grader, course generator)

### Missing Features for Institutional LMS
❌ Academic Level system (Grade 7-12, College 1st-4th Year)
❌ Section management (e.g., "Grade 9 - Section A")
❌ Teacher role (currently only SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT)
❌ YouTube tutorial integration with metadata fetching
❌ Academic level toggle/selector
❌ User management by academic level and section
❌ Institution-specific branding (currently marketplace-style)
❌ No self-registration option (admin creates all accounts)
❌ Institution-wide announcements
❌ Academic-level-based course assignment
❌ Student assignment to sections

## Required Changes & Enhancements

### Phase 1: Database Schema Updates

#### New Models to Add:
1. **AcademicLevel**
   - id, type (HIGH_SCHOOL | COLLEGE), grade_label (e.g., "Grade 7", "1st Year")
   - school_year, is_active
   - Order index for sorting

2. **Section**
   - id, name (e.g., "Section A", "BSCS Block 1")
   - academic_level_id
   - school_year, semester (for college)
   - capacity, current_enrollment

3. **AnnouncementCourse** (junction table)
   - announcement_id, course_id
   - For course-specific announcements

#### Existing Models to Modify:
1. **User**
   - Add: academic_level_id, section_id
   - Add: date_of_birth, student_id_number
   - Modify: Role enum to include TEACHER

2. **Course**
   - Add: academic_level_ids (array), section_ids (array)
   - Add: subject_code (e.g., "MATH101")
   - Add: is_institution_course (boolean)

3. **Lesson**
   - Add: content_type (VIDEO | PDF | TEXT | YOUTUBE)
   - Add: duration (in minutes)
   - Add: youtube_video_id, youtube_thumbnail, youtube_embed_url

4. **Enrollment**
   - Add: section_id (to track which section student is in)

5. **Announcement**
   - Add: course_id (nullable, for course-specific)
   - Add: is_institution_wide (boolean)
   - Add: scheduled_for (DateTime, optional)

### Phase 2: Backend API Updates

#### New Endpoints Needed:
```
ACADEMIC LEVELS
GET    /api/academic-levels
POST   /api/academic-levels
PUT    /api/academic-levels/:id
DELETE /api/academic-levels/:id

SECTIONS
GET    /api/sections
POST   /api/sections
PUT    /api/sections/:id
DELETE /api/sections/:id
GET    /api/academic-levels/:id/sections

YOUTUBE
POST   /api/youtube/fetch-metadata  -> { url } -> returns title, thumbnail, duration
POST   /api/lessons/:id/youtube     -> Attach YouTube to lesson

ENROLLMENTS (enhanced)
POST   /api/enrollments/bulk       -> Bulk enroll students by section
GET    /api/courses/:id/sections    -> Get sections enrolled in course
```

#### Modify Existing Endpoints:
- `/api/courses` - Add filtering by academic level and section
- `/api/users` - Add filtering by academic level, section, role
- `/api/courses` - Add subject_code and institutional course fields

### Phase 3: Frontend Updates

#### New Pages Needed:
1. **Admin Panel Enhancements**
   - `/admin/levels` - Academic level manager
   - `/admin/sections` - Section management
   - `/admin/youtube` - YouTube tutorial publisher
   - Enhanced user management with academic level/section filters
   - Enhanced course builder with academic level assignment

2. **Teacher Portal Enhancements**
   - Course assignment to academic levels and sections
   - Section-based student view
   - YouTube lesson creation

3. **Student Dashboard Enhancements**
   - Display academic level and section
   - Filter courses by enrolled section
   - Enhanced lesson player with YouTube embed
   - Section-specific announcements

#### Component Enhancements:
- Academic level toggle/selector component
- Section selector component
- YouTube embed player component
- Enhanced course card with academic level display
- Section management table

### Phase 4: UI/UX Updates

#### Design System Enhancements:
- Institution-branded login page (no marketplace styling)
- Academic level visual indicators
- Section badges
- Enhanced dark/light mode with institutional colors
- Institution-specific theming options

### Phase 5: Deployment & Configuration

#### DevOps Updates:
- Update seed script with sample academic levels and sections
- Add institution configuration (name, logo, branding)
- Update deployment documentation for institutional setup
- Add first-time admin setup wizard

## Implementation Priority

### High Priority (Phase 1-2)
1. Database schema updates (AcademicLevel, Section models)
2. Backend API endpoints for academic levels and sections
3. User model updates (academic_level_id, section_id)
4. Course model updates (subject_code, academic level assignment)
5. YouTube metadata fetching API

### Medium Priority (Phase 3)
6. Admin academic level manager
7. Admin section manager
8. Enhanced user management
9. Enhanced course builder
10. YouTube tutorial publisher

### Lower Priority (Phase 4-5)
11. Teacher portal enhancements
12. Student dashboard enhancements
13. Institution branding
14. Deployment documentation

## Migration Strategy

1. **Database Migration**: Create Prisma migration for new models
2. **Backward Compatibility**: Maintain existing API endpoints
3. **Gradual Rollout**: Add new features incrementally
4. **Data Migration Script**: Migrate existing users to default academic level
5. **Testing**: Comprehensive testing of academic level and section logic

## Success Criteria

✅ Admin can create and manage academic levels (Grade 7-12, 1st-4th Year)
✅ Admin can create and manage sections per academic level
✅ Admin can assign academic levels and sections to users
✅ Teachers can be assigned to specific courses with academic level context
✅ Students see their academic level and section in dashboard
✅ Courses can be filtered by academic level and section
✅ YouTube videos can be embedded with automatic metadata fetching
✅ Institution-specific branding replaces marketplace styling
✅ No self-registration (admin creates all accounts)
✅ Role-based access control (ADMIN, TEACHER, STUDENT)

## Notes

- The existing codebase is well-structured and modular
- Prisma schema changes require careful migration
- Frontend routing is clean and can accommodate new routes
- Authentication system is solid and can be extended
- The build follows the orchestration plan's tech stack requirements