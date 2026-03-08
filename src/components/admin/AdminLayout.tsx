import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import NotificationPopover from "./NotificationPopover";

export default function AdminLayout() {
  const { user, store, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!store) {
      navigate("/onboarding");
    }
  }, [user, store, navigate]);

  if (!user || !store) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-3 sm:px-4 shrink-0 z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:block">
                {store.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <NotificationPopover storeId={store.id} />
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
