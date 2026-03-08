import { useState } from "react";
import { products } from "@/data/mockData";
import CategoryBar from "./CategoryBar";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <section id="cardapio" className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Nosso Cardápio
          </h2>
          <p className="text-muted-foreground">
            Feito com carinho, do forno para a sua mesa
          </p>
        </motion.div>

        <div className="mb-6">
          <CategoryBar activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">🍰</p>
            <p>Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
