import { Link } from "@tanstack/react-router";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  BookOpen, Brain, Award, BarChart3, Zap, Shield,
  ChevronDown, Users, Clock, GraduationCap, Layers, School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Brain, title: "AI-Powered Learning", desc: "Personalized tutoring, auto-generated content, and intelligent assistance for students and teachers." },
  { icon: BookOpen, title: "Rich Course Content", desc: "Interactive lessons with video, YouTube integration, quizzes, and hands-on projects." },
  { icon: Layers, title: "Academic Structure", desc: "Organize courses by academic levels and sections for high schools and universities." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track student progress, course performance, and institutional metrics in real time." },
  { icon: Shield, title: "Admin Control", desc: "Full user management with role-based access, account creation, and moderation tools." },
  { icon: School, title: "Institution Ready", desc: "Single-institution deployment with no subscriptions — your platform, your rules." },
];

const highlights = [
  { icon: Users, value: 10000, suffix: "+", label: "Students Managed" },
  { icon: BookOpen, value: 500, suffix: "+", label: "Courses Created" },
  { icon: GraduationCap, value: 98, suffix: "%", label: "Satisfaction Rate" },
  { icon: Clock, value: 50000, suffix: "+", label: "Learning Hours" },
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              Your Institution's{" "}
              <span className="gradient-text">Learning Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A complete learning management system for high schools and universities.
              Manage courses, students, and content — all in one place.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login">
              <Button size="lg" className="text-lg px-8 h-12">Sign In to Your Portal</Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="text-lg px-8 h-12">Browse Courses</Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {highlights.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 bg-gradient-to-br from-card to-muted/30 border border-border/50 shadow-sm rounded-2xl p-4">
                <stat.icon className="h-5 w-5 text-primary mb-1" />
                <span className="text-4xl font-extrabold tracking-tight"><AnimatedCounter value={stat.value} suffix={stat.suffix} /></span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for educational institutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything your school or university needs to deliver courses, track progress, and manage learning — with no subscription fees.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.title}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full group hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-3 w-fit mb-4">
                        <feature.icon className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tailored for every role</h2>
            <p className="text-lg text-muted-foreground">Each user gets a dedicated portal designed for their needs.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Admin Portal", desc: "Manage users, academic levels, sections, courses, and institution-wide announcements. Full control over your platform." },
              { icon: BookOpen, title: "Teacher Portal", desc: "Create and publish courses, build quizzes, integrate YouTube tutorials, and track student progress." },
              { icon: GraduationCap, title: "Student Portal", desc: "Access course content, take quizzes, track your progress, and view announcements from your teachers." },
            ].map((role) => (
              <AnimatedSection key={role.title}>
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <role.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{role.title}</h3>
                    <p className="text-muted-foreground">{role.desc}</p>
                  </CardContent>
                </Card>
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
              { q: "How do I create an account?", a: "Accounts are created by your institution's administrator. Contact your admin to get set up with the right role and permissions." },
              { q: "Can teachers create their own courses?", a: "Yes! Teachers have full access to the course builder with drag-and-drop modules, YouTube integration, and quiz creation tools." },
              { q: "How does the AI assistant work?", a: "Our AI assistant uses your course material as context to answer questions, explain concepts, and provide personalized help to students." },
              { q: "Is there a subscription fee?", a: "No. This is a single-institution platform with no subscription costs. Your institution hosts and manages the entire system." },
              { q: "Can I use this for both high school and university?", a: "Absolutely. The platform supports both high school and college academic levels with appropriate structure for each." },
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8">Sign in to access your learning portal or contact your administrator for an account.</p>
          <Link to="/login">
            <Button size="lg" className="text-lg px-8 h-12">Sign In</Button>
          </Link>
        </AnimatedSection>
      </section>

    </div>
  );
}
