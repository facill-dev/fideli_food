import { useState } from "react";
import { products } from "@/data/mockData";
import CategoryBar from "./CategoryBar";
import ProductCard from "./ProductCard";


const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <section id="cardapio" className="py-6">
      <div className="container mx-auto px-4">
        {/* Categories - horizontal scroll like iFood */}
        <div className="mb-6">
          <CategoryBar activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">
            {activeCategory
              ? `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`
              : "Cardápio completo"}
          </h2>
          <span className="text-xs text-muted-foreground">
            {products.length} itens
          </span>
        </div>

        {/* Product list - iFood style stacked cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
