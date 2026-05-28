import { motion } from "framer-motion";
import { Megaphone, AlertCircle, Info, AlertTriangle, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, Announcement } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

const priorityConfig = {
  urgent: { color: "destructive" as const, icon: AlertCircle, label: "Urgent" },
  high: { color: "destructive" as const, icon: AlertTriangle, label: "High" },
  normal: { color: "secondary" as const, icon: Info, label: "Normal" },
  low: { color: "outline" as const, icon: Bell, label: "Low" },
};

export function AnnouncementsPage() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["myAnnouncements"],
    queryFn: () => api.get<ApiResponse<Announcement[]>>("/announcements/my"),
    select: (res) => res.data ?? [],
  });

  const urgent = announcements?.filter((a) => a.priority === "urgent" || a.priority === "high") ?? [];
  const normal = announcements?.filter((a) => a.priority === "normal" || a.priority === "low") ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-2xl bg-primary/10 ring-1 ring-primary/15 p-3">
              <Megaphone className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Stay up to date with your courses and institution</p>
            </div>
            {announcements && announcements.length > 0 && (
              <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1 rounded-full">
                {announcements.length} total
              </Badge>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && announcements?.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center rounded-3xl bg-muted/60 p-5 mb-4">
            <Megaphone className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No announcements yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            When your instructors or institution post updates, they'll appear here.
          </p>
        </div>
      )}

      {/* Urgent / Important Section */}
      {!isLoading && urgent.length > 0 && (
        <section className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            Important
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {urgent.map((ann) => {
              const cfg = priorityConfig[ann.priority];
              const Icon = cfg.icon;
              return (
                <motion.div key={ann.id} variants={item} whileHover={{ x: 3 }}>
                  <Card className="rounded-2xl border-l-4 border-l-destructive border-destructive/20 bg-destructive/5 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex gap-4">
                      <div className="rounded-xl p-2 bg-destructive/10 ring-1 ring-destructive/15 shrink-0 self-start">
                        <Icon className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold">{ann.title}</p>
                          <Badge variant={cfg.color} className="text-xs">{cfg.label}</Badge>
                          {ann.isInstitutionWide && (
                            <Badge variant="outline" className="text-xs">School-wide</Badge>
                          )}
                          {ann.course && (
                            <Badge variant="secondary" className="text-xs">{ann.course.title}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{ann.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {ann.author ? `${ann.author.firstName} ${ann.author.lastName} · ` : ""}
                          {new Date(ann.createdAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}

      {/* Normal / General Section */}
      {!isLoading && normal.length > 0 && (
        <section className="space-y-3">
          {urgent.length > 0 && (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              General
            </div>
          )}
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {normal.map((ann) => {
              const cfg = priorityConfig[ann.priority];
              const Icon = cfg.icon;
              return (
                <motion.div key={ann.id} variants={item} whileHover={{ x: 3 }}>
                  <Card className="rounded-2xl border-l-4 border-l-primary/40 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex gap-4">
                      <div className="rounded-xl p-2 bg-primary/10 ring-1 ring-primary/15 shrink-0 self-start">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold">{ann.title}</p>
                          {ann.isInstitutionWide && (
                            <Badge variant="outline" className="text-xs">School-wide</Badge>
                          )}
                          {ann.course && (
                            <Badge variant="secondary" className="text-xs">{ann.course.title}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{ann.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {ann.author ? `${ann.author.firstName} ${ann.author.lastName} · ` : ""}
                          {new Date(ann.createdAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}
    </div>
  );
}
