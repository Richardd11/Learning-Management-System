import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { NotificationDrawer } from "@/features/notifications/notification-drawer";
import { AiChatWidget } from "@/features/player/ai-chat-widget";
import { useAuthStore } from "@/stores/auth-store";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <AnimatePresence mode="wait">
          <motion.main
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      {isAuthenticated && (
        <>
          <NotificationDrawer />
          <AiChatWidget />
        </>
      )}
    </div>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
