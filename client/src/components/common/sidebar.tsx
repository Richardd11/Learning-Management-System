import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, GraduationCap, Settings, Shield,
  PlusCircle, BarChart3, Award, Users, Layers, Megaphone, Youtube,
  TrendingUp, FileText, ChevronLeft, ChevronRight, Flame, Zap,
  ClipboardList, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
}

interface NavGroup {
  label: string;
  roles: string[];
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["STUDENT", "TEACHER", "ADMIN"] },
    ],
  },
  {
    label: "Learning",
    roles: ["STUDENT"],
    items: [
      { href: "/courses", label: "Browse Courses", icon: BookOpen, roles: ["STUDENT"] },
      { href: "/my-courses", label: "My Courses", icon: GraduationCap, roles: ["STUDENT"] },
      { href: "/progress", label: "My Progress", icon: TrendingUp, roles: ["STUDENT"] },
      { href: "/announcements", label: "Announcements", icon: Bell, roles: ["STUDENT"] },
      { href: "/certificates", label: "Certificates", icon: Award, roles: ["STUDENT"] },
    ],
  },
  {
    label: "Teaching",
    roles: ["TEACHER"],
    items: [
      { href: "/teacher", label: "Teacher Panel", icon: BarChart3, roles: ["TEACHER"] },
      { href: "/builder", label: "Course Builder", icon: PlusCircle, roles: ["TEACHER"] },
      { href: "/teacher/quiz-builder", label: "Quiz Builder", icon: ClipboardList, roles: ["TEACHER"] },
      { href: "/teacher/students", label: "My Students", icon: Users, roles: ["TEACHER"] },
      { href: "/teacher/sections", label: "Sections", icon: Layers, roles: ["TEACHER"] },
      { href: "/courses", label: "Browse Courses", icon: BookOpen, roles: ["TEACHER"] },
    ],
  },
  {
    label: "Administration",
    roles: ["ADMIN"],
    items: [
      { href: "/admin", label: "Admin Panel", icon: Shield, roles: ["ADMIN"] },
      { href: "/admin/users", label: "User Management", icon: Users, roles: ["ADMIN"] },
      { href: "/admin/levels", label: "Academic Levels", icon: Layers, roles: ["ADMIN"] },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone, roles: ["ADMIN"] },
      { href: "/admin/youtube", label: "YouTube Tutorials", icon: Youtube, roles: ["ADMIN"] },
      { href: "/builder", label: "Course Builder", icon: PlusCircle, roles: ["ADMIN"] },
      { href: "/courses", label: "Browse Courses", icon: BookOpen, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Account",
    roles: ["STUDENT", "TEACHER", "ADMIN"],
    items: [
      { href: "/settings", label: "Settings", icon: Settings, roles: ["STUDENT", "TEACHER", "ADMIN"] },
    ],
  },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const visibleGroups = navGroups
    .filter((g) => g.roles.includes(user.role))
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => item.roles.includes(user.role)),
    }))
    .filter((g) => g.items.length > 0);

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-500/10 text-red-600 border-red-500/20",
    TEACHER: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    STUDENT: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 260 }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-card shadow-sm overflow-hidden",
          "flex flex-col",
          // Mobile: slide in/out; Desktop: always visible
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:sticky md:top-16"
        )}
        style={{ minWidth: collapsed ? 64 : 260 }}
      >
        {/* Collapse toggle — desktop only */}
        <div className="hidden md:flex items-center justify-end px-2 py-2 border-b">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User mini profile */}
        <div className={cn("flex items-center gap-3 px-3 py-3 border-b", collapsed && "justify-center px-2")}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback className="text-xs">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-sm font-semibold truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full border inline-block mt-0.5",
                  roleColors[user.role]
                )}>
                  {user.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {group.items.map((navItem) => {
                  const isActive =
                    location.pathname === navItem.href ||
                    (navItem.href !== "/dashboard" && location.pathname.startsWith(navItem.href + "/"));
                  const Icon = navItem.icon;
                  return (
                    <Link
                      key={navItem.href}
                      to={navItem.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150",
                        collapsed ? "justify-center" : "",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                      title={collapsed ? navItem.label : undefined}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="overflow-hidden whitespace-nowrap flex-1"
                          >
                            {navItem.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {!collapsed && navItem.badge && (
                        <Badge className="text-[10px] px-1.5 py-0 h-4">{navItem.badge}</Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* XP / streak footer */}
        <AnimatePresence>
          {!collapsed && (user.xp > 0 || user.streak > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-3 border-t"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="font-semibold text-foreground">{user.streak}</span> streak
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="font-semibold text-foreground">{user.xp.toLocaleString()}</span> XP
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
