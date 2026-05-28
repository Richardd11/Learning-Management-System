import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Mail, Save, Award, BookOpen, Zap, Flame } from "lucide-react";
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
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground/80 text-base mb-6">Manage your account information</p>
      </motion.div>

      <div className="space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 rounded-xl border border-border/50 overflow-hidden divide-x divide-border">
            {[
              { icon: Zap, label: "XP", value: user.xp },
              { icon: Flame, label: "Streak", value: `${user.streak} days` },
              { icon: BookOpen, label: "Role", value: user.role.toLowerCase() },
              { icon: Award, label: "Member since", value: new Date(user.createdAt).getFullYear().toString() },
            ].map((stat) => (
              <div key={stat.label} className="p-4 text-center bg-card">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-semibold capitalize">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold mb-4 border-b border-border/50 pb-3 flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="text-lg">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
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
                    className="w-full min-h-[100px] border rounded-md px-3 py-2 text-sm resize-y"
                    placeholder="Tell us about yourself..."
                    {...register("bio")}
                  />
                </div>
                <Button type="submit" disabled={updateMutation.isPending} className="shadow-sm">
                  <Save className="h-4 w-4 mr-2" /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
