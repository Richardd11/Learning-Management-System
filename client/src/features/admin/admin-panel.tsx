import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, BookOpen, TrendingUp, Ban, UserCog, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import type { ApiResponse, AdminStats, PaginatedResponse } from "@/types";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isBanned: boolean;
  xp: number;
  avatar: string | null;
  createdAt: string;
  _count: { enrollments: number; courses: number };
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function AdminPanel() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"overview" | "users" | "moderation" | "broadcast">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => api.get<ApiResponse<AdminStats>>("/admin/stats"),
    select: (res) => res.data,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers", searchQuery],
    queryFn: () => api.get<ApiResponse<PaginatedResponse<AdminUser>>>(`/admin/users?search=${searchQuery}`),
    select: (res) => res.data,
    enabled: tab === "users",
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) =>
      api.put(`/admin/users/${userId}/ban`, { isBanned }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); toast.success("User updated"); },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.put(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); toast.success("Role updated"); },
  });

  const broadcastMutation = useMutation({
    mutationFn: (data: { title: string; message: string }) =>
      api.post("/notifications/broadcast", data),
    onSuccess: () => { toast.success("Announcement sent!"); setBroadcastTitle(""); setBroadcastMessage(""); },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" /> School Administration
        </h1>
        <p className="text-muted-foreground mb-6">Manage teachers, students, subjects, and school settings</p>
      </motion.div>

      <div className="flex gap-2 mb-6 border-b pb-2 overflow-x-auto">
        {[
          { key: "overview" as const, icon: TrendingUp, label: "Overview" },
          { key: "users" as const, icon: Users, label: "Users" },
          { key: "moderation" as const, icon: BookOpen, label: "Moderation" },
          { key: "broadcast" as const, icon: Megaphone, label: "Broadcast" },
        ].map((t) => (
          <Button key={t.key} variant={tab === t.key ? "default" : "ghost"} size="sm" onClick={() => setTab(t.key)}>
            <t.icon className="h-4 w-4 mr-1" /> {t.label}
          </Button>
        ))}
      </div>

      {tab === "overview" && (
        <motion.div variants={container} initial="hidden" animate="show">
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users },
                  { label: "Total Subjects", value: stats?.totalCourses ?? 0, icon: BookOpen },
                  { label: "Total Enrollments", value: stats?.totalEnrollments ?? 0, icon: TrendingUp },
                  { label: "Active This Week", value: stats?.activeStudents ?? 0, icon: Users },
                ].map((stat) => (
                  <motion.div key={stat.label} variants={item}>
                    <Card>
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                        <stat.icon className="h-8 w-8 text-primary/60" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card>
                <CardHeader><CardTitle>Recent Enrollments</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentEnrollments?.map((e) => (
                      <div key={e.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                        <span>{e.user.firstName} {e.user.lastName}</span>
                        <span className="text-muted-foreground">{e.course.title}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      )}

      {tab === "users" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-4">
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {usersLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-2">
              {usersData?.data?.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={user.isBanned ? "destructive" : "secondary"}>{user.role}</Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => banMutation.mutate({ userId: user.id, isBanned: !user.isBanned })}
                      >
                        <Ban className="h-3 w-3 mr-1" /> {user.isBanned ? "Unban" : "Ban"}
                      </Button>
                      <select
                        className="border rounded px-2 py-1 text-xs"
                        value={user.role}
                        onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value })}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Teacher</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {tab === "broadcast" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Send Announcement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Title" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
              <textarea
                className="w-full min-h-[120px] border rounded-md px-3 py-2 text-sm resize-y"
                placeholder="Announcement message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
              <Button
                onClick={() => broadcastMutation.mutate({ title: broadcastTitle, message: broadcastMessage })}
                disabled={!broadcastTitle || !broadcastMessage || broadcastMutation.isPending}
              >
                {broadcastMutation.isPending ? "Sending..." : "Send to All Users"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === "moderation" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Course moderation queue will appear here when courses are submitted for review.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
