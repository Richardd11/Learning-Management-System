import { Link } from "@tanstack/react-router";
import { BookOpen, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navLinks = [
  { label: "Courses", to: "/courses" },
  { label: "Features", to: "#features", anchor: true },
  { label: "For Institutions", to: "/admin" },
];

export function NavBar() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring focus:rounded-lg">
        Skip to content
      </a>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold" aria-label="LearnHub">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">LearnHub</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) =>
            link.anchor ? (
              <a key={link.label} href={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
            className="h-11 w-11"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="h-11 px-4">
                Log in
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="h-11 px-4">
                Sign up
              </Button>
            </Link>
          </div>

          <Button variant="ghost" size="icon" aria-label="Menu" onClick={() => setOpen(!open)} className="h-11 w-11 lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) =>
                link.anchor ? (
                  <a key={link.label} href={link.to} onClick={() => setOpen(false)} className="text-base text-muted-foreground hover:text-foreground transition-colors py-2">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} to={link.to} onClick={() => setOpen(false)} className="text-base text-muted-foreground hover:text-foreground transition-colors py-2">
                    {link.label}
                  </Link>
                )
              )}
              <hr className="border-border my-1" />
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="default" className="w-full h-11">
                  Sign In
                </Button>
              </Link>
              <Link to="/courses" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full h-11">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
