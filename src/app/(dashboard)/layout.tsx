// app/dashboard/layout.tsx
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/50">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />

      {/* Gradiente decorativo */}
      <div className="fixed top-0 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="fixed bottom-0 -right-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="relative flex">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
