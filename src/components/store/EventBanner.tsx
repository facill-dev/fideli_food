import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Users, ChevronRight } from "lucide-react";
import eventBanner from "@/assets/event-banner.jpg";

const EventBanner = () => {
  return (
    <section id="eventos" className="py-6">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          Eventos especiais
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-xl border border-border overflow-hidden shadow-sm"
        >
          {/* Event image */}
          <div className="relative h-40 md:h-52 overflow-hidden">
            <img
              src={eventBanner}
              alt="Festival de Fatias"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[11px] font-bold px-2.5 py-1 rounded-md">
              Evento
            </span>
          </div>

          {/* Event info */}
          <div className="p-4 md:p-5">
            <h3 className="font-display text-xl font-bold text-card-foreground mb-1">
              Festival de Fatias
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Mais de 10 sabores exclusivos com vagas limitadas. Reserve a sua fatia antes que acabe!
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Sáb, 15 Mar 2026</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg">
                <Clock className="h-3.5 w-3.5" />
                <span>9h às 17h</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg">
                <Users className="h-3.5 w-3.5" />
                <span>12 vagas restantes</span>
              </div>
            </div>

            <Button variant="hero" className="w-full md:w-auto gap-2">
              Reservar agora
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EventBanner;
