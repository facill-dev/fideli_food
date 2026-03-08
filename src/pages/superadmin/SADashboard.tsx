import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllStores, getAllOrders, getAllUsers, getAllProducts, NICHES,
  type StoreConfig, type TenantOrder,
} from "@/lib/multiTenantStorage";
import {
  Store, ShoppingBag, Users, DollarSign, TrendingUp, Package,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function KpiCard({ title, value, icon: Icon, accent }: {
  title: string; value: string; icon: React.ElementType; accent?: boolean;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 space-y-0.5">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">{title}</p>
            <p className={`text-lg sm:text-2xl font-bold font-display ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
          </div>
          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 ml-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SADashboard() {
  const stores = getAllStores();
  const orders = getAllOrders();
  const users = getAllUsers();
  const products = getAllProducts();

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;

  // Orders by store
  const storeMap = new Map<string, StoreConfig>();
  stores.forEach((s) => storeMap.set(s.id, s));

  const ordersByStore = stores.map((s) => {
    const storeOrders = orders.filter((o) => o.storeId === s.id);
    return {
      name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
      pedidos: storeOrders.length,
      receita: Math.round(storeOrders.reduce((sum, o) => sum + o.total, 0)),
    };
  }).sort((a, b) => b.receita - a.receita).slice(0, 8);

  // Niche distribution
  const nicheCount: Record<string, number> = {};
  stores.forEach((s) => {
    nicheCount[s.niche] = (nicheCount[s.niche] || 0) + 1;
  });
  const nicheData = Object.entries(nicheCount).map(([id, count]) => ({
    name: NICHES.find((n) => n.id === id)?.label || id,
    lojas: count,
  })).sort((a, b) => b.lojas - a.lojas);

  // Orders over last 14 days (mock timeline from existing orders)
  const days = 14;
  const dailyOrders = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayOrders = orders.filter((o) => o.createdAt.startsWith(dateStr));
    return {
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      pedidos: dayOrders.length,
      receita: Math.round(dayOrders.reduce((s, o) => s + o.total, 0)),
    };
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Dashboard Global</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Visão geral de todas as lojas do sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <KpiCard title="Lojas" value={String(stores.length)} icon={Store} />
        <KpiCard title="Usuários" value={String(users.length)} icon={Users} />
        <KpiCard title="Pedidos" value={String(orders.length)} icon={ShoppingBag} />
        <KpiCard title="Faturamento total" value={formatCurrency(totalRevenue)} icon={DollarSign} accent />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <KpiCard title="Produtos" value={String(products.length)} icon={Package} />
        <KpiCard title="Pedidos pendentes" value={String(pendingOrders)} icon={TrendingUp} />
        <KpiCard title="Ticket médio" value={formatCurrency(avgTicket)} icon={DollarSign} />
        <KpiCard title="Nichos ativos" value={String(Object.keys(nicheCount).length)} icon={Store} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Revenue by store */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm font-display">Receita por loja</CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-3">
            {ordersByStore.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Nenhuma loja com pedidos</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ordersByStore}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number) => [formatCurrency(value), "Receita"]}
                  />
                  <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Niche distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm font-display">Lojas por nicho</CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-3">
            {nicheData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Nenhuma loja cadastrada</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={nicheData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={90} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="lojas" fill="hsl(var(--caramel))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily orders area chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-sm font-display">Pedidos nos últimos 14 dias</CardTitle>
        </CardHeader>
        <CardContent className="px-1 sm:px-4 pb-3">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                formatter={(value: number, name: string) => [
                  name === "receita" ? formatCurrency(value) : value,
                  name === "receita" ? "Receita" : "Pedidos",
                ]}
              />
              <Area type="monotone" dataKey="pedidos" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
