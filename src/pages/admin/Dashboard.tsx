import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dashboardMetrics,
  revenueByDay,
  ordersByHour,
  topProducts,
  salesByCategory,
  ordersByType,
  monthlyRevenue,
} from "@/data/adminMockData";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const COLORS = [
  "hsl(340, 70%, 55%)",
  "hsl(25, 80%, 55%)",
  "hsl(350, 80%, 25%)",
  "hsl(340, 80%, 75%)",
  "hsl(145, 60%, 40%)",
  "hsl(35, 60%, 50%)",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold font-display text-foreground truncate">{value}</p>
            {subtitle && <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            {trend && trendValue && (
              <span
                className={`flex items-center text-[10px] sm:text-xs font-medium ${
                  trend === "up" ? "text-green-600" : "text-destructive"
                }`}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trendValue}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-card border border-border/50">
      <div className={`p-1.5 sm:p-2 rounded-md shrink-0 ${color}`}>
        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-base sm:text-lg font-bold font-display text-foreground">{value}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const m = dashboardMetrics;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Visao geral da operacao</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <KpiCard title="Faturamento Hoje" value={formatCurrency(m.revenueToday)} subtitle="18 pedidos" icon={DollarSign} trend="up" trendValue="+12%" />
        <KpiCard title="Faturamento Semana" value={formatCurrency(m.revenueWeek)} subtitle="94 pedidos" icon={TrendingUp} trend="up" trendValue="+8%" />
        <KpiCard title="Faturamento Mes" value={formatCurrency(m.revenueMonth)} subtitle="387 pedidos" icon={DollarSign} trend="up" trendValue="+15%" />
        <KpiCard title="Ticket Medio" value={formatCurrency(m.averageTicket)} subtitle={`${m.customersTotal} clientes`} icon={Users} trend="down" trendValue="-3%" />
      </div>

      {/* Status dos pedidos */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-sm sm:text-base font-display">Status dos Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1.5 sm:gap-2">
            <StatusCard label="Aguardando pgto" value={m.pendingPayment} icon={Clock} color="bg-amber-100 text-amber-700" />
            <StatusCard label="Confirmados" value={m.confirmed} icon={CheckCircle2} color="bg-blue-100 text-blue-700" />
            <StatusCard label="Em preparacao" value={m.inProduction} icon={Package} color="bg-purple-100 text-purple-700" />
            <StatusCard label="Prontos" value={m.ready} icon={CheckCircle2} color="bg-green-100 text-green-700" />
            <StatusCard label="Entregues" value={m.delivered} icon={Truck} color="bg-emerald-100 text-emerald-700" />
            <StatusCard label="Retirados" value={m.pickedUp} icon={ShoppingBag} color="bg-teal-100 text-teal-700" />
            <StatusCard label="Cancelados" value={m.cancelled} icon={XCircle} color="bg-red-100 text-red-700" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Faturamento semanal */}
        <Card className="border-border/50">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-display">Faturamento Semanal</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <ChartContainer config={{ revenue: { label: "Faturamento", color: "hsl(340, 70%, 55%)" } }} className="h-[200px] sm:h-[260px] w-full">
              <BarChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" tick={{ fill: "hsl(340, 10%, 45%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(340, 10%, 45%)", fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} width={35} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(340, 70%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Evolucao mensal */}
        <Card className="border-border/50">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-display">Evolucao Mensal</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <ChartContainer config={{ revenue: { label: "Receita", color: "hsl(25, 80%, 55%)" } }} className="h-[200px] sm:h-[260px] w-full">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(25, 80%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(25, 80%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(340, 10%, 45%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(340, 10%, 45%)", fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} width={35} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(25, 80%, 55%)" fill="url(#gradRevenue)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pedidos por horario */}
        <Card className="border-border/50">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-display">Pedidos por Horario</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <ChartContainer config={{ orders: { label: "Pedidos", color: "hsl(350, 80%, 25%)" } }} className="h-[200px] sm:h-[260px] w-full">
              <LineChart data={ordersByHour}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fill: "hsl(340, 10%, 45%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(340, 10%, 45%)", fontSize: 11 }} width={25} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="orders" stroke="hsl(350, 80%, 25%)" strokeWidth={2} dot={{ fill: "hsl(350, 80%, 25%)", r: 3 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Vendas por categoria */}
        <Card className="border-border/50">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-display">Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={salesByCategory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                      {salesByCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5 sm:space-y-2 w-full">
                {salesByCategory.map((item, i) => (
                  <div key={item.category} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-foreground">{item.category}</span>
                    </div>
                    <span className="text-muted-foreground font-medium">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top produtos + tipo pedido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-display">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="space-y-2.5 sm:space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4 sm:w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{p.sold} un.</p>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground shrink-0">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-display">Tipo de Pedido</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="space-y-3 sm:space-y-4">
              {ordersByType.map((t) => (
                <div key={t.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm text-foreground">{t.type}</span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">{t.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${t.percentage}%`,
                        backgroundColor: t.type === "Retirada" ? "hsl(340, 70%, 55%)" : "hsl(25, 80%, 55%)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{t.value} pedidos</p>
                </div>
              ))}

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Eventos ativos</span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">{m.activeEvents}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Produtos esgotados</span>
                  <span className="text-xs sm:text-sm font-bold text-destructive">{m.soldOutProducts}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
