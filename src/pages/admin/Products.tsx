import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products, categories } from "@/data/mockData";
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
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Copy, Package } from "lucide-react";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie o cardapio da confeitaria</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Novo Produto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de produtos</p>
            <p className="text-2xl font-bold font-display text-foreground">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Categorias</p>
            <p className="text-2xl font-bold font-display text-foreground">{categories.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Em promocao</p>
            <p className="text-2xl font-bold font-display text-primary">{products.filter((p) => p.promoPrice).length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Poucas unidades</p>
            <p className="text-2xl font-bold font-display text-destructive">{products.filter((p) => p.availableQty <= 5).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preco</TableHead>
                  <TableHead className="hidden md:table-cell">Estoque</TableHead>
                  <TableHead className="hidden sm:table-cell">Entrega</TableHead>
                  <TableHead className="hidden sm:table-cell">Retirada</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          {product.badge && (
                            <Badge variant="outline" className="text-[10px] mt-0.5">{product.badge}</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize text-muted-foreground">{product.category}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        {product.promoPrice ? (
                          <>
                            <span className="text-sm line-through text-muted-foreground">{formatCurrency(product.price)}</span>
                            <span className="text-sm font-bold text-primary ml-1">{formatCurrency(product.promoPrice)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-foreground">{formatCurrency(product.price)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`text-sm font-medium ${product.availableQty <= 5 ? "text-destructive" : "text-foreground"}`}>
                        {product.availableQty} un.
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Switch checked={product.delivery} disabled className="scale-75" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Switch checked={product.pickup} disabled className="scale-75" />
                    </TableCell>
                    <TableCell>
                      <Switch checked={product.available} disabled className="scale-75" />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
