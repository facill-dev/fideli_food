import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Tag, Search, Percent, DollarSign } from "lucide-react";
import { getCoupons, addCoupon, updateCoupon, toggleCouponActive, deleteCoupon, type Coupon } from "@/data/couponsData";
import CouponReports from "@/components/admin/CouponReports";
import { toast } from "sonner";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

interface CouponForm {
  code: string;
  type: "percent" | "fixed";
  value: string;
  minOrder: string;
  label: string;
  maxUses: string;
  expiresAt: string;
  active: boolean;
}

const emptyForm: CouponForm = {
  code: "", type: "percent", value: "", minOrder: "0", label: "", maxUses: "", expiresAt: "", active: true,
};

export default function Coupons() {
  const [coupons, setCoupons] = useState(getCoupons());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refresh = () => setCoupons(getCoupons());

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) || c.label.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = coupons.filter((c) => c.active).length;
  const totalUses = coupons.reduce((s, c) => s + c.usageCount, 0);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrder: coupon.minOrder.toString(),
      label: coupon.label,
      maxUses: coupon.maxUses?.toString() ?? "",
      expiresAt: coupon.expiresAt ?? "",
      active: coupon.active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const code = form.code.trim().toUpperCase();
    if (!code || code.length < 3) { toast.error("Código deve ter ao menos 3 caracteres"); return; }
    if (!form.value || parseFloat(form.value) <= 0) { toast.error("Informe um valor válido"); return; }
    if (!form.label.trim()) { toast.error("Informe uma descrição"); return; }

    const existing = coupons.find((c) => c.code === code && c.id !== editingId);
    if (existing) { toast.error("Já existe um cupom com esse código"); return; }

    const data = {
      code,
      type: form.type,
      value: parseFloat(form.value),
      minOrder: parseFloat(form.minOrder) || 0,
      label: form.label.trim(),
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      active: form.active,
    };

    if (editingId) {
      updateCoupon(editingId, data);
      toast.success("Cupom atualizado");
    } else {
      addCoupon(data);
      toast.success("Cupom criado");
    }
    refresh();
    setDialogOpen(false);
  };

  const handleToggle = (id: string) => {
    toggleCouponActive(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteCoupon(id);
    refresh();
    setDeleteConfirm(null);
    toast.success("Cupom removido");
  };

  const updateField = (field: keyof CouponForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Cupons</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Gerencie cupons de desconto</p>
        </div>
        <Button size="sm" className="shrink-0" onClick={openCreate}>
          <Plus className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Novo Cupom</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{coupons.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Ativos</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-primary">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Usos totais</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{totalUses}</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cupom..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>

        {/* Mobile card view */}
        <CardContent className="px-3 pb-3 sm:hidden">
          <div className="space-y-2">
            {filtered.map((coupon) => (
              <div key={coupon.id} className="p-3 rounded-lg border border-border/50 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold font-mono text-foreground">{coupon.code}</span>
                  </div>
                  <Switch checked={coupon.active} onCheckedChange={() => handleToggle(coupon.id)} className="scale-75" />
                </div>
                <p className="text-xs text-muted-foreground">{coupon.label}</p>
                <div className="flex items-center gap-3 text-xs">
                  <Badge variant={coupon.type === "percent" ? "default" : "secondary"} className="text-[10px]">
                    {coupon.type === "percent" ? `${coupon.value}%` : formatCurrency(coupon.value)}
                  </Badge>
                  <span className="text-muted-foreground">Min: {formatCurrency(coupon.minOrder)}</span>
                  <span className="text-muted-foreground">{coupon.usageCount} usos</span>
                </div>
                <div className="flex gap-1 pt-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(coupon)}>
                    <Edit className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => setDeleteConfirm(coupon.id)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Excluir
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum cupom encontrado</p>
            )}
          </div>
        </CardContent>

        {/* Desktop table */}
        <CardContent className="p-0 hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="hidden md:table-cell">Mín. pedido</TableHead>
                <TableHead className="hidden lg:table-cell">Usos</TableHead>
                <TableHead className="hidden lg:table-cell">Validade</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-bold font-mono text-foreground">{coupon.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{coupon.label}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.type === "percent" ? "default" : "secondary"} className="text-[10px]">
                      {coupon.type === "percent" ? "Percentual" : "Fixo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-foreground">
                      {coupon.type === "percent" ? `${coupon.value}%` : formatCurrency(coupon.value)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{formatCurrency(coupon.minOrder)}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {coupon.usageCount}{coupon.maxUses ? `/${coupon.maxUses}` : ""}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("pt-BR") : "Sem limite"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch checked={coupon.active} onCheckedChange={() => handleToggle(coupon.id)} className="scale-75" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(coupon)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(coupon.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum cupom encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? "Editar cupom" : "Novo cupom"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Código *</Label>
              <Input value={form.code} onChange={(e) => updateField("code", e.target.value.toUpperCase())} placeholder="DOCE10" className="mt-1 uppercase font-mono" maxLength={20} />
            </div>
            <div>
              <Label className="text-xs">Descrição *</Label>
              <Input value={form.label} onChange={(e) => updateField("label", e.target.value)} placeholder="10% de desconto" className="mt-1" maxLength={60} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">
                      <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> Percentual</span>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Valor fixo</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Valor *</Label>
                <Input type="number" value={form.value} onChange={(e) => updateField("value", e.target.value)} placeholder={form.type === "percent" ? "10" : "5.00"} className="mt-1" min="0" step="0.01" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Pedido mínimo (R$)</Label>
                <Input type="number" value={form.minOrder} onChange={(e) => updateField("minOrder", e.target.value)} placeholder="0" className="mt-1" min="0" step="0.01" />
              </div>
              <div>
                <Label className="text-xs">Limite de usos</Label>
                <Input type="number" value={form.maxUses} onChange={(e) => updateField("maxUses", e.target.value)} placeholder="Ilimitado" className="mt-1" min="1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Data de expiração</Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => updateField("expiresAt", e.target.value)} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => updateField("active", v)} />
              <Label className="text-xs">Cupom ativo</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Excluir cupom?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Essa ação não pode ser desfeita.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
