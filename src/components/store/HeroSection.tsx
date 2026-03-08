import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Star } from "lucide-react";
import heroCake from "@/assets/hero-cake.jpg";
import logo from "@/assets/logo.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative">
      {/* Hero image */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={heroCake}
          alt="Confeitaria artesanal"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Store info card - iFood style */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="-mt-16 relative bg-card rounded-xl border border-border shadow-sm p-5"
        >
          <div className="flex items-start gap-4">
            <img
              src={logo}
              alt="Festival de Fatias"
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shadow-md border-2 border-background shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="font-display text-xl md:text-2xl font-bold text-card-foreground">
                    Festival de Fatias
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Confeitaria Artesanal
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md shrink-0">
                  <Star className="h-3.5 w-3.5 text-caramel fill-caramel" />
                  <span className="text-sm font-bold text-foreground">4.9</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Santarém, PA
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Ter a Sáb · 9h–18h
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  Aberto agora
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                  Retirada grátis
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                  Entrega disponível
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  Reservas abertas
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
