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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Eventos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie eventos e reservas especiais</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Novo Evento
        </Button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-foreground">{event.name}</h3>
                    <Badge variant="outline" className={STATUS_STYLE[event.status]}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(event.startDate).toLocaleDateString("pt-BR")} - {new Date(event.endDate).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      {event.items} itens
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {event.soldSlots}/{event.totalSlots} vagas
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Receita</p>
                    <p className="text-lg font-bold font-display text-foreground">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(event.revenue)}
                    </p>
                  </div>
                  <div>
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(340, 70%, 55%)" strokeWidth="4"
                          strokeDasharray={`${(event.soldSlots / event.totalSlots) * 175.9} 175.9`}
                        />
                      </svg>
                      <span className="text-xs font-bold text-foreground">{Math.round((event.soldSlots / event.totalSlots) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
