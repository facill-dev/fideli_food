import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-3 sm:px-4 shrink-0 z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:block">
                Bem-vinda de volta
              </span>
            </div>
            <Button variant="ghost" size="icon" className="relative shrink-0">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
