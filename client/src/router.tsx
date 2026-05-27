import { createRouter, createRoute, createRootRoute, Outlet, redirect, notFound, NotFoundRoute } from "@tanstack/react-router";
import { AppLayout, PublicLayout } from "@/components/common/layout";
import { NotFoundPage } from "@/components/common/not-found";
import { LandingPage } from "@/features/landing";
import { LoginPage } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard";
import { InstructorDashboard } from "@/features/dashboard/instructor-dashboard";
import { CatalogPage, CourseDetailPage } from "@/features/courses";
import { CoursePlayer } from "@/features/player";
import { CourseBuilder } from "@/features/builder";
import { AdminPanel } from "@/features/admin";
import { ProfilePage } from "@/features/profile";
import { CertificatesPage } from "@/features/certificates";
import { StudentProgressPage } from "@/features/students/student-progress-page";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <PublicLayout>
      <NotFoundPage />
    </PublicLayout>
  ),
});

// Public routes
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <PublicLayout>
      <LandingPage />
    </PublicLayout>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <PublicLayout>
      <LoginPage />
    </PublicLayout>
  ),
});

// Register route removed - self-registration is disabled for institutional LMS
// Only admins can create user accounts

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: () => (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
          <p className="text-muted-foreground">Password reset functionality coming soon.</p>
        </div>
      </div>
    </PublicLayout>
  ),
});

// Course routes (public)
const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses",
  component: () => (
    <AppLayout>
      <CatalogPage />
    </AppLayout>
  ),
});

const courseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses/$slug",
  component: () => (
    <AppLayout>
      <CourseDetailPage />
    </AppLayout>
  ),
});

// Authenticated routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  ),
});

const myCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-courses",
  component: () => (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  ),
});

const playerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/$slug",
  component: () => (
    <AppLayout>
      <CoursePlayer />
    </AppLayout>
  ),
});

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builder",
  component: () => (
    <AppLayout>
      <CourseBuilder />
    </AppLayout>
  ),
});

const instructorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/instructor",
  component: () => (
    <AppLayout>
      <InstructorDashboard />
    </AppLayout>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AppLayout>
      <AdminPanel />
    </AppLayout>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <AppLayout>
      <ProfilePage />
    </AppLayout>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <AppLayout>
      <ProfilePage />
    </AppLayout>
  ),
});

const certificatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/certificates",
  component: () => (
    <AppLayout>
      <CertificatesPage />
    </AppLayout>
  ),
});

// Teacher routes
const teacherDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teacher",
  component: () => (
    <AppLayout>
      <InstructorDashboard />
    </AppLayout>
  ),
});

const teacherStudentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teacher/students",
  component: () => (
    <AppLayout>
      <StudentProgressPage />
    </AppLayout>
  ),
});

// Admin sub-routes
const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users",
  component: () => (
    <AppLayout>
      <AdminPanel />
    </AppLayout>
  ),
});

const adminLevelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/levels",
  component: () => (
    <AppLayout>
      <AdminPanel />
    </AppLayout>
  ),
});

const adminAnnouncementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/announcements",
  component: () => (
    <AppLayout>
      <AdminPanel />
    </AppLayout>
  ),
});

const adminYoutubeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/youtube",
  component: () => (
    <AppLayout>
      <AdminPanel />
    </AppLayout>
  ),
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  forgotPasswordRoute,
  coursesRoute,
  courseDetailRoute,
  dashboardRoute,
  myCoursesRoute,
  playerRoute,
  builderRoute,
  instructorRoute,
  teacherDashboardRoute,
  teacherStudentsRoute,
  adminRoute,
  adminUsersRoute,
  adminLevelsRoute,
  adminAnnouncementsRoute,
  adminYoutubeRoute,
  profileRoute,
  settingsRoute,
  certificatesRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
