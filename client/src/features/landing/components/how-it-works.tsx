import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { steps } from "../data/steps";

function StepCard({ step, index }: { step: typeof steps[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      animate={isInView || prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.08 }}
      className="relative"
    >
      {index < steps.length - 1 && (
        <div className="hidden md:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-border" aria-hidden="true" />
      )}
      <Card className="h-full text-center">
        <CardContent className="p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
            <span aria-hidden="true">{step.number}</span>
          </div>
          <step.icon className="h-6 w-6 text-primary mx-auto mb-3" aria-hidden="true" />
          <h3 className="text-lg font-semibold mb-2 font-heading">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function HowItWorks() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="how-it-works-heading" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={headingRef}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          animate={headingInView || prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold mb-4 font-heading">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started with LearnHub is straightforward. Three steps from setup to full operation.
          </p>
        </motion.div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none" aria-label="Setup process">
          {steps.map((step, i) => (
            <li key={step.number}>
              <StepCard step={step} index={i} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
