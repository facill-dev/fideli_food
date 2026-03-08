import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, ShoppingBag } from "lucide-react";
import {
  getAllOrders, getAllStores, type TenantOrder, type StoreConfig,
} from "@/lib/multiTenantStorage";

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

export default function SAOrders() {
  const orders = getAllOrders();
  const stores = getAllStores();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");

  const storeMap = new Map<string, StoreConfig>();
  stores.forEach((s) => storeMap.set(s.id, s));

  const filtered = orders
    .filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (storeFilter !== "all" && o.storeId !== storeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          storeMap.get(o.storeId)?.name.toLowerCase().includes(q) ||
          false
        );
      }
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Pedidos Globais</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{orders.length} pedidos no sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-bold font-display text-foreground">{filtered.length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Filtrados</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-bold font-display text-primary">{formatCurrency(totalRevenue)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Receita filtrada</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-bold font-display text-foreground">{stores.length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Lojas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente, telefone, loja..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Loja" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as lojas</SelectItem>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {filtered.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="text-center py-8">
              <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.slice(0, 50).map((o) => {
            const store = storeMap.get(o.storeId);
            const st = STATUS_MAP[o.status];
            return (
              <Card key={o.id} className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{store?.name || "—"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[9px] ${st.className}`}>{st.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {o.items.length} {o.items.length === 1 ? "item" : "itens"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(o.total)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <Card className="border-border/50 hidden sm:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(0, 100).map((o) => {
                  const store = storeMap.get(o.storeId);
                  const st = STATUS_MAP[o.status];
                  return (
                    <TableRow key={o.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{o.customerName}</p>
                          <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{store?.name || "—"}</TableCell>
                      <TableCell className="text-sm">{o.items.length}</TableCell>
                      <TableCell className="text-sm font-bold">{formatCurrency(o.total)}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${st.className}`}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
