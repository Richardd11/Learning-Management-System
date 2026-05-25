import { Link } from "@tanstack/react-router";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  BookOpen, Brain, Award, BarChart3, Zap, Shield,
  ChevronDown, Star, Users, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Brain, title: "AI-Powered Learning", desc: "Get personalized tutoring, auto-generated courses, and intelligent grading." },
  { icon: BookOpen, title: "Rich Course Content", desc: "Interactive lessons with video, quizzes, flashcards, and hands-on projects." },
  { icon: Award, title: "Certificates", desc: "Earn verifiable certificates upon course completion to showcase your skills." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track your progress with detailed analytics and learning insights." },
  { icon: Zap, title: "Gamification", desc: "XP points, streaks, and achievements to keep you motivated." },
  { icon: Shield, title: "Enterprise Ready", desc: "Role-based access control, admin panel, and moderation tools." },
];

const testimonials = [
  { name: "Sarah K.", role: "Software Engineer", quote: "LearnHub's AI tutor helped me understand complex algorithms in half the time.", rating: 5 },
  { name: "Marcus L.", role: "Product Designer", quote: "The course builder is incredible. I published my first course in under an hour.", rating: 5 },
  { name: "Priya S.", role: "Data Scientist", quote: "The interactive quizzes and flashcards made studying for certifications so much easier.", rating: 5 },
];

const pricingPlans = [
  { name: "Free", price: "$0", period: "/month", features: ["Access free courses", "Basic AI tutor", "Community support", "Progress tracking"], cta: "Get Started" },
  { name: "Pro", price: "$19", period: "/month", features: ["Unlimited courses", "Advanced AI features", "Priority support", "Certificates", "Offline access"], cta: "Start Free Trial", popular: true },
  { name: "Team", price: "$49", period: "/month", features: ["Everything in Pro", "Team analytics", "Custom branding", "API access", "Dedicated support"], cta: "Contact Sales" },
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    if (latest >= 1000) return `${Math.round(latest / 1000).toLocaleString()},${String(Math.round(latest) % 1000).padStart(3, "0").slice(0, 3)}`;
    return Math.round(latest).toLocaleString();
  });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(motionValue, value, { duration: 2, ease: "easeOut" });
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      if (ref.current) ref.current.textContent = latest + suffix;
    });
    return unsubscribe;
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Learn without{" "}
              <span className="gradient-text">limits</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered courses, interactive content, and personalized learning paths.
              Master new skills at your own pace.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 h-12">Start Learning Free</Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="text-lg px-8 h-12">Browse Courses</Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /> <AnimatedCounter value={10000} suffix="+" /> Students</div>
            <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> <AnimatedCounter value={500} suffix="+" /> Courses</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> <AnimatedCounter value={50000} suffix="+" /> Hours</div>
          </motion.div>

          {/* Floating course cards */}
          <div className="hidden lg:block">
            {[
              { x: -350, y: 50, rotate: -6, delay: 0.6 },
              { x: 320, y: 80, rotate: 4, delay: 0.8 },
              { x: -280, y: -200, rotate: 3, delay: 1 },
              { x: 300, y: -180, rotate: -5, delay: 1.2 },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1, x: card.x, y: card.y, rotate: card.rotate }}
                transition={{ delay: card.delay, duration: 0.6, type: "spring" }}
                className="absolute top-1/2 left-1/2 w-48 h-32 rounded-xl bg-card border shadow-lg"
              />
            ))}
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to learn</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete learning platform with AI-powered tools, interactive content, and detailed analytics.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.title}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <feature.icon className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by learners</h2>
            <p className="text-lg text-muted-foreground">See what our students have to say.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">&ldquo;{t.quote}&rdquo;</p>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple pricing</h2>
            <p className="text-lg text-muted-foreground">Choose the plan that fits your learning goals.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <AnimatedSection key={plan.name}>
                <motion.div whileHover={{ scale: 1.03 }}>
                  <Card className={`h-full relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                      <ul className="space-y-2 mb-6 text-sm">
                        {plan.features.map((f) => (
                          <li key={f} className="text-muted-foreground">{f}</li>
                        ))}
                      </ul>
                      <Link to="/register">
                        <Button variant={plan.popular ? "default" : "outline"} className="w-full">
                          {plan.cta}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
          </AnimatedSection>

          <div className="space-y-4">
            {[
              { q: "Is there a free trial?", a: "Yes! You can access free courses immediately and try Pro features for 14 days." },
              { q: "Can I create my own courses?", a: "Absolutely. Apply to become an instructor and use our drag-and-drop course builder with AI assistance." },
              { q: "How does the AI tutor work?", a: "Our AI tutor uses your course material as context to answer questions, explain concepts, and provide personalized help." },
              { q: "Are certificates recognized?", a: "Each certificate has a unique verification link that employers can use to confirm your achievement." },
            ].map((faq) => (
              <AnimatedSection key={faq.q}>
                <details className="group border rounded-lg">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium">
                    {faq.q}
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-4 pb-4 text-muted-foreground">{faq.a}</p>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-lg text-muted-foreground mb-8">Join thousands of learners and start your journey today.</p>
          <Link to="/register">
            <Button size="lg" className="text-lg px-8 h-12">Get Started Free</Button>
          </Link>
        </AnimatedSection>
      </section>

    </div>
  );
}
