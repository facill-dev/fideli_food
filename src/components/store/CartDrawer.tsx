import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, total, updateQty, removeItem, itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <SheetHeader>
            <SheetTitle className="font-body text-base font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Sacola
              {itemCount > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({itemCount} {itemCount === 1 ? "item" : "itens"})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Sua sacola está vazia</p>
              <p className="text-xs text-muted-foreground mt-1">Adicione itens do cardápio para começar</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Ver cardápio
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {items.map((item) => {
                  const price = item.product.promoPrice ?? item.product.price;
                  return (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-border"
                    >
                      <div className="flex gap-3 p-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-foreground truncate">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-0.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-foreground mt-1">
                            R$ {(price * item.quantity).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-0 mt-2 bg-muted rounded-lg w-fit">
                            <button
                              onClick={() => updateQty(item.product.id, item.quantity - 1)}
                              className="h-7 w-7 rounded-l-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-primary"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-sm font-semibold w-8 text-center text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.product.id, item.quantity + 1)}
                              className="h-7 w-7 rounded-r-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-primary"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 space-y-3 bg-card">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span className="text-primary font-medium">Grátis</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button variant="hero" size="lg" className="w-full gap-2" onClick={() => { setIsOpen(false); navigate("/checkout"); }}>
                Finalizar pedido
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
