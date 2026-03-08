import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Tag, Edit, Trash2, Search, BarChart3, ToggleLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCoupons, addCoupon, updateCoupon, toggleCouponActive, deleteCoupon,
  type Coupon,
} from "@/data/couponsData";
import CouponReports from "@/components/admin/CouponReports";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

interface CouponForm {
  code: string;
  label: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: string; // "" for unlimited
  expiresAt: string; // "" for no expiry
  active: boolean;
}

const emptyForm: CouponForm = {
  code: "",
  label: "",
  type: "percent",
  value: 0,
  minOrder: 0,
  maxUses: "",
  expiresAt: "",
  active: true,
};

export default function Coupons() {
  const [couponList, setCouponList] = useState(getCoupons);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const refresh = () => setCouponList(getCoupons());

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      label: c.label,
      type: c.type,
      value: c.value,
      minOrder: c.minOrder,
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      expiresAt: c.expiresAt || "",
      active: c.active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || form.value <= 0) {
      toast.error("Código e valor são obrigatórios.");
      return;
    }
    const data = {
      code: form.code.toUpperCase().trim(),
      label: form.label.trim() || form.code.toUpperCase().trim(),
      type: form.type,
      value: form.value,
      minOrder: form.minOrder,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      active: form.active,
    };

    if (editingId) {
      updateCoupon(editingId, data);
      toast.success("Cupom atualizado!");
    } else {
      addCoupon(data);
      toast.success("Cupom criado!");
    }
    refresh();
    setDialogOpen(false);
  };

  const handleToggle = (id: string) => {
    toggleCouponActive(id);
    refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCoupon(deleteTarget.id);
    toast.success("Cupom removido.");
    refresh();
    setDeleteTarget(null);
  };

  const filtered = couponList.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.label.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = couponList.filter((c) => c.active).length;
  const totalUses = couponList.reduce((s, c) => s + c.usageCount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Cupons</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
            Gerencie cupons de desconto
          </p>
        </div>
        <Button size="sm" className="shrink-0" onClick={openNew}>
          <Plus className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Novo Cupom</span>
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="list" className="gap-1.5 text-xs sm:text-sm">
            <Tag className="h-3.5 w-3.5" /> Cupons
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-lg sm:text-xl font-bold font-display text-foreground">{couponList.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-lg sm:text-xl font-bold font-display text-primary">{activeCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Ativos</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-lg sm:text-xl font-bold font-display text-foreground">{totalUses}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Usos totais</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cupom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 sm:hidden">
            {filtered.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="text-center py-8">
                  <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum cupom encontrado.</p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((c) => (
                <Card key={c.id} className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-foreground">{c.code}</span>
                          <Badge variant={c.active ? "default" : "secondary"} className="text-[9px]">
                            {c.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
                          <span>{c.type === "percent" ? `${c.value}%` : formatCurrency(c.value)}</span>
                          <span>{c.usageCount}{c.maxUses ? `/${c.maxUses}` : ""} usos</span>
                          {c.minOrder > 0 && <span>Min: {formatCurrency(c.minOrder)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Switch checked={c.active} onCheckedChange={() => handleToggle(c.id)} />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(c)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(c)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Desktop table */}
          <Card className="border-border/50 hidden sm:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Ped. mínimo</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum cupom encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div>
                            <span className="font-mono font-bold text-foreground">{c.code}</span>
                            <p className="text-xs text-muted-foreground">{c.label}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {c.type === "percent" ? "Percentual" : "Fixo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {c.type === "percent" ? `${c.value}%` : formatCurrency(c.value)}
                        </TableCell>
                        <TableCell>{c.minOrder > 0 ? formatCurrency(c.minOrder) : "—"}</TableCell>
                        <TableCell>
                          {c.usageCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                        </TableCell>
                        <TableCell>
                          {c.expiresAt
                            ? new Date(c.expiresAt).toLocaleDateString("pt-BR")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Switch checked={c.active} onCheckedChange={() => handleToggle(c.id)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(c)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(c)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <CouponReports />
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? "Editar cupom" : "Novo cupom"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="CUPOM10"
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v: "percent" | "fixed") => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="10% de desconto em tudo"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Valor *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.value || ""}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  placeholder={form.type === "percent" ? "10" : "5.00"}
                />
              </div>
              <div className="space-y-2">
                <Label>Pedido mínimo</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.minOrder || ""}
                  onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Limite de usos</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  placeholder="Ilimitado"
                />
              </div>
              <div className="space-y-2">
                <Label>Expira em</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label className="text-sm">{form.active ? "Ativo" : "Inativo"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cupom?</AlertDialogTitle>
            <AlertDialogDescription>
              O cupom <strong className="font-mono">{deleteTarget?.code}</strong> será removido permanentemente.
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
