import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getProductsByStore,
  getOrdersByStore,
  getCategoriesByStore,
  type TenantOrder,
} from "@/lib/multiTenantStorage";
import { getStoreConfig, getWalletsByStore } from "@/lib/loyaltyStorage";
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Rocket,
  Heart,
  BarChart3,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function KpiCard({
  title,
  value,
  icon: Icon,
  accent,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  accent?: boolean;
  subtitle?: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{title}</p>
            <p className={`text-lg sm:text-xl md:text-2xl font-bold font-display ${accent ? "text-primary" : "text-foreground"} truncate`}>{value}</p>
            {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0 ml-2">
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type Period = "7d" | "30d";

function getDateRange(period: Period): Date {
  const now = new Date();
  const days = period === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

interface DailySales {
  date: string;
  total: number;
  orders: number;
}

interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

function computeSalesData(orders: TenantOrder[], period: Period): DailySales[] {
  const startDate = getDateRange(period);
  const days = period === "7d" ? 7 : 30;
  const result: DailySales[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dateStr = formatShortDate(d);
    result.push({ date: dateStr, total: 0, orders: 0 });
  }

  orders
    .filter((o) => new Date(o.createdAt) >= startDate && o.status !== "cancelled")
    .forEach((o) => {
      const orderDate = formatShortDate(new Date(o.createdAt));
      const entry = result.find((r) => r.date === orderDate);
      if (entry) {
        entry.total += o.total;
        entry.orders += 1;
      }
    });

  return result;
}

function computeTopProducts(orders: TenantOrder[], period: Period, limit = 5): TopProduct[] {
  const startDate = getDateRange(period);
  const productMap = new Map<string, TopProduct>();

  orders
    .filter((o) => new Date(o.createdAt) >= startDate && o.status !== "cancelled")
    .forEach((o) => {
      o.items.forEach((item) => {
        const existing = productMap.get(item.name);
        if (existing) {
          existing.qty += item.qty;
          existing.revenue += item.qty * item.price;
        } else {
          productMap.set(item.name, {
            name: item.name,
            qty: item.qty,
            revenue: item.qty * item.price,
          });
        }
      });
    });

  return Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

function computeAvgTicketTrend(orders: TenantOrder[], period: Period): { date: string; avg: number }[] {
  const startDate = getDateRange(period);
  const days = period === "7d" ? 7 : 30;
  const result: { date: string; total: number; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dateStr = formatShortDate(d);
    result.push({ date: dateStr, total: 0, count: 0 });
  }

  orders
    .filter((o) => new Date(o.createdAt) >= startDate && o.status !== "cancelled")
    .forEach((o) => {
      const orderDate = formatShortDate(new Date(o.createdAt));
      const entry = result.find((r) => r.date === orderDate);
      if (entry) {
        entry.total += o.total;
        entry.count += 1;
      }
    });

  return result.map((r) => ({
    date: r.date,
    avg: r.count > 0 ? Math.round(r.total / r.count) : 0,
  }));
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.3)",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  ready: "#22c55e",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

interface StatusData {
  name: string;
  value: number;
  status: string;
}

function computeStatusData(orders: TenantOrder[]): StatusData[] {
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      status,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

function exportOrdersCSV(orders: TenantOrder[], storeName: string) {
  const headers = ["ID", "Data", "Cliente", "Telefone", "Itens", "Total", "Status"];
  const rows = orders.map((o) => [
    o.id,
    new Date(o.createdAt).toLocaleString("pt-BR"),
    o.customerName,
    o.customerPhone,
    o.items.map((i) => `${i.qty}x ${i.name}`).join("; "),
    o.total.toFixed(2).replace(".", ","),
    STATUS_LABELS[o.status] || o.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pedidos-${storeName}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { store } = useAuth();
  const navigate = useNavigate();
  const storeId = store?.id || "";
  const products = getProductsByStore(storeId);
  const orders = getOrdersByStore(storeId);
  const categories = getCategoriesByStore(storeId);
  const [period, setPeriod] = useState<Period>("7d");

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const loyaltyConfig = getStoreConfig(storeId);
  const loyaltyWallets = getWalletsByStore(storeId);
  const loyaltyClients = loyaltyWallets.filter((w) => w.pointsBalance > 0 || w.cashbackBalance > 0).length;

  const isEmpty = products.length === 0 && orders.length === 0;

  // Chart data
  const salesData = useMemo(() => computeSalesData(orders, period), [orders, period]);
  const topProducts = useMemo(() => computeTopProducts(orders, period), [orders, period]);
  const avgTicketTrend = useMemo(() => computeAvgTicketTrend(orders, period), [orders, period]);
  const statusData = useMemo(() => computeStatusData(orders), [orders]);

  // Period stats
  const periodOrders = salesData.reduce((s, d) => s + d.orders, 0);
  const periodRevenue = salesData.reduce((s, d) => s + d.total, 0);
  const periodAvgTicket = periodOrders > 0 ? periodRevenue / periodOrders : 0;

  const handleExportCSV = () => {
    exportOrdersCSV(orders, store?.name || "loja");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Visão geral da {store?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEmpty && orders.length > 0 && (
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </Button>
          )}
          {!isEmpty && (
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={period === "7d" ? "default" : "ghost"}
                size="sm"
                className="text-xs h-7 px-3"
                onClick={() => setPeriod("7d")}
              >
                7 dias
              </Button>
              <Button
                variant={period === "30d" ? "default" : "ghost"}
                size="sm"
                className="text-xs h-7 px-3"
                onClick={() => setPeriod("30d")}
              >
                30 dias
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <KpiCard title="Produtos" value={String(products.length)} icon={Package} />
        <KpiCard title="Categorias" value={String(categories.length)} icon={ShoppingBag} />
        <KpiCard title="Pedidos" value={String(orders.length)} icon={TrendingUp} subtitle={`${periodOrders} nos últimos ${period === "7d" ? "7" : "30"} dias`} />
        <KpiCard title="Faturamento" value={formatCurrency(totalRevenue)} icon={DollarSign} accent subtitle={`${formatCurrency(periodRevenue)} no período`} />
        {loyaltyConfig.enabled && (
          <KpiCard title="Clientes fidelizados" value={String(loyaltyClients)} icon={Heart} />
        )}
      </div>

      {/* Getting started / Charts */}
      {isEmpty ? (
        <Card className="border-border/50">
          <CardContent className="p-6 sm:p-10 text-center">
            <Rocket className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-display text-lg font-bold text-foreground mb-2">
              Comece a montar seu cardápio!
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Sua loja já está no ar. Agora adicione produtos para que seus clientes possam fazer pedidos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/admin/produtos")} className="gap-2">
                <Package className="h-4 w-4" />
                Adicionar produtos
              </Button>
              {store && (
                <Button variant="outline" asChild className="gap-2">
                  <a href={`/loja/${store.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Ver minha loja
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Sales Chart */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-display flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Vendas por período
                </CardTitle>
                <div className="text-right">
                  <p className="text-lg font-bold font-display text-foreground">{formatCurrency(periodRevenue)}</p>
                  <p className="text-[10px] text-muted-foreground">{periodOrders} pedidos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              {salesData.every((d) => d.total === 0) ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Nenhuma venda no período</p>
                </div>
              ) : (
                <div className="h-[200px] sm:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                        interval={period === "30d" ? 4 : 0}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                        tickFormatter={(v) => `R$${v}`}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Vendas"]}
                        labelFormatter={(label) => `Data: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#salesGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Top Products */}
            <Card className="border-border/50">
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-base font-display">Produtos mais vendidos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                {topProducts.length === 0 ? (
                  <div className="h-[180px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Nenhuma venda no período</p>
                  </div>
                ) : (
                  <div className="h-[180px] sm:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topProducts}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                          width={80}
                          tickFormatter={(v) => v.length > 12 ? `${v.slice(0, 12)}...` : v}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number, _name, props) => [
                            `${value} unidades · ${formatCurrency(props.payload.revenue)}`,
                            "Vendidos",
                          ]}
                        />
                        <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
                          {topProducts.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sales by Status Donut */}
            <Card className="border-border/50">
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-base font-display">Vendas por status</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                {statusData.length === 0 ? (
                  <div className="h-[180px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Nenhum pedido para classificar</p>
                  </div>
                ) : (
                  <div className="h-[180px] sm:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {statusData.map((entry) => (
                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "hsl(var(--muted-foreground))"} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number, _name, props) => [
                            `${value} pedido${value > 1 ? "s" : ""}`,
                            props.payload.name,
                          ]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

          {/* Recent orders + Quick stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Recent orders */}
            <Card className="border-border/50">
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base font-display">Pedidos recentes</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/admin/pedidos")}>
                    Ver todos <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum pedido ainda</p>
                ) : (
                  <div className="space-y-2">
                    {orders.slice(-5).reverse().map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{o.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {o.items.length} {o.items.length === 1 ? "item" : "itens"} · {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-foreground shrink-0 ml-2">{formatCurrency(o.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card className="border-border/50">
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-base font-display">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold font-display text-foreground">{pendingOrders}</p>
                    <p className="text-xs text-muted-foreground">Pedidos pendentes</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold font-display text-foreground">{formatCurrency(avgTicket)}</p>
                    <p className="text-xs text-muted-foreground">Ticket médio geral</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">Link da sua loja</p>
                  <a
                    href={`/loja/${store?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline break-all"
                  >
                    {window.location.origin}/loja/{store?.slug}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
