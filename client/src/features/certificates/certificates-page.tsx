import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, ExternalLink, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ApiResponse, Certificate } from "@/types";

function ConfettiCanvas() {
  useEffect(() => {
    const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; life: number;
    }> = [];

    const colors = ["#7c3aed", "#ec4899", "#f97316", "#22c55e", "#3b82f6"];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        life: 1,
      });
    }

    let animationId: number;
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.005;
        ctx!.globalAlpha = p.life;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(p.x, p.y, p.size, p.size * 0.6);
      }
      ctx!.globalAlpha = 1;
      if (alive) animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas id="confetti-canvas" className="fixed inset-0 pointer-events-none z-50" />
  );
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } };

export function CertificatesPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { data: certificates, isLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: () => api.get<ApiResponse<Certificate[]>>("/users/certificates"),
    select: (res) => res.data,
  });

  useEffect(() => {
    if (certificates && certificates.length > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [certificates]);

  return (
    <div className="max-w-4xl mx-auto">
      {showConfetti && <ConfettiCanvas />}

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Award className="h-7 w-7 text-primary" /> My Certificates
        </h1>
        <p className="text-muted-foreground mb-8">Your earned certificates of completion</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : certificates && certificates.length > 0 ? (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <motion.div key={cert.id} variants={item}>
              <Card className="overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-primary via-pink-500 to-orange-500" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Award className="h-10 w-10 text-primary" />
                    <span className="text-xs text-muted-foreground">{formatDate(cert.issuedAt)}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{cert.course?.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Certificate of Completion</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/api/users/certificates/verify/${cert.verificationId}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> Verify
                      </a>
                    </Button>
                    {cert.pdfUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cert.pdfUrl} download>
                          <Download className="h-3 w-3 mr-1" /> Download
                        </a>
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 font-mono">ID: {cert.verificationId}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground">Complete a course to earn your first certificate!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
