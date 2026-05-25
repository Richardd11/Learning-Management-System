import { Link } from "@tanstack/react-router";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  BookOpen, Brain, Award, BarChart3, Zap, Shield,
  ChevronDown, Star, Users, GraduationCap, School, ClipboardList,
  MessageSquare, Calendar, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Brain, title: "AI-Powered Learning", desc: "Personalized tutoring, auto-generated lesson plans, and intelligent grading for every student." },
  { icon: BookOpen, title: "Rich Course Content", desc: "Interactive lessons with video, quizzes, flashcards, and hands-on activities for every subject." },
  { icon: ClipboardList, title: "Gradebook & Assessments", desc: "Teachers can create quizzes, track grades, and generate progress reports for each student." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "School-wide analytics for administrators. Track student performance, attendance, and engagement." },
  { icon: Award, title: "Certificates & Awards", desc: "Auto-generate certificates for course completions, honor rolls, and academic achievements." },
  { icon: Shield, title: "Role-Based Access", desc: "Separate dashboards for School Admins, Teachers, and Students with appropriate permissions." },
];

const benefits = [
  { icon: GraduationCap, title: "For Students", items: ["Access all enrolled subjects in one place", "AI tutor for homework help", "Track grades and progress", "Earn certificates on completion"] },
  { icon: School, title: "For Teachers", items: ["Create and manage course content", "AI-assisted grading and feedback", "Monitor student progress", "Generate weekly reports"] },
  { icon: Shield, title: "For Administrators", items: ["Manage teachers and students", "School-wide analytics", "Send announcements", "Full control over courses"] },
];

const faqs = [
  { q: "How do I set up this LMS for my school?", a: "Clone the repository, set up the database with Docker, and configure your school details. The admin can then add teachers and students." },
  { q: "Can teachers create their own courses?", a: "Yes. Teachers have access to a drag-and-drop course builder with AI assistance to create lessons, quizzes, and flashcards." },
  { q: "How does the AI tutor work?", a: "The AI tutor uses course materials as context to answer student questions, explain concepts, and provide personalized help in each subject." },
  { q: "Are certificates automatically generated?", a: "Yes. When a student completes a course, a PDF certificate is automatically generated with a unique verification link." },
  { q: "Can this be deployed to our own servers?", a: "Absolutely. This is a self-hosted solution. You deploy it on your own infrastructure and maintain full control over your data." },
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">School Learning Management System</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Empower your{" "}
              <span className="gradient-text">school</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A complete learning management system for schools. AI-powered tools for teachers,
              interactive content for students, and full oversight for administrators.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login">
              <Button size="lg" className="text-lg px-8 h-12">Sign In</Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="text-lg px-8 h-12">Browse Subjects</Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /> <AnimatedCounter value={2500} suffix="+" /> Students</div>
            <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> <AnimatedCounter value={120} suffix="+" /> Subjects</div>
            <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> <AnimatedCounter value={85} suffix="+" /> Teachers</div>
          </motion.div>

          {/* Floating cards */}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything your school needs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform with AI-powered tools, interactive content, and comprehensive analytics for every stakeholder.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
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

      {/* Benefits by Role */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for everyone in your school</h2>
            <p className="text-lg text-muted-foreground">Tailored experiences for students, teachers, and administrators.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <AnimatedSection key={benefit.title}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <benefit.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                    <ul className="space-y-3">
                      {benefit.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-muted-foreground">
                          <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">Get your school up and running in minutes.</p>
          </AnimatedSection>

          <div className="space-y-8">
            {[
              { step: "1", icon: School, title: "Set Up Your School", desc: "Deploy the system, configure your school details, and set up the database." },
              { step: "2", icon: Users, title: "Add Teachers & Students", desc: "School admin creates accounts for teachers and students with appropriate roles." },
              { step: "3", icon: BookOpen, title: "Create Courses & Content", desc: "Teachers build courses with lessons, quizzes, and flashcards — or let AI generate them." },
              { step: "4", icon: GraduationCap, title: "Students Learn & Grow", desc: "Students access their enrolled subjects, complete assignments, and earn certificates." },
            ].map((s) => (
              <AnimatedSection key={s.step}>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                    <p className="text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
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
            {faqs.map((faq) => (
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your school?</h2>
          <p className="text-lg text-muted-foreground mb-8">Deploy this LMS and bring modern, AI-powered learning to your institution.</p>
          <Link to="/login">
            <Button size="lg" className="text-lg px-8 h-12">Get Started</Button>
          </Link>
        </AnimatedSection>
      </section>

    </div>
  );
}
