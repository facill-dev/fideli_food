import { categories } from "@/data/mockData";
import { motion } from "framer-motion";

interface CategoryBarProps {
  activeCategory: string | null;
  onSelect: (slug: string | null) => void;
}

const CategoryBar = ({ activeCategory, onSelect }: CategoryBarProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeCategory === null
            ? "bg-accent text-accent-foreground shadow-md"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <motion.button
          key={cat.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(cat.slug)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === cat.slug
              ? "bg-accent text-accent-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {cat.icon} {cat.name}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryBar;
