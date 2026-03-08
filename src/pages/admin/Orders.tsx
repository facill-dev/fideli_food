import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, ChevronRight, ClipboardList, MessageCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByStore, updateOrderStatus, addNotification, type TenantOrder } from "@/lib/multiTenantStorage";

const STATUS_MAP: Record<TenantOrder["status"], { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmado", className: "bg-blue-100 text-blue-800 border-blue-200" },
  preparing: { label: "Em preparação", className: "bg-purple-100 text-purple-800 border-purple-200" },
  ready: { label: "Pronto", className: "bg-green-100 text-green-800 border-green-200" },
  delivered: { label: "Entregue", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800 border-red-200" },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function Orders() {
  const { store } = useAuth();
  const storeId = store?.id || "";
  const [orderList, setOrderList] = useState<TenantOrder[]>(() => getOrdersByStore(storeId));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<TenantOrder | null>(null);

  const refresh = () => setOrderList(getOrdersByStore(storeId));

  const filtered = orderList.filter((o) => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerPhone.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (orderId: string, status: TenantOrder["status"]) => {
    const order = orderList.find((o) => o.id === orderId);
    updateOrderStatus(orderId, status);
    if (order) {
      const STATUS_LABELS: Record<string, string> = {
        confirmed: "Confirmado",
        preparing: "Em preparação",
        ready: "Pronto",
        delivered: "Entregue",
        cancelled: "Cancelado",
      };
      addNotification({
        storeId,
        type: "status_change",
        title: `Pedido atualizado`,
        message: `Pedido de ${order.customerName} → ${STATUS_LABELS[status] || status}`,
        read: false,
        orderId,
      });
    }
    refresh();
    setSelectedOrder(null);
  };

  const generateWhatsAppLink = (phone: string, order: TenantOrder) => {
    const clean = phone.replace(/\D/g, "");
    const summary = `Olá ${order.customerName}! Sobre seu pedido #${order.id.slice(-6).toUpperCase()}:\n\n${order.items.map((i) => `• ${i.qty}x ${i.name}`).join("\n")}\n\nTotal: ${formatCurrency(order.total)}`;
    return `https://wa.me/55${clean}?text=${encodeURIComponent(summary)}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Pedidos</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Gerencie os pedidos da sua loja</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{orderList.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Pendentes</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-primary">{orderList.filter((o) => o.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Em preparação</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{orderList.filter((o) => o.status === "preparing").length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Faturamento</p>
            <p className="text-lg sm:text-2xl font-bold font-display text-foreground">{formatCurrency(orderList.reduce((s, o) => s + o.total, 0))}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders list */}
      <Card className="border-border/50">
        {orderList.length === 0 ? (
          <CardContent className="text-center py-12">
            <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum pedido recebido ainda.</p>
            <p className="text-xs text-muted-foreground mt-1">Os pedidos aparecerão aqui quando clientes comprarem pelo seu cardápio.</p>
          </CardContent>
        ) : (
          <>
            {/* Mobile */}
            <CardContent className="px-3 pb-3 pt-3 sm:hidden">
              <div className="space-y-2">
                {filtered.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 rounded-lg border border-border/50 bg-card cursor-pointer active:bg-muted/50"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{order.customerName}</span>
                      <Badge variant="outline" className={STATUS_MAP[order.status].className}>
                        {STATUS_MAP[order.status].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                      </span>
                      <span className="text-sm font-bold text-foreground">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Desktop */}
            <CardContent className="p-0 hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_MAP[order.status].className}>
                          {STATUS_MAP[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </>
        )}
      </Card>

      {/* Order detail */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  Pedido
                  <Badge variant="outline" className={STATUS_MAP[selectedOrder.status].className}>
                    {STATUS_MAP[selectedOrder.status].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-medium text-foreground">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="font-medium text-foreground">{selectedOrder.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Itens</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-foreground">{item.qty}x {item.name}</span>
                        <span className="font-medium text-foreground">{formatCurrency(item.qty * item.price)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  {selectedOrder.status !== "confirmed" && (
                    <Button size="sm" className="flex-1" onClick={() => handleStatusChange(selectedOrder.id, "confirmed")}>Confirmar</Button>
                  )}
                  {selectedOrder.status !== "preparing" && (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStatusChange(selectedOrder.id, "preparing")}>Em preparação</Button>
                  )}
                  {selectedOrder.status !== "ready" && (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStatusChange(selectedOrder.id, "ready")}>Pronto</Button>
                  )}
                  {selectedOrder.status !== "delivered" && (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStatusChange(selectedOrder.id, "delivered")}>Entregue</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
