import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroCake from "@/assets/hero-cake.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroCake}
          alt="Confeitaria artesanal"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/90 via-accent/70 to-transparent" />
      </div>

      <div className="container relative mx-auto px-4 py-24 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <span className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium backdrop-blur-sm">
            📍 Santarém
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-accent-foreground leading-tight mb-4">
            Cada fatia conta uma história
          </h1>
          <p className="text-accent-foreground/80 text-lg mb-8 max-w-md">
            Confeitaria artesanal com sabores que encantam. Faça sua reserva e garanta a sua fatia favorita.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="warm" size="lg" asChild>
              <a href="#cardapio">Ver Cardápio</a>
            </Button>
            <Button variant="outline" size="lg" className="bg-accent-foreground/10 border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/20" asChild>
              <a href="#eventos">Eventos Especiais</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
