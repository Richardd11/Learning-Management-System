# LearnHub — AI-Powered Learning Management System

A production-grade, full-stack Learning Management System with AI-powered course generation, intelligent tutoring, automated grading, and rich interactive content.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Fastify](https://img.shields.io/badge/Fastify-5-green)
![Prisma](https://img.shields.io/badge/Prisma-6-purple)

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Fastify API    │────▶│  PostgreSQL     │
│   (Vite + TS)   │     │  + WebSocket    │     │  + pgvector     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼             ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │  Redis   │ │ BullMQ   │ │ MinIO/S3 │
              │ (cache)  │ │ (queues) │ │ (files)  │
              └──────────┘ └──────────┘ └──────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼             ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │AI Course │ │AI Grader │ │AI Tutor  │
              │Generator │ │          │ │Chatbot   │
              └──────────┘ └──────────┘ └──────────┘
```

## Tech Stack

### Frontend
- **React 19** with TypeScript strict mode
- **TanStack Router** — type-safe file-based routing
- **TanStack Query v5** — server state, caching, optimistic updates
- **Zustand** — client state management
- **Framer Motion 11** — page transitions, animations, scroll-triggered effects
- **TailwindCSS** + **shadcn/ui** — component library
- **React Hook Form** + **Zod** — form validation
- **Recharts** — analytics dashboards
- **Sonner** — toast notifications
- **next-themes** — dark/light mode

### Backend
- **Node.js + Fastify** — high-performance API server
- **PostgreSQL** + **Prisma ORM** — database with type-safe queries
- **pgvector** — vector embeddings for RAG
- **Redis** — session caching, job queues
- **BullMQ** — async background jobs (email, certificates, AI tasks)
- **S3-compatible storage** (MinIO) — video/file uploads
- **WebSockets** — real-time notifications

### AI Orchestration
- **Anthropic Claude API** — primary LLM (streaming SSE)
- **AI Course Generator** — generates full courses from a topic
- **AI Grader** — rubric-aware assignment grading
- **AI Tutor Chatbot** — per-course RAG chatbot
- **AI Certificate Generator** — auto-generates on completion
- **Progress Summarizer** — weekly instructor digests

### Auth
- JWT + refresh tokens
- OAuth 2.0 (Google, GitHub)
- RBAC: Super Admin, Admin, Instructor, Student

## Pages & Features

| Page | Description |
|------|-------------|
| Landing Page | Hero with gradient text, floating cards, testimonials, pricing, FAQ |
| Auth Pages | Login, Register, Forgot Password with OAuth |
| Student Dashboard | Enrolled courses, progress rings, streaks, XP, AI tutor widget |
| Course Catalog | Filterable, searchable grid with animated cards and pagination |
| Course Detail | Hero banner, curriculum accordion, reviews, enrollment CTA |
| Course Player | Split-panel with content, quizzes, flashcards, notes, progress tracking |
| Course Builder | Drag-and-drop modules/lessons, AI course generation |
| Instructor Dashboard | Revenue charts, enrollment trends, student roster |
| Admin Panel | User management, platform analytics, moderation, announcements |
| Notifications | Real-time bell with unread badge, slide-in drawer |
| Profile & Settings | Avatar, bio, stats, learning history |
| Certificates | Auto-generated certificates with verification links, confetti animation |

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL, Redis, MinIO)

### 1. Clone and install

```bash
git clone https://github.com/Richardd11/Learning-Management-System.git
cd Learning-Management-System
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

### 3. Set up environment

```bash
cp .env.example .env
# Edit .env with your API keys (ANTHROPIC_API_KEY for AI features)
```

### 4. Set up server

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

### 5. Set up client

```bash
cd client
npm install
npm run dev
```

### 6. Open the app

- Frontend: http://localhost:5173
- API: http://localhost:3001
- API Docs: http://localhost:3001/docs

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@lms.dev | password123 |
| Instructor | instructor@lms.dev | password123 |
| Student | student@lms.dev | password123 |

## Environment Variables

See [`.env.example`](.env.example) for all required variables with descriptions.

## Project Structure

```
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   │   ├── ui/          # shadcn primitives (Button, Card, etc.)
│   │   │   └── common/      # Layout, Navbar, Sidebar, ErrorBoundary
│   │   ├── features/        # Feature-based modules
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── landing/     # Landing page
│   │   │   ├── dashboard/   # Student & Instructor dashboards
│   │   │   ├── courses/     # Catalog, Course Detail
│   │   │   ├── player/      # Course Player, AI Chat Widget
│   │   │   ├── builder/     # Course Builder (drag-and-drop)
│   │   │   ├── admin/       # Admin Panel
│   │   │   ├── profile/     # Profile & Settings
│   │   │   ├── certificates/# Certificates page
│   │   │   └── notifications/# Notification drawer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utils, API client
│   │   ├── stores/          # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Global CSS
│   └── ...
├── server/                  # Fastify backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   └── src/
│       ├── agents/          # AI orchestration (Claude API)
│       ├── lib/             # Prisma, Redis, S3, JWT, Queue
│       ├── middleware/       # Auth middleware (RBAC)
│       ├── modules/         # Feature modules (auth, courses, etc.)
│       └── types/           # TypeScript types
├── docker-compose.yml       # PostgreSQL + Redis + MinIO
└── .env.example             # Environment variables template
```

## API Documentation

Auto-generated Swagger/OpenAPI docs available at `http://localhost:3001/docs` when the server is running.

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/courses | List courses (paginated, filterable) |
| GET | /api/courses/:slug | Get course details |
| POST | /api/courses | Create course (instructor) |
| POST | /api/enrollments/:courseId/enroll | Enroll in course |
| POST | /api/enrollments/lessons/:id/complete | Mark lesson complete |
| POST | /api/ai/generate-course | AI course generation (SSE) |
| POST | /api/ai/tutor | AI tutor chat (SSE) |
| POST | /api/ai/grade | AI grading (SSE) |
| GET | /api/admin/stats | Platform analytics |
| POST | /api/notifications/broadcast | Send announcement |

## License

MIT
