import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DaySchedule {
  open: boolean;
  from: string;
  to: string;
}

export type WeekSchedule = Record<string, DaySchedule>;

const DAYS = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return [`${h}:00`, `${h}:30`];
}).flat();

export const DEFAULT_SCHEDULE: WeekSchedule = {
  seg: { open: true, from: "08:00", to: "18:00" },
  ter: { open: true, from: "08:00", to: "18:00" },
  qua: { open: true, from: "08:00", to: "18:00" },
  qui: { open: true, from: "08:00", to: "18:00" },
  sex: { open: true, from: "08:00", to: "18:00" },
  sab: { open: true, from: "09:00", to: "14:00" },
  dom: { open: false, from: "09:00", to: "14:00" },
};

export function formatScheduleSummary(schedule: WeekSchedule): string {
  const openDays = DAYS.filter((d) => schedule[d.key]?.open);
  if (openDays.length === 0) return "Fechado";
  if (openDays.length === 7) {
    const s = schedule[openDays[0].key];
    const allSame = openDays.every(
      (d) => schedule[d.key].from === s.from && schedule[d.key].to === s.to
    );
    if (allSame) return `Todos os dias · ${s.from}–${s.to}`;
  }
  // Group consecutive days with same hours
  const groups: { days: string[]; from: string; to: string }[] = [];
  openDays.forEach((d) => {
    const s = schedule[d.key];
    const last = groups[groups.length - 1];
    if (last && last.from === s.from && last.to === s.to) {
      last.days.push(d.label.slice(0, 3));
    } else {
      groups.push({ days: [d.label.slice(0, 3)], from: s.from, to: s.to });
    }
  });
  return groups
    .map((g) =>
      g.days.length === 1
        ? `${g.days[0]} ${g.from}–${g.to}`
        : `${g.days[0]} a ${g.days[g.days.length - 1]} · ${g.from}–${g.to}`
    )
    .join(" | ");
}

interface ScheduleEditorProps {
  value: WeekSchedule;
  onChange: (schedule: WeekSchedule) => void;
}

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
  const update = (dayKey: string, patch: Partial<DaySchedule>) => {
    onChange({ ...value, [dayKey]: { ...value[dayKey], ...patch } });
  };

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const s = value[day.key] || { open: false, from: "08:00", to: "18:00" };
        return (
          <div
            key={day.key}
            className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
              s.open ? "border-border bg-card" : "border-border/50 bg-muted/30"
            }`}
          >
            <Switch
              checked={s.open}
              onCheckedChange={(v) => update(day.key, { open: v })}
              className="scale-75 shrink-0"
            />
            <span className={`text-sm font-medium w-16 shrink-0 ${s.open ? "text-foreground" : "text-muted-foreground"}`}>
              {day.label.slice(0, 3)}
            </span>

            {s.open ? (
              <div className="flex items-center gap-1.5 flex-1">
                <Select value={s.from} onValueChange={(v) => update(day.key, { from: v })}>
                  <SelectTrigger className="h-8 text-xs w-[85px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">às</span>
                <Select value={s.to} onValueChange={(v) => update(day.key, { to: v })}>
                  <SelectTrigger className="h-8 text-xs w-[85px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Fechado</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
