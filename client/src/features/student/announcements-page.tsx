import { motion } from "framer-motion";
import { Megaphone, AlertCircle, Info, AlertTriangle, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, Announcement } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <Megaphone className="h-7 w-7 text-primary" /> Announcements
        </h1>
        <p className="text-muted-foreground">Stay up to date with your courses and institution</p>
      </motion.div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      )}

      {!isLoading && announcements?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No announcements yet</p>
        </div>
      )}

      {!isLoading && urgent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Important
          </h2>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {urgent.map((ann) => {
              const cfg = priorityConfig[ann.priority];
              const Icon = cfg.icon;
              return (
                <motion.div key={ann.id} variants={item}>
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4 flex gap-4">
                      <Icon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
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

      {!isLoading && normal.length > 0 && (
        <section className="space-y-3">
          {urgent.length > 0 && (
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              General
            </h2>
          )}
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {normal.map((ann) => {
              const cfg = priorityConfig[ann.priority];
              const Icon = cfg.icon;
              return (
                <motion.div key={ann.id} variants={item}>
                  <Card>
                    <CardContent className="p-4 flex gap-4">
                      <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
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
