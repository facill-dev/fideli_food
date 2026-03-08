import { useAuth } from "@/contexts/AuthContext";
import { isSuperAdmin } from "@/lib/multiTenantStorage";
import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SuperAdminSidebar from "./SuperAdminSidebar";

export default function SuperAdminLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isSuperAdmin(user)) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border/50 px-2 sm:px-4 shrink-0">
            <SidebarTrigger className="mr-2" />
            <span className="text-xs font-mono font-bold text-primary tracking-wider uppercase">Super Admin</span>
          </header>
          <main className="flex-1 overflow-y-auto p-3 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
