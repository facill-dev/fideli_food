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
import { Search, Users, Trash2 } from "lucide-react";
import {
  getAllUsers, getAllStores, deleteUser, isSuperAdmin,
  type TenantUser,
} from "@/lib/multiTenantStorage";
import { toast } from "sonner";

export default function SAUsers() {
  const [userList, setUserList] = useState(getAllUsers);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TenantUser | null>(null);

  const stores = getAllStores();
  const storeByOwner = new Map(stores.map((s) => [s.ownerId, s]));

  const refresh = () => setUserList(getAllUsers());

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id);
    toast.success("Usuário removido.");
    refresh();
    setDeleteTarget(null);
  };

  const filtered = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const withStore = userList.filter((u) => u.storeId).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Usuários</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{userList.length} usuários cadastrados</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-bold font-display text-foreground">{userList.length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-bold font-display text-primary">{withStore}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Com loja</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-xl font-bold font-display text-foreground">{userList.length - withStore}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Sem loja</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {filtered.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((u) => {
            const store = storeByOwner.get(u.id);
            const isAdmin = isSuperAdmin(u);
            return (
              <Card key={u.id} className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">{u.name}</span>
                        {isAdmin && <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">Admin</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {store ? `Loja: ${store.name}` : "Sem loja"}
                      </p>
                    </div>
                    {!isAdmin && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => setDeleteTarget(u)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
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
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => {
                  const store = storeByOwner.get(u.id);
                  const isAdmin = isSuperAdmin(u);
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell className="text-sm">{store?.name || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Admin</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Lojista</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isAdmin && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(u)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
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
            <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email}) e todos os seus dados serão removidos permanentemente.
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
