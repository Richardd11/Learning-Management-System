import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Menu, Moon, Sun, LogOut, GraduationCap } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { getInitials } from "@/lib/utils";
import { useNotificationCount } from "@/hooks/use-notifications";
import { MobileMenu } from "./mobile-menu";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleSidebar, toggleNotificationDrawer } = useUIStore();
  const { theme, setTheme } = useTheme();
  const { data: unreadCount } = useNotificationCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-16 items-center px-4 md:px-6">
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link to="/" className="flex items-center gap-2 mr-6">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold gradient-text hidden sm:inline">SchoolLMS</span>
          </Link>

          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6 ml-6">
              <Link to="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Subjects
              </Link>
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="relative" onClick={toggleNotificationDrawer} aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {(unreadCount ?? 0) > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <Link to="/profile">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user?.avatar ?? undefined} />
                      <AvatarFallback>{user ? getInitials(user.firstName, user.lastName) : "U"}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
