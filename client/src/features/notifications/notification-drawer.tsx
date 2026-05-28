import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/stores/ui-store";
import { useNotifications, useMarkRead, useMarkAllRead } from "@/hooks/use-notifications";
import { formatDate, cn } from "@/lib/utils";

export function NotificationDrawer() {
  const { notificationDrawerOpen, setNotificationDrawerOpen } = useUIStore();
  const { data: notifications } = useNotifications();
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <AnimatePresence>
      {notificationDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setNotificationDrawerOpen(false)}
          />
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-[380px] bg-background/95 backdrop-blur-xl border-l shadow-2xl flex flex-col"
          >
            {/* Gradient top strip */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-violet-500 to-cyan-500 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 ring-1 ring-primary/15 p-2">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <Badge variant="default" className="text-xs px-1.5 py-0.5 rounded-full min-w-[20px] justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="text-xs"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" /> Read all
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setNotificationDrawerOpen(false)} aria-label="Close" className="rounded-xl">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {notifications && notifications.length > 0 ? (
                <div className="p-2 space-y-1">
                  {notifications.map((notif, i) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "p-3.5 cursor-pointer transition-colors rounded-r-lg",
                        !notif.read
                          ? "bg-primary/5 border-l-[3px] border-primary"
                          : "hover:bg-accent/40 border-l-[3px] border-transparent"
                      )}
                      onClick={() => {
                        if (!notif.read) markReadMutation.mutate(notif.id);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">{formatDate(notif.createdAt)}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5 ring-2 ring-primary/20" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="rounded-3xl bg-muted/60 p-4 mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-semibold text-foreground">You're all caught up</h3>
                  <p className="text-sm text-muted-foreground mt-1">No notifications right now.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
