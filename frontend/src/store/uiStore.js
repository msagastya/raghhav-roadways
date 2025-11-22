import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Dark mode state
      darkMode: false,
      toggleDarkMode: () => {
        const newMode = !get().darkMode;
        if (typeof window !== 'undefined') {
          if (newMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ darkMode: newMode });
      },
      setDarkMode: (mode) => {
        if (typeof window !== 'undefined') {
          if (mode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ darkMode: mode });
      },
      initDarkMode: () => {
        const { darkMode } = get();
        if (typeof window !== 'undefined') {
          // Check system preference if no saved preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const shouldBeDark = darkMode || prefersDark;
          if (shouldBeDark) {
            document.documentElement.classList.add('dark');
            set({ darkMode: true });
          }
        }
      },

      // Table density
      tableDensity: 'normal', // 'compact', 'normal', 'comfortable'
      setTableDensity: (density) => set({ tableDensity: density }),

      // Notifications panel
      notificationsPanelOpen: false,
      toggleNotificationsPanel: () => set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),

      // Command palette (for keyboard shortcuts)
      commandPaletteOpen: false,
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
        tableDensity: state.tableDensity,
      }),
    }
  )
);

export default useUIStore;
