import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProductsByStore,
  getOrdersByStore,
  getCategoriesByStore,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function KpiCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{title}</p>
            <p className={`text-lg sm:text-xl md:text-2xl font-bold font-display ${accent ? "text-primary" : "text-foreground"} truncate`}>{value}</p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0 ml-2">
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { store } = useAuth();
  const navigate = useNavigate();
  const storeId = store?.id || "";
  const products = getProductsByStore(storeId);
  const orders = getOrdersByStore(storeId);
  const categories = getCategoriesByStore(storeId);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;

  const isEmpty = products.length === 0 && orders.length === 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Visão geral da {store?.name}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <KpiCard title="Produtos" value={String(products.length)} icon={Package} />
        <KpiCard title="Categorias" value={String(categories.length)} icon={ShoppingBag} />
        <KpiCard title="Pedidos" value={String(orders.length)} icon={TrendingUp} />
        <KpiCard title="Faturamento" value={formatCurrency(totalRevenue)} icon={DollarSign} accent />
      </div>

      {/* Getting started / Quick actions */}
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
                  <p className="text-xs text-muted-foreground">Ticket médio</p>
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
      )}
    </div>
  );
}
