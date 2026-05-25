import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, GraduationCap, Settings, Shield,
  PlusCircle, BarChart3, Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] },
  { href: "/courses", label: "Subjects", icon: BookOpen, roles: ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] },
  { href: "/my-courses", label: "My Subjects", icon: GraduationCap, roles: ["STUDENT"] },
  { href: "/builder", label: "Subject Builder", icon: PlusCircle, roles: ["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] },
  { href: "/instructor", label: "Teacher Panel", icon: BarChart3, roles: ["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] },
  { href: "/certificates", label: "Certificates", icon: Award, roles: ["STUDENT"] },
  { href: "/admin", label: "Administration", icon: Shield, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();

  if (!user) return null;

  const filteredItems = navItems.filter((item) => item.roles.includes(user.role));

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
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-[280px] border-r bg-background p-4",
          "md:sticky md:translate-x-0 md:block",
          !sidebarOpen && "md:w-[280px]"
        )}
      >
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    transition={{ type: "spring", damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}
