import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Flame } from "lucide-react";
import eventBanner from "@/assets/event-banner.jpg";

const EventBanner = () => {
  return (
    <section id="eventos" className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
        >
          <img
            src={eventBanner}
            alt="Festival de Fatias"
            className="w-full h-64 md:h-80 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-accent via-accent/60 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-caramel" />
              <span className="text-sm font-bold text-caramel uppercase tracking-wide">
                Evento Especial
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-accent-foreground mb-2">
              Festival de Fatias
            </h2>
            <p className="text-accent-foreground/80 mb-4 max-w-md">
              Mais de 10 sabores exclusivos com vagas limitadas. Reserve a sua fatia antes que acabe!
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-accent-foreground/70 text-sm">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" /> Sábado, 15 Mar 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> 9h às 17h
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/30 text-primary-foreground text-xs font-bold">
                12 vagas restantes
              </span>
            </div>
            <Button variant="warm" size="lg" className="w-fit">
              Reservar Agora
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EventBanner;
