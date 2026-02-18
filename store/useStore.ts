import { create } from "zustand";

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
}

interface CompanyState {
  name: string;
  taxId: string;
  vatRate: number;
}

interface DashboardState {
  stats: any[];
  recentActivity: any[];
  isLoadingActivity: boolean;
}

interface UIState {
  isTransactionModalOpen: boolean;
}

interface AppStore {
  user: UserState | null;
  company: CompanyState;
  dashboard: DashboardState;
  ui: UIState;
  notifications: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;
  setUser: (user: UserState | null) => void;
  setCompany: (company: Partial<CompanyState>) => void;
  setDashboard: (dashboard: Partial<DashboardState>) => void;
  setTransactionModalOpen: (open: boolean) => void;
  addNotification: (message: string, type: "success" | "error" | "info") => void;
  removeNotification: (id: string) => void;
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  company: {
    name: "Davasoft",
    taxId: "900.000.000-1",
    vatRate: 19,
  },
  dashboard: {
    stats: [],
    recentActivity: [],
    isLoadingActivity: true,
  },
  ui: {
    isTransactionModalOpen: false,
  },
  notifications: [],
  setUser: (user) => set({ user }),
  setCompany: (company) =>
    set((state) => ({ company: { ...state.company, ...company } })),
  setDashboard: (dashboard) =>
    set((state) => ({ dashboard: { ...state.dashboard, ...dashboard } })),
  setTransactionModalOpen: (open) =>
    set((state) => ({ ui: { ...state.ui, isTransactionModalOpen: open } })),
  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Math.random().toString(36).substring(7), message, type },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
