import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customers, type Customer } from "@/data/adminMockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Users, TrendingUp, ShoppingBag, DollarSign, ChevronRight } from "lucide-react";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function Customers() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgTicket = Math.round(totalRevenue / customers.reduce((s, c) => s + c.totalOrders, 0));
  const recurrentCustomers = customers.filter((c) => c.totalOrders >= 5).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">Base de clientes e historico de compras</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total clientes</p>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{totalCustomers}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Receita total</p>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Ticket medio</p>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{formatCurrency(avgTicket)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Recorrentes (5+)</p>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{recurrentCustomers}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, telefone ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Total gasto</TableHead>
                  <TableHead className="hidden sm:table-cell">Ticket medio</TableHead>
                  <TableHead className="hidden lg:table-cell">Ultimo pedido</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow key={customer.id} className="cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{customer.phone}</TableCell>
                    <TableCell>
                      <span className="text-sm font-bold text-foreground">{customer.totalOrders}</span>
                    </TableCell>
                    <TableCell className="font-bold text-foreground">{formatCurrency(customer.totalSpent)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatCurrency(customer.averageTicket)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(customer.lastOrderDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-md">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{selectedCustomer.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="font-medium text-foreground">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Primeiro pedido</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedCustomer.firstOrderDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ultimo pedido</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedCustomer.lastOrderDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-lg font-bold font-display text-foreground">{selectedCustomer.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Pedidos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-display text-foreground">{formatCurrency(selectedCustomer.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total gasto</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-display text-foreground">{formatCurrency(selectedCustomer.averageTicket)}</p>
                    <p className="text-xs text-muted-foreground">Ticket medio</p>
                  </div>
                </div>

                {selectedCustomer.addresses.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1">Enderecos</p>
                    {selectedCustomer.addresses.map((addr, i) => (
                      <p key={i} className="text-foreground">{addr}</p>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
