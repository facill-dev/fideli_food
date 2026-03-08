import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByStore } from "@/lib/multiTenantStorage";
import { useMemo } from "react";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function Customers() {
  const { store } = useAuth();
  const orders = getOrdersByStore(store?.id || "");

  // Derive unique customers from orders
  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; totalOrders: number; totalSpent: number; lastOrder: string }>();
    orders.forEach((o) => {
      const key = o.customerPhone || o.customerName;
      const existing = map.get(key);
      if (existing) {
        existing.totalOrders++;
        existing.totalSpent += o.total;
        if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
      } else {
        map.set(key, {
          name: o.customerName,
          phone: o.customerPhone,
          totalOrders: 1,
          totalSpent: o.total,
          lastOrder: o.createdAt,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Clientes</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Base de clientes derivada dos pedidos</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total clientes</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{customers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingBag className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total pedidos</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{orders.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        {customers.length === 0 ? (
          <CardContent className="text-center py-12">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm text-muted-foreground">Nenhum cliente ainda.</p>
            <p className="text-xs text-muted-foreground mt-1">Os clientes aparecerão aqui quando pedidos forem realizados.</p>
          </CardContent>
        ) : (
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2">
              {customers.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(c.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">{c.totalOrders} pedido{c.totalOrders > 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
