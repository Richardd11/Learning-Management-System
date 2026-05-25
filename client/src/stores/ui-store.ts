import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  notificationDrawerOpen: boolean;
  aiChatOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleNotificationDrawer: () => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  toggleAiChat: () => void;
  setAiChatOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  notificationDrawerOpen: false,
  aiChatOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleNotificationDrawer: () => set((s) => ({ notificationDrawerOpen: !s.notificationDrawerOpen })),
  setNotificationDrawerOpen: (notificationDrawerOpen) => set({ notificationDrawerOpen }),
  toggleAiChat: () => set((s) => ({ aiChatOpen: !s.aiChatOpen })),
  setAiChatOpen: (aiChatOpen) => set({ aiChatOpen }),
}));
