import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";

export default function Events() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Eventos</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Gerencie eventos e promoções especiais</p>
        </div>
        <Button size="sm" className="shrink-0" disabled>
          <Plus className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Novo Evento</span>
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="text-center py-12">
          <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h2 className="font-display font-bold text-foreground mb-2">Em breve</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            A funcionalidade de eventos será conectada ao seu banco de dados em uma versão futura.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
