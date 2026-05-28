import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, Github, BookOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginForm } from "@/lib/schemas";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch">

      {/* ── Left branded panel (desktop only) ────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center bg-gradient-to-br from-primary/90 via-primary to-violet-800 text-white p-12 relative overflow-hidden"
      >
        <div className="relative z-10 max-w-xs text-center">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm ring-1 ring-white/20">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight">LearnHub LMS</h2>
          <p className="text-white/75 text-base leading-relaxed">
            Your institutional learning management system. Access courses, track progress, and manage your educational journey.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { value: "500+", label: "Courses" },
              { value: "10K+", label: "Students" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm ring-1 ring-white/10">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-white/65 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* decorative blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/6 rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/6 rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.2)_0%,_transparent_60%)] pointer-events-none" />
      </motion.div>

      {/* ── Right panel — login form ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center pb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
              <CardDescription className="text-sm">
                Welcome back. Enter your credentials to access your portal.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@school.edu"
                      className="pl-9"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-9 pr-9"
                      {...register("password")}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-end">
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 font-semibold"
                  disabled={isSubmitting || loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Signing in…
                    </span>
                  ) : "Sign in"}
                </Button>
              </form>

              {/* OAuth */}
              <div className="mt-5">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground/60 font-medium tracking-wider">Or continue with</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <Button variant="outline" type="button" onClick={() => window.location.href = "/api/auth/google"} className="h-9">
                    <svg className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button" onClick={() => window.location.href = "/api/auth/github"} className="h-9">
                    <Github className="h-3.5 w-3.5 mr-1.5" />
                    GitHub
                  </Button>
                </div>
              </div>

              {/* Demo credentials */}
              <div className="mt-5 p-3.5 bg-muted/40 rounded-xl border border-border/50 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 text-center mb-2">
                  Demo Credentials
                </p>
                {[
                  { role: "Admin", email: "admin@school.edu" },
                  { role: "Teacher", email: "teacher1@school.edu" },
                  { role: "Student", email: "student1@school.edu" },
                ].map((c) => (
                  <div
                    key={c.role}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent/70 cursor-pointer transition-colors"
                    onClick={() => { setValue("email", c.email); setValue("password", "password123"); }}
                  >
                    <span className="text-xs font-semibold text-foreground">{c.role}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{c.email}</span>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground/50 text-center pt-0.5">
                  Click a row to auto-fill · password: password123
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
