import { MapPin, Phone, Clock, Instagram } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer id="contato" className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
              <span className="font-display text-xl font-bold">Festival de Fatias</span>
            </div>
            <p className="text-accent-foreground/70 text-sm">
              Confeitaria artesanal em Santarém. Sabores que encantam a cada fatia.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg">Informações</h3>
            <div className="space-y-2 text-sm text-accent-foreground/70">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> Santarém, PA
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> (93) 99999-0000
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" /> Ter a Sáb: 9h às 18h
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg">Redes Sociais</h3>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors"
            >
              <Instagram className="h-4 w-4" /> @festivaldefatias
            </a>
          </div>
        </div>

        <div className="border-t border-accent-foreground/10 mt-8 pt-6 text-center text-xs text-accent-foreground/50">
          © 2026 Festival de Fatias. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
