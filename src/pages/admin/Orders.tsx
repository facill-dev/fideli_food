import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orders, type Order } from "@/data/adminMockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, ChevronRight } from "lucide-react";

const STATUS_MAP: Record<Order["status"], { label: string; className: string }> = {
  criado: { label: "Criado", className: "bg-muted text-muted-foreground" },
  aguardando_pagamento: { label: "Aguardando pgto", className: "bg-amber-100 text-amber-800 border-amber-200" },
  pago: { label: "Pago", className: "bg-blue-100 text-blue-800 border-blue-200" },
  confirmado: { label: "Confirmado", className: "bg-blue-100 text-blue-800 border-blue-200" },
  em_preparacao: { label: "Em preparacao", className: "bg-purple-100 text-purple-800 border-purple-200" },
  pronto: { label: "Pronto", className: "bg-green-100 text-green-800 border-green-200" },
  retirado: { label: "Retirado", className: "bg-teal-100 text-teal-800 border-teal-200" },
  entregue: { label: "Entregue", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-800 border-red-200" },
  expirado: { label: "Expirado", className: "bg-muted text-muted-foreground" },
};

const PAYMENT_MAP: Record<Order["paymentStatus"], { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-amber-100 text-amber-800" },
  pago: { label: "Pago", className: "bg-green-100 text-green-800" },
  falhou: { label: "Falhou", className: "bg-red-100 text-red-800" },
  estornado: { label: "Estornado", className: "bg-muted text-muted-foreground" },
  expirado: { label: "Expirado", className: "bg-muted text-muted-foreground" },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.number.includes(search) ||
      o.customerPhone.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchType = typeFilter === "all" || o.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie todos os pedidos da confeitaria</p>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, numero ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(STATUS_MAP).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="retirada">Retirada</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px]">Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Pagamento</TableHead>
                  <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                  <TableHead className="hidden lg:table-cell">Data</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => {
                  const st = STATUS_MAP[order.status];
                  const pt = PAYMENT_MAP[order.paymentStatus];
                  return (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell className="font-mono font-bold text-foreground text-sm">{order.number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={st.className}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={pt.className}>{pt.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm capitalize text-muted-foreground">{order.type}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  Pedido {selectedOrder.number}
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
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-medium capitalize text-foreground">{selectedOrder.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pagamento</p>
                    <Badge variant="outline" className={PAYMENT_MAP[selectedOrder.paymentStatus].className}>
                      {PAYMENT_MAP[selectedOrder.paymentStatus].label}
                    </Badge>
                  </div>
                </div>

                {selectedOrder.eventName && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground">Evento</p>
                    <p className="font-medium text-primary">{selectedOrder.eventName}</p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground mb-2">Itens</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-foreground">
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex justify-between font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.type === "retirada" && selectedOrder.pickupDate && (
                  <div>
                    <p className="text-muted-foreground">Retirada</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedOrder.pickupDate).toLocaleDateString("pt-BR")} as {selectedOrder.pickupTime}
                    </p>
                  </div>
                )}

                {selectedOrder.type === "entrega" && selectedOrder.deliveryAddress && (
                  <div>
                    <p className="text-muted-foreground">Endereco de entrega</p>
                    <p className="font-medium text-foreground">{selectedOrder.deliveryAddress}</p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <p className="text-muted-foreground">Observacoes</p>
                    <p className="text-foreground">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">Confirmar</Button>
                  <Button size="sm" variant="outline" className="flex-1">Em preparacao</Button>
                  <Button size="sm" variant="outline" className="flex-1">Pronto</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
