import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Menu, Moon, Sun, LogOut, BookOpen, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/courses" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-[0_1px_0_0_hsl(var(--border)/0.5)]"
      >
        <div className="flex h-16 items-center px-4 md:px-6 gap-2">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1 md:hidden text-muted-foreground hover:text-foreground"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1 md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link to="/" className="flex items-center gap-2 mr-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
              <BookOpen className="h-4 w-4 text-brand" />
            </div>
            <span className="hidden font-display text-[18px] font-bold tracking-tight text-foreground sm:inline">LearnHub</span>
          </Link>

          {isAuthenticated && (
            <form onSubmit={handleSearch} className="relative hidden md:block md:w-64 lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="h-9 rounded-xl border-border/70 bg-muted/40 pl-9 text-sm transition-colors focus-visible:bg-background"
              />
            </form>
          )}

          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 ml-2">
              <Link
                to="/courses"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-150"
              >
                Courses
              </Link>
            </nav>
          )}

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="text-muted-foreground hover:text-foreground transition-all duration-300"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground"
                  onClick={toggleNotificationDrawer}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {(unreadCount ?? 0) > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold shadow-sm px-1"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </Button>

                <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border/60">
                  <Link to="/profile">
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-background ring-offset-1 ring-offset-background shadow-sm hover:ring-primary/30 transition-all duration-150">
                      <AvatarImage src={user?.avatar ?? undefined} />
                      <AvatarFallback className="text-xs font-semibold">
                        {user ? getInitials(user.firstName, user.lastName) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    aria-label="Logout"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-sm font-medium">Log in</Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" className="text-sm font-medium shadow-sm">Sign up</Button>
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
