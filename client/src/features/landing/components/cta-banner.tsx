import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 px-4">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
        whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
        className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12 md:p-16 border border-primary/10"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
          Ready to get started?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Sign in to access your learning portal or contact your administrator for an account.
        </p>
        <Link to="/login">
          <Button size="lg" className="text-lg px-8 h-12">
            Get Started
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
