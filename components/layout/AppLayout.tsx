"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TransactionModal } from "../dashboard/TransactionModal";
import { useStore } from "@/store/useStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { ui, setTransactionModalOpen } = useStore();

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <TransactionModal
        isOpen={ui.isTransactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
      />
    </div>
  );
}
