import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { features } from "../data/features";

function FeatureCard({ feature, index }: { feature: typeof features[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
      animate={isInView || prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.04 }}
      className={feature.featured ? "md:col-span-2 lg:col-span-2" : ""}
    >
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="h-full"
      >
        <Card className="h-full group border-border/50 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-3 w-fit mb-4">
              <feature.icon className="h-10 w-10 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 font-heading">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export function FeaturesBento() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="features" aria-labelledby="features-heading" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={headingRef}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          animate={headingInView || prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4 font-heading">
            Everything your institution needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tools for course creation, assessment, analytics, and role management — built for schools and universities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
