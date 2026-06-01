import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustBadges = [
  "FERPA Compliant",
  "SSO Enabled",
  "99.9% Uptime",
];

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const transition = prefersReducedMotion ? { duration: 0 } : undefined;
  const animate = prefersReducedMotion ? { opacity: 1, y: 0 } : undefined;

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          animate={animate ?? { opacity: 1, y: 0 }}
          transition={{ ...transition, duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 font-heading">
            Your Institution's{" "}
            <span className="gradient-text">Learning Platform</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A complete learning management system for high schools and universities.
            Manage courses, students, and content — all in one place.
          </p>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={animate ?? { opacity: 1, y: 0 }}
          transition={{ ...transition, delay: prefersReducedMotion ? 0 : 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login">
            <Button size="lg" className="text-base sm:text-lg px-8 h-12 min-w-[200px] sm:min-w-0">
              Sign In to Your Portal
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" size="lg" className="text-base sm:text-lg px-8 h-12 min-w-[200px] sm:min-w-0">
              Browse Courses
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={animate ?? { opacity: 1 }}
          transition={{ ...transition, delay: prefersReducedMotion ? 0 : 0.8, duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {trustBadges.map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
