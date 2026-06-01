# LearnHub — Information Architecture Specification

> School-implementation LMS landing page. 6 sections. Institutional orientation, not commercial sales.

---

## Design Tokens (sourced from Phase 2 + Phase 3 deep-dives)

### Pattern
Feature-Rich Showcase (Phase 3.1 Result 3) + Bento Grid Showcase (Phase 3.1 Result 5)

### Style
Bento Grid / Modular Cards (Phase 3.2 Result 1)
- Apple-style aesthetic, rounded corners (16-24px), soft shadows, hover scale (1.02)
- Off-white page bg (#F5F5F7 light / dark equivalent), clean white cards

### Color Palette
| Token | Light HSL | Light Hex | Dark HSL | Dark Hex |
|-------|-----------|-----------|----------|----------|
| `--background` | 210 40% 98% | #F8FAFC | 222.2 47% 8% | #0F172A |
| `--foreground` | 222.2 84% 4.9% | #0F172A | 210 40% 98% | #F8FAFC |
| `--primary` | 221 83% 54% | #2563EB | 217 77% 64% | #60A5FA |
| `--primary-foreground` | 0 0% 100% | #FFFFFF | 0 0% 100% | #FFFFFF |
| `--secondary` | 214 32% 91% | #E2E8F0 | 217 33% 17% | #1E293B |
| `--secondary-foreground` | 222 47% 11% | #1E293B | 210 40% 98% | #F8FAFC |
| `--accent` | 214 32% 95% | #F1F5F9 | 217 33% 17% | #1E293B |
| `--accent-foreground` | 221 83% 40% | #1D4ED8 | 217 77% 80% | #BFDBFE |
| `--muted` | 210 40% 96% | #F1F5F9 | 217 33% 14% | #1E293B |
| `--muted-foreground` | 215 16% 47% | #64748B | 215 20% 65% | #94A3B8 |
| `--card` | 0 0% 100% | #FFFFFF | 222 47% 10% | #1E293B |
| `--card-foreground` | 222 84% 4.9% | #0F172A | 210 40% 98% | #F8FAFC |
| `--border` | 214 32% 91% | #E2E8F0 | 217 33% 19% | #334155 |
| `--ring` | 221 83% 54% | #2563EB | 217 77% 64% | #60A5FA |
| `--radius` | 0.75rem | — | 0.75rem | — |

### Typography (Phase 3.4 Result 4 — Modern Professional)
- **Headings:** Poppins (400, 500, 600, 700) — geometric, clean, modern
- **Body:** Open Sans (300, 400, 500, 600, 700) — humanist, highly readable
- Google Fonts URL: `https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap`
- Tailwind: `fontFamily: { heading: ['Poppins', 'sans-serif'], body: ['Open Sans', 'sans-serif'], sans: ['Open Sans', 'sans-serif'] }`

### Key Effects (Phase 2 + Phase 3.2)
- Hover scale (1.02) with smooth transitions (200-300ms)
- Soft shadow expansion on hover
- Content reveal with opacity + y: 20→0 in viewport
- Stagger children with 40ms delay
- `transform` + `opacity` only — no layout animations
- Reduced-motion guard via `useReducedMotion()` from framer-motion

---

## Section 1 — Sticky Navbar

### Purpose
Global navigation with brand, links, auth actions, and theme toggle.

### Layout
- Position: `sticky top-0 z-50`
- Max-width: `max-w-7xl mx-auto`
- Height: `h-16` (64px)
- Background: `bg-background/80 backdrop-blur-xl border-b border-border`
- Flex: brand left, nav center, actions right
- Mobile: hamburger menu (Sheet from shadcn/Radix)

### Elements
| Element | Component | Route/Action |
|---------|-----------|-------------|
| Logo (BookOpen + "LearnHub") | Link | `/` |
| Courses | Link | `/courses` |
| Features | Anchor | `#features` |
| For Institutions | Link | `/admin` |
| Theme toggle | Button (sun/moon) | Toggle dark mode |
| Log in | Button variant="ghost" | `/login` |
| Sign up | Button variant="default" | `/login` |

### Responsive
- **375px:** Logo + hamburger (Sheet). Auth inside Sheet.
- **768px:** Logo + hamburger. Auth inside Sheet.
- **1024px:** Full nav visible, all links + auth inline.
- **1440px:** Same as 1024px, centered in max-w-7xl.

### Motion
- Navbar background fades in on scroll (opacity: 0.8 → 1)
- Mobile Sheet slides from right (Framer Motion AnimatePresence)

### A11y
- `aria-label="LearnHub"` on logo link
- `aria-current="page"` on active nav link
- Skip-link as first focusable element
- Theme toggle: `aria-label="Toggle dark mode"`
- Focus-visible ring on all nav items

---

## Section 2 — Hero

### Purpose
Primary value proposition with dual CTA and trust indicators.

### Layout
- Section: `min-h-[calc(100vh-4rem)]` or `min-h-dvh`
- Centered content: `max-w-5xl mx-auto text-center`
- Background gradient: radial gradient from primary/10
- Two-tone h1: "Your Institution's" + "Learning Platform" (gradient-text)
- Subhead: 2-3 sentences about the platform
- CTA row: Sign In to Your Portal + Browse Courses
- Trust badges row: FERPA Compliant / SSO Enabled / 99.9% Uptime

### Elements
| Element | Content | Variant |
|---------|---------|---------|
| H1 | "Your Institution's <span>Learning Platform</span>" | 2-tone, gradient span |
| Subhead | "A complete learning management system for high schools and universities. Manage courses, students, and content — all in one place." | text-muted-foreground |
| Primary CTA | "Sign In to Your Portal" → `/login` | Button default, size="lg" |
| Secondary CTA | "Browse Courses" → `/courses` | Button outline, size="lg" |
| Trust badge 1 | Shield + "FERPA Compliant" | text-sm muted |
| Trust badge 2 | Shield + "SSO Enabled" | text-sm muted |
| Trust badge 3 | Shield + "99.9% Uptime" | text-sm muted |

### Responsive
- **375px:** Stacked CTAs (flex-col). Trust badges wrap to 2+1. H1 text-4xl.
- **768px:** CTAs side by side. Trust badges row. H1 text-5xl.
- **1024px:** Full layout. H1 text-6xl/md:text-7xl.
- **1440px:** Same as 1024px.

### Motion
- H1: opacity 0→1, y 40→0, 800ms
- Subhead: same, delay 200ms
- CTAs: same, delay 400ms
- Trust badges: same, delay 600ms, stagger 40ms

### A11y
- Single `<h1>` per page
- Subhead as `<p>`
- Trust badges use `<span>` elements with `aria-hidden` on icons
- No fabricated metrics in trust badges — only factual platform capabilities

---

## Section 3 — Platform Features (Bento Grid)

### Purpose
Product capability overview in a visually engaging bento grid layout.

### Layout
- Section: `py-24 px-4`
- Max-width: `max-6xl mx-auto`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Bento: some cards span 2 cols (featured features)
  - Featured cards (span 2 cols): Course Builder, Analytics Dashboard
  - Standard cards (1 col): Quizzes & Auto-grading, Live Classes, Certificates, Role-based Access

### Feature Cards (data/features.ts)
```ts
export const features = [
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
    icon: Video,
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
```

### Responsive
- **375px:** Single column, all cards full width.
- **768px:** Two columns. Featured cards span 2.
- **1024px:** Three columns. Featured cards span 2.
- **1440px:** Same as 1024px.

### Motion
- Section title fades in on viewport entry
- Each card fades + slides up with stagger 40ms
- Hover: scale(1.02), y: -4, shadow-md

### A11y
- `<section aria-labelledby="features-heading">`
- `<h2 id="features-heading">`
- Cards are `<article>` elements
- Icons have `aria-hidden="true"`

---

## Section 4 — Role Showcase (Tabs)

### Purpose
"Built for everyone" — show how each role interacts with the platform.

### Layout
- Section: `py-24 px-4 bg-muted/30`
- Max-width: `max-5xl mx-auto`
- Tabs: Radix Tabs (shadcn style) — Administrators | Teachers | Students
- Tab content: icon + heading + 3 bullet points

### Data (data/roles.ts)
```ts
export const roles = [
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
```

### Responsive
- **375px:** Tabs stack vertically or scroll horizontally
- **768px:** Tab bar horizontal, content below
- **1024px:** Full tab layout

### Motion
- Tab content cross-fades on tab change (AnimatePresence)
- Bullets stagger in with 40ms delay

### A11y
- Radix Tabs — keyboard navigable
- `aria-label="Platform roles"`
- Focus ring on tab triggers

---

## Section 5 — How It Works (3-step flow)

### Purpose
Simple orientation for new institutions: what to expect when adopting the platform.

### Layout
- Section: `py-24 px-4`
- Max-width: `max-5xl mx-auto`
- Steps: horizontal on desktop, vertical on mobile
- Connector line between steps (hidden on mobile)
- Each step: number circle + heading + description

### Data (data/steps.ts)
```ts
export const steps = [
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
```

### Responsive
- **375px:** Vertical stack with numbered circles, connector line on left
- **768px:** Horizontal cards with arrows/connectors
- **1024px:** Full 3-column layout

### Motion
- Step cards animate in on scroll with stagger 40ms
- Connector line animates width/growth

### A11y
- `<section aria-labelledby="how-it-works-heading">`
- Steps as `<ol>` with `<li>` items
- Number circles have `aria-hidden="true"`

---

## Section 6 — CTA Banner + Footer

### Purpose
Final orientation call-to-action plus comprehensive footer navigation.

### CTA Banner Layout
- Section: `py-24 px-4`
- Gradient background: `bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10`
- Max-width: `max-5xl mx-auto`
- Centered: heading + description + button
- Heading: "Ready to get started?"
- Description: "Sign in to access your learning portal or contact your administrator for an account."
- CTA: "Get Started" → `/login`, Button default, size="lg"

### Footer Layout
- Background: `bg-muted/50 border-t border-border`
- 3 columns: Platform | Resources | Institution
- Legal row: Privacy Policy | Terms of Service | Accessibility Statement | © LearnHub

### Footer Columns
| Platform | Resources | Institution |
|----------|-----------|-------------|
| Courses (`/courses`) | Documentation | About |
| Dashboard (`/dashboard`) | API Reference | Contact |
| Certificates (`/certificates`) | Support | Privacy Policy (`/privacy`) |

### Responsive
- **375px:** Stack all 3 columns vertically. Legal row wraps.
- **768px:** 3 columns + legal row below.
- **1024px:** Full layout.

### A11y
- Footer `<footer>` with `role="contentinfo"`
- Columns as `<nav>` with `aria-label`
- Legal links in a `<nav aria-label="Legal">`

---

## Removed Sections (School Implementation)
The following sections were explicitly removed compared to a commercial landing page:

- ❌ **KPI Strip / Social Proof Stats** — Fabricated engagement numbers ("10,000+ Students Managed", etc.) are inappropriate for an institutional implementation page.
- ❌ **Testimonials** — Fake quotes from fictitious educators are dishonest and inappropriate.
- ❌ **Pricing Teaser** — No commercial tiers. Pricing handled through institutional channels.
- ❌ **Any fabricated numbers, vanity metrics, or conversion-oriented copy.**

---

## Cross-Section Rules

### Performance
- Below-fold sections (role-tabs, how-it-works, site-footer) loaded via `React.lazy()`
- `font-display: swap` on Google Fonts
- `loading="lazy"` on any images (none in current design — decorative only if added later)
- No layout animations (transform/opacity only)

### Motion (applied globally)
```tsx
const prefersReducedMotion = useReducedMotion();
const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.3 };
```

### Responsive Breakpoints
- 375px: base (mobile-first)
- 640px: sm
- 768px: md
- 1024px: lg
- 1280px: xl

### Guardrails
- No horizontal scroll at any viewport → `overflow-x-clip` on `<body>`
- Touch targets minimum 44px × 44px
- Text contrast ≥ 4.5:1 in both light and dark mode
- Focus-visible ring on every interactive element
- Single `<h1>` per page, strict heading hierarchy
- No emoji icons — Lucide only
- No raw hex colors in JSX — CSS variable tokens only
