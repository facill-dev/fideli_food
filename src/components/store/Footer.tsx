import { MapPin, Phone, Clock, Instagram, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer id="contato" className="bg-card border-t border-border mt-6">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
              <div>
                <span className="font-display text-sm font-bold text-card-foreground block">Festival de Fatias</span>
                <span className="text-[11px] text-muted-foreground">Confeitaria Artesanal</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Confeitaria artesanal em Santarém. Sabores que encantam a cada fatia.
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Informações
            </h3>
            <div className="space-y-2 text-sm text-card-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                Santarém, PA
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                (93) 99999-0000
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                Ter a Sáb: 9h às 18h
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Redes Sociais
            </h3>
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-card-foreground hover:text-primary transition-colors group"
            >
              <Instagram className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
              @festivaldefatias
              <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
            </a>
          </div>
        </div>

        <div className="border-t border-border mt-6 pt-4 text-center text-[11px] text-muted-foreground">
          © 2026 Festival de Fatias. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
