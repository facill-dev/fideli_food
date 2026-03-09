import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { getStoreBySlug, getProductsByStore, getCategoriesByStore, NICHES } from "@/lib/multiTenantStorage";
import { getStoreConfig, getWallet, pointsToMoney } from "@/lib/loyaltyStorage";
import type { TenantProduct, TenantCategory, StoreConfig } from "@/lib/multiTenantStorage";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, ShoppingBag, Plus, Minus, X, Heart, Coins } from "lucide-react";
import { NicheIcon } from "@/components/NicheIcon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { formatScheduleSummary, type WeekSchedule } from "@/components/store/ScheduleEditor";

interface CartEntry {
  product: TenantProduct;
  qty: number;
}

const StoreFront = () => {
  const { slug } = useParams<{ slug: string }>();
  const store = slug ? getStoreBySlug(slug) : undefined;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const { toast } = useToast();

  const products = useMemo(() => (store ? getProductsByStore(store.id) : []), [store]);
  const categories = useMemo(() => (store ? getCategoriesByStore(store.id) : []), [store]);

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Loja não encontrada</h1>
          <p className="text-muted-foreground mb-4">Verifique o link e tente novamente.</p>
          <Button onClick={() => window.location.href = "/"}>Ir para a página inicial</Button>
        </div>
      </div>
    );
  }

  const niche = NICHES.find((n) => n.id === store.niche);
  const loyaltyConfig = getStoreConfig(store.id);
  const loyaltyActive = loyaltyConfig.enabled && (loyaltyConfig.pointsEnabled || loyaltyConfig.cashbackEnabled);
  const filtered = activeCategory ? products.filter((p) => p.category === activeCategory) : products;
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + (c.product.promoPrice ?? c.product.price) * c.qty, 0);

  const addToCart = (product: TenantProduct) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) return prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });
    toast({ title: `${product.name} adicionado!` });
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.product.id !== id));
    } else {
      setCart((prev) => prev.map((c) => c.product.id === id ? { ...c, qty } : c));
    }
  };

  const accentColor = store.primaryColor || "hsl(var(--primary))";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NicheIcon name={niche?.icon} className="h-5 w-5 text-foreground" />
            <span className="font-display font-bold text-foreground text-sm">{store.name}</span>
          </div>
          <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-primary-foreground"
                style={{ backgroundColor: accentColor }}
              >
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-8 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: accentColor + "20" }}
              >
                <NicheIcon name={niche?.icon} className="h-8 w-8" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">{store.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-caramel text-caramel" />
                  <span>{store.rating.toFixed(1)}</span>
                  {store.city && (
                    <>
                      <span>·</span>
                      <MapPin className="h-3 w-3" />
                      <span>{store.city}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {store.description && (
              <p className="text-sm text-muted-foreground mb-3">{store.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {store.hours && (
                <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3" /> {(() => {
                    try { return formatScheduleSummary(JSON.parse(store.hours) as WeekSchedule); } catch { return store.hours; }
                  })()}
                </span>
              )}
              {store.phone && (
                <span className="text-xs bg-muted px-2 py-1 rounded-full">{store.phone}</span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="container mx-auto px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeCategory ? "text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              style={!activeCategory ? { backgroundColor: accentColor } : undefined}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.slug
                    ? "text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                style={activeCategory === cat.slug ? { backgroundColor: accentColor } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <section className="container mx-auto px-4 pb-24">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          {products.length === 0 ? "Cardápio" : `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`}
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <NicheIcon name={niche?.icon} className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm">Esta loja ainda não adicionou produtos ao cardápio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3 bg-card rounded-xl border border-border p-3 hover:shadow-sm transition-shadow"
              >
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm text-foreground truncate">{product.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {product.promoPrice ? (
                        <>
                          <span className="text-sm font-bold" style={{ color: accentColor }}>
                            R$ {product.promoPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            R$ {product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-foreground">R$ {product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full"
                      style={{ backgroundColor: accentColor }}
                      onClick={() => addToCart(product)}
                      disabled={!product.available}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Cart Drawer */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-display">Sacola ({cartCount})</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto py-4 space-y-3">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Sua sacola está vazia</p>
            ) : (
              cart.map((entry) => (
                <div key={entry.product.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      R$ {((entry.product.promoPrice ?? entry.product.price) * entry.qty).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(entry.product.id, entry.qty - 1)}
                      className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{entry.qty}</span>
                    <button
                      onClick={() => updateCartQty(entry.product.id, entry.qty + 1)}
                      className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => updateCartQty(entry.product.id, 0)}
                      className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="border-t border-border pt-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-display font-bold text-foreground">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full" style={{ backgroundColor: accentColor }}>
                Finalizar pedido
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StoreFront;
