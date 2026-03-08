import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, ExternalLink, Trash2, Store } from "lucide-react";
import { NicheIcon } from "@/components/NicheIcon";
import {
  getAllStores, getAllOrders, getAllProducts, getAllUsers, deleteStore, NICHES,
  type StoreConfig,
} from "@/lib/multiTenantStorage";
import { toast } from "sonner";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function SAStores() {
  const [storeList, setStoreList] = useState(getAllStores);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<StoreConfig | null>(null);

  const orders = getAllOrders();
  const products = getAllProducts();
  const users = getAllUsers();

  const refresh = () => setStoreList(getAllStores());

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteStore(deleteTarget.id);
    toast.success("Loja removida.");
    refresh();
    setDeleteTarget(null);
  };

  const filtered = storeList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      s.niche.toLowerCase().includes(search.toLowerCase())
  );

  const getNicheLabel = (id: string) => NICHES.find((n) => n.id === id)?.label || id;
  const getNicheIcon = (id: string) => NICHES.find((n) => n.id === id)?.icon;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Lojas</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{storeList.length} lojas cadastradas</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar loja..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {filtered.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="text-center py-8">
              <Store className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma loja encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((s) => {
            const storeOrders = orders.filter((o) => o.storeId === s.id);
            const storeProducts = products.filter((p) => p.storeId === s.id);
            const owner = users.find((u) => u.storeId === s.id);
            const revenue = storeOrders.reduce((sum, o) => sum + o.total, 0);

            return (
              <Card key={s.id} className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <NicheIcon name={getNicheIcon(s.niche)} className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-bold text-foreground truncate">{s.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{getNicheLabel(s.niche)} · {owner?.name || "—"}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
                        <span>{storeProducts.length} produtos</span>
                        <span>{storeOrders.length} pedidos</span>
                        <span>{formatCurrency(revenue)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                        <a href={`/loja/${s.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(s)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
                <TableHead>Loja</TableHead>
                <TableHead>Nicho</TableHead>
                <TableHead>Dono</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma loja encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => {
                  const storeOrders = orders.filter((o) => o.storeId === s.id);
                  const storeProducts = products.filter((p) => p.storeId === s.id);
                  const owner = users.find((u) => u.storeId === s.id);
                  const revenue = storeOrders.reduce((sum, o) => sum + o.total, 0);

                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <NicheIcon name={getNicheIcon(s.niche)} className="h-4 w-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">{s.name}</p>
                            <p className="text-xs text-muted-foreground">/{s.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{getNicheLabel(s.niche)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{owner?.name || "—"}</TableCell>
                      <TableCell className="text-sm">{storeProducts.length}</TableCell>
                      <TableCell className="text-sm">{storeOrders.length}</TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(revenue)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                            <a href={`/loja/${s.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(s)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover loja?</AlertDialogTitle>
            <AlertDialogDescription>
              A loja <strong>{deleteTarget?.name}</strong> e todos os seus dados (produtos, pedidos, categorias) serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
