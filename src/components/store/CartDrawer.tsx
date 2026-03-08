import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, total, updateQty, removeItem } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background">
        <SheetHeader>
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Seu Pedido
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="text-6xl">🍰</div>
            <p className="text-muted-foreground">Seu carrinho está vazio</p>
            <Button variant="hero" onClick={() => setIsOpen(false)}>
              Ver Cardápio
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              <AnimatePresence>
                {items.map((item) => {
                  const price = item.product.promoPrice ?? item.product.price;
                  return (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-3 rounded-lg bg-card border border-border"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-card-foreground truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-accent font-bold text-sm">
                          R$ {(price * item.quantity).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity - 1)}
                            className="h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity + 1)}
                            className="h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors self-start"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-accent font-display">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <Button variant="hero" size="lg" className="w-full">
                Finalizar Pedido
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
