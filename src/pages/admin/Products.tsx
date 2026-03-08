import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  getProductsByStore,
  getCategoriesByStore,
  addProduct,
  updateProduct,
  deleteProduct as removeProduct,
  addCategory,
  type TenantProduct,
  type TenantCategory,
} from "@/lib/multiTenantStorage";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Search, Plus, Edit, Copy, Trash2, Camera, Package, X } from "lucide-react";
import { toast } from "sonner";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

type ProductForm = Omit<TenantProduct, "id" | "storeId">;

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: 0,
  image: "/placeholder.svg",
  category: "",
  available: true,
  availableQty: 10,
  badge: "",
  delivery: true,
  pickup: true,
  rating: 5,
  prepTime: "Pronta entrega",
};

export default function Products() {
  const { store } = useAuth();
  const storeId = store?.id || "";

  const [productList, setProductList] = useState<TenantProduct[]>(() => getProductsByStore(storeId));
  const [categoryList, setCategoryList] = useState<TenantCategory[]>(() => getCategoriesByStore(storeId));

  const refresh = useCallback(() => {
    setProductList(getProductsByStore(storeId));
    setCategoryList(getCategoriesByStore(storeId));
  }, [storeId]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TenantProduct | null>(null);
  const [formData, setFormData] = useState<ProductForm>(emptyForm);
  const [newCatName, setNewCatName] = useState("");
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    if (categoryList.some((c) => c.slug === slug)) {
      toast.error("Categoria já existe");
      return;
    }
    addCategory({ name, image: "/placeholder.svg", slug, storeId });
    updateForm("category", slug);
    setNewCatName("");
    setShowNewCatInput(false);
    refresh();
    toast.success(`Categoria "${name}" criada!`);
  };

  const filtered = productList.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openNew = () => {
    setEditingProduct(null);
    setFormData({ ...emptyForm, category: categoryList[0]?.slug || "" });
    setDialogOpen(true);
  };

  const openEdit = (product: TenantProduct) => {
    setEditingProduct(product);
    const { id, storeId: _, ...rest } = product;
    setFormData(rest);
    setDialogOpen(true);
  };

  const handleDuplicate = (product: TenantProduct) => {
    addProduct({ ...product, name: `${product.name} (cópia)`, storeId });
    refresh();
    toast.success("Produto duplicado!");
  };

  const handleDelete = (id: string) => {
    removeProduct(id);
    refresh();
    toast.success("Produto removido!");
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    if (formData.price <= 0) {
      toast.error("Informe um preço válido");
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      toast.success("Produto atualizado!");
    } else {
      addProduct({ ...formData, storeId });
      toast.success("Produto cadastrado!");
    }
    refresh();
    setDialogOpen(false);
  };

  const updateForm = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Produtos</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Gerencie o cardápio da sua loja</p>
        </div>
        <Button size="sm" className="shrink-0" onClick={openNew}>
          <Plus className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Novo Produto</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total de produtos</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{productList.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Categorias</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-foreground">{categoryList.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Em promoção</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-primary">{productList.filter((p) => p.promoPrice).length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Poucas unidades</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-destructive">{productList.filter((p) => p.availableQty <= 5).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + List */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categoryList.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Empty state */}
        {productList.length === 0 && (
          <CardContent className="text-center py-12">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">Nenhum produto cadastrado ainda.</p>
            <Button size="sm" onClick={openNew}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar primeiro produto
            </Button>
          </CardContent>
        )}

        {/* Mobile card view */}
        {productList.length > 0 && (
          <CardContent className="px-3 pb-3 sm:hidden">
            <div className="space-y-2">
              {filtered.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card">
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs capitalize text-muted-foreground">{product.category}</span>
                      {product.badge && <Badge variant="outline" className="text-[9px] px-1 py-0">{product.badge}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {product.promoPrice ? (
                        <>
                          <span className="text-xs line-through text-muted-foreground">{formatCurrency(product.price)}</span>
                          <span className="text-sm font-bold text-primary">{formatCurrency(product.promoPrice)}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-foreground">{formatCurrency(product.price)}</span>
                      )}
                      <span className={`text-xs ${product.availableQty <= 5 ? "text-destructive" : "text-muted-foreground"}`}>
                        {product.availableQty} un.
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => openEdit(product)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        {/* Desktop table view */}
        {productList.length > 0 && (
          <CardContent className="p-0 hidden sm:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="hidden md:table-cell">Estoque</TableHead>
                    <TableHead className="hidden lg:table-cell">Entrega</TableHead>
                    <TableHead className="hidden lg:table-cell">Retirada</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            {product.badge && <Badge variant="outline" className="text-[10px] mt-0.5">{product.badge}</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm capitalize text-muted-foreground">{product.category}</span></TableCell>
                      <TableCell>
                        {product.promoPrice ? (
                          <div>
                            <span className="text-sm line-through text-muted-foreground">{formatCurrency(product.price)}</span>
                            <span className="text-sm font-bold text-primary ml-1">{formatCurrency(product.promoPrice)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-foreground">{formatCurrency(product.price)}</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={`text-sm font-medium ${product.availableQty <= 5 ? "text-destructive" : "text-foreground"}`}>
                          {product.availableQty} un.
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Switch checked={product.delivery} disabled className="scale-75" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Switch checked={product.pickup} disabled className="scale-75" />
                      </TableCell>
                      <TableCell>
                        <Switch checked={product.available} disabled className="scale-75" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(product)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Nome *</Label>
              <Input value={formData.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Ex: Bolo de Chocolate" className="mt-1" />
            </div>

            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea value={formData.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Descreva o produto..." className="mt-1 min-h-[60px]" maxLength={300} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Preço (R$) *</Label>
                <Input type="number" min={0} step={0.01} value={formData.price || ""} onChange={(e) => updateForm("price", parseFloat(e.target.value) || 0)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Preço promocional (R$)</Label>
                <Input type="number" min={0} step={0.01} value={formData.promoPrice ?? ""} onChange={(e) => { const v = parseFloat(e.target.value); updateForm("promoPrice", isNaN(v) ? undefined : v); }} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Categoria *</Label>
                {showNewCatInput ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Nome da categoria"
                      onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                      autoFocus
                    />
                    <Button size="sm" onClick={handleAddCategory} className="shrink-0">Criar</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowNewCatInput(false); setNewCatName(""); }} className="shrink-0"><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <Select value={formData.category} onValueChange={(v) => {
                    if (v === "__new__") {
                      setShowNewCatInput(true);
                    } else {
                      updateForm("category", v);
                    }
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryList.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                      ))}
                      <SelectItem value="__new__" className="text-primary font-medium">
                        + Nova categoria
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label className="text-xs">Estoque</Label>
                <Input type="number" min={0} value={formData.availableQty} onChange={(e) => updateForm("availableQty", parseInt(e.target.value) || 0)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Badge (opcional)</Label>
                <Input value={formData.badge || ""} onChange={(e) => updateForm("badge", e.target.value)} placeholder="Ex: Mais Vendido" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Tempo de preparo</Label>
                <Select value={formData.prepTime || "Pronta entrega"} onValueChange={(v) => updateForm("prepTime", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pronta entrega">Pronta entrega</SelectItem>
                    <SelectItem value="Sob encomenda">Sob encomenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Imagem do produto</Label>
              <div className="mt-1 flex items-center gap-3">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-14 h-14 rounded-lg object-cover border border-border/50 shrink-0 bg-muted"
                />
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 text-sm font-medium text-foreground hover:bg-muted hover:border-muted-foreground/50 transition-all">
                    <Camera className="h-4 w-4" /> Escolher imagem
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("Imagem muito grande. Máximo 2MB.");
                          return;
                        }
                        // Compress to max 400x400 thumbnail
                        const img = new Image();
                        const url = URL.createObjectURL(file);
                        img.onload = () => {
                          const MAX = 400;
                          let w = img.width, h = img.height;
                          if (w > MAX || h > MAX) {
                            const ratio = Math.min(MAX / w, MAX / h);
                            w = Math.round(w * ratio);
                            h = Math.round(h * ratio);
                          }
                          const canvas = document.createElement("canvas");
                          canvas.width = w;
                          canvas.height = h;
                          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
                          const dataUrl = canvas.toDataURL("image/webp", 0.75);
                          URL.revokeObjectURL(url);
                          updateForm("image", dataUrl);
                        };
                        img.src = url;
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG ou WebP · Máx 2MB · Reduzida para 400×400</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={formData.available} onCheckedChange={(v) => updateForm("available", v)} />
                <Label className="text-xs">Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.delivery} onCheckedChange={(v) => updateForm("delivery", v)} />
                <Label className="text-xs">Entrega</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.pickup} onCheckedChange={(v) => updateForm("pickup", v)} />
                <Label className="text-xs">Retirada</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>
              {editingProduct ? "Salvar alterações" : "Cadastrar produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
