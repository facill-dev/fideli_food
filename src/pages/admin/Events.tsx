import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, Package } from "lucide-react";

const events = [
  {
    id: "1",
    name: "Festival das Fatias",
    status: "ativo" as const,
    startDate: "2026-03-01",
    endDate: "2026-03-15",
    totalSlots: 100,
    soldSlots: 67,
    revenue: 2613,
    items: 5,
  },
  {
    id: "2",
    name: "Pascoa Especial",
    status: "agendado" as const,
    startDate: "2026-03-28",
    endDate: "2026-04-05",
    totalSlots: 50,
    soldSlots: 0,
    revenue: 0,
    items: 8,
  },
];

const STATUS_STYLE = {
  ativo: "bg-green-100 text-green-800",
  agendado: "bg-blue-100 text-blue-800",
  encerrado: "bg-muted text-muted-foreground",
  cancelado: "bg-red-100 text-red-800",
};

export default function Events() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Eventos</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Gerencie eventos e reservas especiais</p>
        </div>
        <Button size="sm" className="shrink-0">
          <Plus className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Novo Evento</span>
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {events.map((event) => {
          const pct = event.totalSlots > 0 ? Math.round((event.soldSlots / event.totalSlots) * 100) : 0;
          return (
            <Card key={event.id} className="border-border/50">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4">
                  {/* Top: name + badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-base sm:text-lg text-foreground">{event.name}</h3>
                        <Badge variant="outline" className={STATUS_STYLE[event.status]}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                          {new Date(event.startDate).toLocaleDateString("pt-BR")} - {new Date(event.endDate).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                          {event.items} itens
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                          {event.soldSlots}/{event.totalSlots} vagas
                        </span>
                      </div>
                    </div>

                    {/* Progress circle - hidden on very small screens */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Receita</p>
                        <p className="text-base sm:text-lg font-bold font-display text-foreground">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(event.revenue)}
                        </p>
                      </div>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(340, 70%, 55%)" strokeWidth="4"
                            strokeDasharray={`${(pct / 100) * 175.9} 175.9`}
                          />
                        </svg>
                        <span className="text-[10px] sm:text-xs font-bold text-foreground">{pct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile stats bar */}
                  <div className="sm:hidden flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(event.revenue)}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-foreground">{pct}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
