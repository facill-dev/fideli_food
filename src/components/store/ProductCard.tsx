import { motion } from "framer-motion";
import { Plus, Star, Clock, MapPin, Truck } from "lucide-react";
import { Product } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { addItem } = useCart();
  const hasPromo = product.promoPrice !== undefined;
  const finalPrice = product.promoPrice ?? product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group flex gap-3 p-3 bg-card rounded-xl border border-border hover:shadow-md transition-all duration-200 cursor-pointer relative"
    >
      {/* Product image */}
      <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {product.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          <h3 className="font-body text-sm font-semibold text-card-foreground leading-tight line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-2 space-y-1.5">
          {/* Tags */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {product.rating && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-caramel fill-caramel" />
                {product.rating}
              </span>
            )}
            {product.prepTime && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {product.prepTime}
              </span>
            )}
          </div>

          {/* Delivery info */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {product.pickup && (
              <span className="flex items-center gap-0.5 bg-secondary px-1.5 py-0.5 rounded">
                <MapPin className="h-2.5 w-2.5" /> Retirada
              </span>
            )}
            {product.delivery && (
              <span className="flex items-center gap-0.5 bg-secondary px-1.5 py-0.5 rounded">
                <Truck className="h-2.5 w-2.5" /> Entrega
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-foreground">
                R$ {finalPrice.toFixed(2)}
              </span>
              {hasPromo && (
                <span className="text-[11px] text-muted-foreground line-through">
                  R$ {product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          addItem(product);
        }}
        disabled={!product.available}
        className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all shadow-sm disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default ProductCard;
