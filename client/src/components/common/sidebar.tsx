import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, GraduationCap, Settings, Shield,
  PlusCircle, BarChart3, Award, Users, Layers, Megaphone, Youtube,
  TrendingUp, ChevronLeft, ChevronRight, Flame, Zap,
  ClipboardList, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
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
      { href: "/builder", label: "Content Builder", icon: PlusCircle, roles: ["TEACHER"] },
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
    ADMIN: "bg-destructive/10 text-destructive border-destructive/20",
    TEACHER: "bg-brand/10 text-brand border-brand/20",
    STUDENT: "bg-info/10 text-info border-info/20",
  };

  const sidebarWidth = collapsed ? 64 : 260;

  return (
    <>
      {/* ── Mobile overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        style={{ minWidth: sidebarWidth, maxWidth: sidebarWidth }}
        className={cn(
          "hidden md:flex flex-col",
          "sticky top-16 h-[calc(100vh-4rem)]",
          "bg-gradient-to-b from-card via-card to-card/95",
          "shadow-[1px_0_0_0_hsl(var(--border)/0.8)]",
          "overflow-hidden shrink-0",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          visibleGroups={visibleGroups}
          roleColors={roleColors}
          user={user}
          location={location}
          setSidebarOpen={setSidebarOpen}
        />
      </motion.aside>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            style={{ width: 260 }}
            className="fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] flex flex-col bg-card shadow-2xl overflow-hidden md:hidden"
          >
            <SidebarContent
              collapsed={false}
              setCollapsed={() => {}}
              visibleGroups={visibleGroups}
              roleColors={roleColors}
              user={user}
              location={location}
              setSidebarOpen={setSidebarOpen}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Shared sidebar inner content ──────────────────────────────────
function SidebarContent({
  collapsed,
  setCollapsed,
  visibleGroups,
  roleColors,
  user,
  location,
  setSidebarOpen,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  visibleGroups: NavGroup[];
  roleColors: Record<string, string>;
  user: User;
  location: { pathname: string };
  setSidebarOpen: (v: boolean) => void;
}) {
  return (
    <>
      {/* Collapse toggle — desktop only */}
      <div className="hidden md:flex items-center justify-end px-3 pt-3 pb-1 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-150 hover:scale-105"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* User mini profile */}
      <div className={cn(
        "mx-2 mb-1 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3 px-3 py-3 shrink-0",
        collapsed && "justify-center px-2"
      )}>
        <Avatar className="h-8 w-8 shrink-0 ring-2 ring-background shadow-sm">
          <AvatarImage src={user.avatar ?? undefined} />
          <AvatarFallback className="text-xs font-semibold">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
        </Avatar>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden min-w-0"
            >
              <p className="text-sm font-semibold truncate leading-tight tracking-[-0.01em]">
                {user.firstName} {user.lastName}
              </p>
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border inline-block mt-0.5",
                roleColors[user.role]
              )}>
                {user.role}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 px-3 mb-1.5 mt-2"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((navItem) => {
                const isActive =
                  location.pathname === navItem.href ||
                  (navItem.href !== "/dashboard" && navItem.href !== "/admin" && navItem.href !== "/teacher" &&
                    location.pathname.startsWith(navItem.href + "/"));
                const Icon = navItem.icon;
                return (
                  <Link
                    key={navItem.href}
                    to={navItem.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      collapsed ? "justify-center" : "",
                      isActive
                        ? "bg-brand/10 text-brand font-semibold shadow-[inset_0_0_0_1px_hsl(var(--lms-brand)/0.18)]"
                        : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                    )}
                    title={collapsed ? navItem.label : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand rounded-r-full shadow-[0_0_8px_hsl(var(--lms-brand)/0.6)]"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      />
                    )}
                    <Icon className="h-4 w-4 shrink-0 transition-transform duration-150" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="overflow-hidden whitespace-nowrap flex-1 tracking-[-0.01em]"
                        >
                          {navItem.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
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
            className="mx-2 mb-2 rounded-xl bg-muted/20 border border-border/40 px-3 py-2.5 shrink-0"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-streak" />
                <span className="font-bold text-foreground tabular">{user.streak}</span>
                <span className="text-[11px]">streak</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-warning" />
                <span className="font-bold text-foreground tabular">{user.xp.toLocaleString()}</span>
                <span className="text-[11px]">XP</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
