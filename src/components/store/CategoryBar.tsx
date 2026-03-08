import { categories } from "@/data/mockData";
import { motion } from "framer-motion";

interface CategoryBarProps {
  activeCategory: string | null;
  onSelect: (slug: string | null) => void;
}

const CategoryBar = ({ activeCategory, onSelect }: CategoryBarProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
      <button
        onClick={() => onSelect(null)}
        className={`flex flex-col items-center gap-1.5 shrink-0 min-w-[64px] group`}
      >
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
            activeCategory === null
              ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
              : "bg-muted text-muted-foreground group-hover:bg-muted/80"
          }`}
        >
          Todos
        </div>
        <span
          className={`text-[11px] font-medium transition-colors ${
            activeCategory === null ? "text-primary" : "text-muted-foreground"
          }`}
        >
          Todos
        </span>
      </button>

      {categories.map((cat) => (
        <motion.button
          key={cat.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(cat.slug)}
          className="flex flex-col items-center gap-1.5 shrink-0 min-w-[64px] group"
        >
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all ${
              activeCategory === cat.slug
                ? "shadow-md ring-2 ring-primary/30 bg-primary/5"
                : "bg-muted group-hover:bg-muted/80"
            }`}
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-10 h-10 object-contain"
            />
          </div>
          <span
            className={`text-[11px] font-medium transition-colors ${
              activeCategory === cat.slug ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {cat.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryBar;
