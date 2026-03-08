import { motion } from "framer-motion";
import { ShoppingBag, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { addItem } = useCart();

  const hasPromo = product.promoPrice !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-semibold">
            {product.badge}
          </Badge>
        )}
        {product.availableQty <= 5 && product.available && (
          <span className="absolute top-3 right-3 bg-caramel text-caramel-foreground text-xs font-bold px-2 py-1 rounded-full">
            Últimas {product.availableQty}!
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-card-foreground mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          {product.pickup && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Retirada
            </span>
          )}
          {product.delivery && (
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" /> Entrega
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {hasPromo && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {product.price.toFixed(2)}
              </span>
            )}
            <span className="text-xl font-bold text-accent">
              R$ {(product.promoPrice ?? product.price).toFixed(2)}
            </span>
          </div>

          <Button
            variant="hero"
            size="sm"
            onClick={() => addItem(product)}
            disabled={!product.available}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
