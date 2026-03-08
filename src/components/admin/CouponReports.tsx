import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getCouponAnalytics, getAggregatedDailyUsage } from "@/data/couponsData";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, DollarSign, Percent, Tag, ArrowUpRight } from "lucide-react";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatShortDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

const COLORS = [
  "hsl(340, 70%, 55%)",
  "hsl(25, 80%, 55%)",
  "hsl(145, 60%, 40%)",
  "hsl(350, 80%, 25%)",
  "hsl(35, 60%, 55%)",
];

export default function CouponReports() {
  const [days, setDays] = useState(14);
  const analytics = useMemo(() => getCouponAnalytics(days), [days]);
  const dailyAgg = useMemo(() => getAggregatedDailyUsage(days), [days]);

  const totalUses = analytics.reduce((s, a) => s + a.totalUses, 0);
  const totalRevenue = analytics.reduce((s, a) => s + a.totalRevenue, 0);
  const totalDiscount = analytics.reduce((s, a) => s + a.totalDiscount, 0);
  const avgConversion = analytics.length > 0
    ? Math.round((analytics.reduce((s, a) => s + a.conversionRate, 0) / analytics.length) * 10) / 10
    : 0;
  const roi = totalDiscount > 0 ? Math.round(((totalRevenue - totalDiscount) / totalDiscount) * 10) / 10 : 0;

  const pieData = analytics.map((a) => ({ name: a.code, value: a.totalUses }));

  const chartDaily = dailyAgg.map((d) => ({
    ...d,
    date: formatShortDate(d.date),
    revenue: Math.round(d.revenue),
    discount: Math.round(d.discount),
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Usos (14 dias)</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{totalUses}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Receita gerada</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Percent className="h-3.5 w-3.5 text-caramel" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Conversão média</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-display text-caramel">{avgConversion}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">ROI</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{roi}x</p>
            <p className="text-[10px] text-muted-foreground">Desc: {formatCurrency(totalDiscount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Usage over time */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm font-display font-semibold text-foreground">Usos diários</CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(340, 20%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(340, 10%, 45%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(340, 10%, 45%)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(340,20%,90%)" }}
                  formatter={(value: number, name: string) => [
                    name === "uses" ? value : formatCurrency(value),
                    name === "uses" ? "Usos" : name === "revenue" ? "Receita" : "Desconto",
                  ]}
                />
                <Bar dataKey="uses" fill="hsl(340, 70%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution pie */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm font-display font-semibold text-foreground">Distribuição de usos</CardTitle>
          </CardHeader>
          <CardContent className="px-1 pb-3 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Discount area chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-sm font-display font-semibold text-foreground">Receita vs Desconto (14 dias)</CardTitle>
        </CardHeader>
        <CardContent className="px-1 sm:px-4 pb-3">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(340, 20%, 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(340, 10%, 45%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(340, 10%, 45%)" tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(340,20%,90%)" }}
                formatter={(value: number, name: string) => [formatCurrency(value), name === "revenue" ? "Receita" : "Desconto"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(145, 60%, 40%)" fill="hsl(145, 60%, 40%)" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="discount" stroke="hsl(340, 70%, 55%)" fill="hsl(340, 70%, 55%)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-coupon performance table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-sm font-display font-semibold text-foreground">Performance por cupom</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-2">
            {analytics.sort((a, b) => b.totalRevenue - a.totalRevenue).map((stat, i) => (
              <div key={stat.couponId} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-foreground">{stat.code}</span>
                    <Badge variant="outline" className="text-[9px]">{stat.conversionRate}% conv.</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                    <span>{stat.totalUses} usos</span>
                    <span>Ticket: {formatCurrency(stat.avgOrderValue)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(stat.totalRevenue)}</p>
                  <p className="text-[10px] text-primary flex items-center gap-0.5 justify-end">
                    <ArrowUpRight className="h-3 w-3" />
                    -{formatCurrency(stat.totalDiscount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
