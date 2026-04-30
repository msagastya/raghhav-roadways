import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: false,
  sidebarHovered: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarHovered: (hovered) => set({ sidebarHovered: hovered }),
}));

export default useUIStore;
