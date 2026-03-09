import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import StoreFront from "./pages/StoreFront";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Customers from "./pages/admin/Customers";
import Events from "./pages/admin/Events";
import Coupons from "./pages/admin/Coupons";
import Settings from "./pages/admin/Settings";
import Loyalty from "./pages/admin/Loyalty";
import SuperAdminLayout from "./components/superadmin/SuperAdminLayout";
import SADashboard from "./pages/superadmin/SADashboard";
import SAStores from "./pages/superadmin/SAStores";
import SAOrders from "./pages/superadmin/SAOrders";
import SAUsers from "./pages/superadmin/SAUsers";
import SALoyalty from "./pages/superadmin/SALoyalty";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/cadastro" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Dynamic storefront */}
              <Route path="/loja/:slug" element={<StoreFront />} />
              <Route path="/pedido/:orderId" element={<OrderTracking />} />
              <Route path="/checkout" element={<Checkout />} />

              {/* Admin (multi-tenant) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="pedidos" element={<Orders />} />
                <Route path="produtos" element={<Products />} />
                <Route path="clientes" element={<Customers />} />
                <Route path="eventos" element={<Events />} />
                <Route path="cupons" element={<Coupons />} />
                <Route path="configuracoes" element={<Settings />} />
              </Route>

              {/* Super Admin */}
              <Route path="/superadmin" element={<SuperAdminLayout />}>
                <Route index element={<SADashboard />} />
                <Route path="lojas" element={<SAStores />} />
                <Route path="pedidos" element={<SAOrders />} />
                <Route path="usuarios" element={<SAUsers />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
