import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, LayoutDashboard, PenTool, Shield, Award, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuLinks: ReadonlyArray<{
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  auth?: boolean;
}> = [
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, auth: true },
  { to: "/builder", label: "Course Builder", icon: PenTool, auth: true },
  { to: "/admin", label: "Admin Panel", icon: Shield, auth: true },
  { to: "/certificates", label: "Certificates", icon: Award, auth: true },
  { to: "/profile", label: "Profile", icon: User, auth: true },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isAuthenticated } = useAuthStore();

  const visibleLinks = menuLinks.filter(
    (link) => !link.auth || isAuthenticated
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-background border-r shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/" className="flex items-center gap-2" onClick={onClose}>
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold gradient-text">LearnHub</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="p-4 space-y-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {!isAuthenticated && (
              <div className="p-4 mt-4 space-y-2 border-t">
                <Link to="/login" onClick={onClose}>
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link to="/register" onClick={onClose}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
