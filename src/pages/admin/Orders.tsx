import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orders as initialOrders, type Order } from "@/data/adminMockData";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, ChevronRight, LayoutList, Columns3, Clock, Truck, MapPin, GripVertical } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useDroppable,
  useDraggable,
  closestCenter,
} from "@dnd-kit/core";

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

const KANBAN_COLUMNS: { status: Order["status"]; label: string; color: string; headerBg: string }[] = [
  { status: "aguardando_pagamento", label: "Aguardando Pgto", color: "border-t-amber-400", headerBg: "bg-amber-50 text-amber-800" },
  { status: "confirmado", label: "Confirmado", color: "border-t-blue-400", headerBg: "bg-blue-50 text-blue-800" },
  { status: "em_preparacao", label: "Em Preparacao", color: "border-t-purple-400", headerBg: "bg-purple-50 text-purple-800" },
  { status: "pronto", label: "Pronto", color: "border-t-green-400", headerBg: "bg-green-50 text-green-800" },
  { status: "retirado", label: "Retirado/Entregue", color: "border-t-teal-400", headerBg: "bg-teal-50 text-teal-800" },
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// Draggable Kanban Card
function DraggableKanbanCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
  });

  const style: React.CSSProperties = {
    ...(transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : {}),
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? "relative" as const : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-card rounded-lg border border-border/50 touch-none select-none ${
        isDragging ? "opacity-40 scale-95 shadow-xl cursor-grabbing" : "cursor-grab hover:shadow-md hover:border-border"
      }`}
      onPointerUp={(e) => {
        // Only open detail if it wasn't a drag
        if (!isDragging) {
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="font-mono text-xs font-bold text-foreground">{order.number}</span>
        </div>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PAYMENT_MAP[order.paymentStatus].className}`}>
          {PAYMENT_MAP[order.paymentStatus].label}
        </Badge>
      </div>
      <p className="text-sm font-medium text-foreground truncate">{order.customerName}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{order.customerPhone}</p>

      <div className="mt-2 space-y-1">
        {order.items.map((item, i) => (
          <p key={i} className="text-xs text-muted-foreground truncate">
            {item.quantity}x {item.productName}
          </p>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">{formatCurrency(order.total)}</span>
        {order.type === "retirada" ? (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3" /> Retirada
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Truck className="h-3 w-3" /> Entrega
          </span>
        )}
      </div>

      {(order.pickupTime || order.eventName) && (
        <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2 flex-wrap">
          {order.pickupTime && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {order.pickupTime}
            </span>
          )}
          {order.eventName && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {order.eventName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


// Static card for DragOverlay
function KanbanCardOverlay({ order }: { order: Order }) {
  return (
    <div className="p-3 bg-card rounded-lg border-2 border-primary shadow-xl w-[220px] rotate-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-bold text-foreground">{order.number}</span>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PAYMENT_MAP[order.paymentStatus].className}`}>
          {PAYMENT_MAP[order.paymentStatus].label}
        </Badge>
      </div>
      <p className="text-sm font-medium text-foreground truncate">{order.customerName}</p>
      <span className="text-sm font-bold text-foreground">{formatCurrency(order.total)}</span>
    </div>
  );
}

// Droppable column
function DroppableColumn({
  col,
  columnOrders,
  onCardClick,
  isOver,
}: {
  col: (typeof KANBAN_COLUMNS)[0];
  columnOrders: Order[];
  onCardClick: (o: Order) => void;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: col.status });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[220px] rounded-xl border-t-[3px] transition-colors ${col.color} ${
        isOver ? "bg-primary/5 ring-2 ring-primary/20" : "bg-muted/30"
      }`}
    >
      <div className={`px-3 py-2.5 rounded-t-lg ${col.headerBg}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide">{col.label}</span>
          <span className="text-xs font-bold bg-background/50 rounded-full w-5 h-5 flex items-center justify-center">
            {columnOrders.length}
          </span>
        </div>
      </div>
      <div className="p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto min-h-[80px]">
        {columnOrders.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            {isOver ? "Solte aqui" : "Nenhum pedido"}
          </p>
        )}
        {columnOrders.map((order) => (
          <DraggableKanbanCard key={order.id} order={order} onClick={() => onCardClick(order)} />
        ))}
      </div>
    </div>
  );
}

function OrderDetailDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  if (!order) return null;
  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            Pedido {order.number}
            <Badge variant="outline" className={STATUS_MAP[order.status].className}>
              {STATUS_MAP[order.status].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground">Cliente</p>
              <p className="font-medium text-foreground">{order.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Telefone</p>
              <p className="font-medium text-foreground">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tipo</p>
              <p className="font-medium capitalize text-foreground">{order.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pagamento</p>
              <Badge variant="outline" className={PAYMENT_MAP[order.paymentStatus].className}>
                {PAYMENT_MAP[order.paymentStatus].label}
              </Badge>
            </div>
          </div>
          {order.eventName && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">Evento</p>
              <p className="font-medium text-primary">{order.eventName}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground mb-2">Itens</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-foreground">{item.quantity}x {item.productName}</span>
                  <span className="font-medium text-foreground">{formatCurrency(item.quantity * item.unitPrice)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
          {order.type === "retirada" && order.pickupDate && (
            <div>
              <p className="text-muted-foreground">Retirada</p>
              <p className="font-medium text-foreground">
                {new Date(order.pickupDate).toLocaleDateString("pt-BR")} as {order.pickupTime}
              </p>
            </div>
          )}
          {order.type === "entrega" && order.deliveryAddress && (
            <div>
              <p className="text-muted-foreground">Endereco de entrega</p>
              <p className="font-medium text-foreground">{order.deliveryAddress}</p>
            </div>
          )}
          {order.notes && (
            <div>
              <p className="text-muted-foreground">Observacoes</p>
              <p className="text-foreground">{order.notes}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button size="sm" className="flex-1">Confirmar</Button>
            <Button size="sm" variant="outline" className="flex-1">Em preparacao</Button>
            <Button size="sm" variant="outline" className="flex-1">Pronto</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [orderList, setOrderList] = useState<Order[]>(initialOrders);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const filtered = orderList.filter((o) => {
    const matchSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.number.includes(search) ||
      o.customerPhone.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchType = typeFilter === "all" || o.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const activeOrder = activeId ? orderList.find((o) => o.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const targetStatus = String(over.id) as Order["status"];
    const validStatuses = KANBAN_COLUMNS.map((c) => c.status);
    if (!validStatuses.includes(targetStatus)) return;

    setOrderList((prev) =>
      prev.map((o) => {
        if (o.id !== String(active.id)) return o;
        // Map "retirado" column to correct status based on order type
        const newStatus = targetStatus === "retirado"
          ? (o.type === "entrega" ? "entregue" as const : "retirado" as const)
          : targetStatus;
        return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
      })
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie todos os pedidos da confeitaria</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button variant={view === "list" ? "default" : "ghost"} size="sm" className="h-8 px-3" onClick={() => setView("list")}>
            <LayoutList className="h-4 w-4 mr-1" /> Lista
          </Button>
          <Button variant={view === "kanban" ? "default" : "ghost"} size="sm" className="h-8 px-3" onClick={() => setView("kanban")}>
            <Columns3 className="h-4 w-4 mr-1" /> Kanban
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, numero ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {view === "list" && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_MAP).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="retirada">Retirada</SelectItem>
              <SelectItem value="entrega">Entrega</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban View with DnD */}
      {view === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-4 -mx-4 md:-mx-6 px-4 md:px-6">
            <div className="flex gap-3 min-w-[900px]">
              {KANBAN_COLUMNS.map((col) => {
                const columnOrders = filtered.filter((o) =>
                  col.status === "retirado"
                    ? o.status === "retirado" || o.status === "entregue"
                    : o.status === col.status
                );
                return (
                  <DroppableColumn
                    key={col.status}
                    col={col}
                    columnOrders={columnOrders}
                    onCardClick={setSelectedOrder}
                    isOver={overId === col.status}
                  />
                );
              })}
            </div>
          </div>
          <DragOverlay>
            {activeOrder ? <KanbanCardOverlay order={activeOrder} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
      {view === "list" && (
        <Card className="border-border/50">
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
                      <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
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
                        <TableCell><Badge variant="outline" className={st.className}>{st.label}</Badge></TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="outline" className={pt.className}>{pt.label}</Badge></TableCell>
                        <TableCell className="hidden lg:table-cell"><span className="text-sm capitalize text-muted-foreground">{order.type}</span></TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                        <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
