import { createRouter, createRoute, createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppLayout, PublicLayout } from "@/components/common/layout";
import { LandingPage } from "@/features/landing";
import { LoginPage, RegisterPage } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard";
import { InstructorDashboard } from "@/features/dashboard/instructor-dashboard";
import { CatalogPage, CourseDetailPage } from "@/features/courses";
import { CoursePlayer } from "@/features/player";
import { CourseBuilder } from "@/features/builder";
import { AdminPanel } from "@/features/admin";
import { ProfilePage } from "@/features/profile";
import { CertificatesPage } from "@/features/certificates";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
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

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => (
    <PublicLayout>
      <RegisterPage />
    </PublicLayout>
  ),
});

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

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  coursesRoute,
  courseDetailRoute,
  dashboardRoute,
  myCoursesRoute,
  playerRoute,
  builderRoute,
  instructorRoute,
  adminRoute,
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
