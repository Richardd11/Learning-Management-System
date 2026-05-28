import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Mail, Save, Award, BookOpen, Zap, Flame, Settings } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import type { ApiResponse, User as UserType } from "@/types";

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  bio: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const statItem = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const statColors = [
  { bg: "bg-amber-500/10", ring: "ring-amber-500/15", text: "text-amber-600" },
  { bg: "bg-orange-500/10", ring: "ring-orange-500/15", text: "text-orange-600" },
  { bg: "bg-blue-500/10", ring: "ring-blue-500/15", text: "text-blue-600" },
  { bg: "bg-emerald-500/10", ring: "ring-emerald-500/15", text: "text-emerald-600" },
];

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      bio: user?.bio ?? "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      api.put<ApiResponse<UserType>>("/users/profile", data),
    onSuccess: (res) => {
      if (res.data) {
        setUser(res.data as UserType);
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        toast.success("Profile updated!");
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Update failed");
    },
  });

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Dark hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_52%,#111827_100%)] p-6 text-white shadow-2xl shadow-slate-950/15"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.3)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(14,165,233,0.18)_0%,_transparent_45%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <motion.div
          className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="rounded-2xl bg-white/10 ring-1 ring-white/15 p-3 backdrop-blur">
            <Settings className="h-7 w-7 text-violet-200" />
          </div>
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/75 backdrop-blur">
              <User className="h-3 w-3" /> Account
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Profile &amp; Settings</h1>
            <p className="text-sm text-white/65 mt-0.5">Manage your personal information and preferences</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { icon: Zap, label: "XP", value: user.xp },
          { icon: Flame, label: "Streak", value: `${user.streak} days` },
          { icon: BookOpen, label: "Role", value: user.role.toLowerCase() },
          { icon: Award, label: "Member since", value: new Date(user.createdAt).getFullYear().toString() },
        ].map((stat, idx) => (
          <motion.div key={stat.label} variants={statItem} whileHover={{ y: -3 }}>
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`rounded-xl p-2 ${statColors[idx].bg} ring-1 ${statColors[idx].ring}`}>
                  <stat.icon className={`h-5 w-5 ${statColors[idx].text}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-semibold capitalize">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="rounded-xl p-2 bg-primary/10 ring-1 ring-primary/15">
                <User className="h-4 w-4 text-primary" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5 mb-8">
              <Avatar className="h-20 w-20 ring-4 ring-primary/20 shadow-xl">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback className="text-lg font-semibold">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-2xl font-bold tracking-tight">{user.firstName} {user.lastName}</p>
                <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${user.role === "ADMIN" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : user.role === "TEACHER" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                  {user.role.toLowerCase()}
                </span>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Mail className="h-3 w-3" /> {user.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input {...register("firstName")} />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input {...register("lastName")} />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="w-full min-h-[100px] border rounded-xl px-3 py-2.5 text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Tell us about yourself..."
                  {...register("bio")}
                />
              </div>
              <Button type="submit" disabled={updateMutation.isPending} className="shadow-sm rounded-xl">
                <Save className="h-4 w-4 mr-2" /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
