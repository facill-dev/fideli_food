import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { updateStore, NICHES } from "@/lib/multiTenantStorage";
import { toast } from "sonner";
import { Save, ExternalLink, Copy } from "lucide-react";
import { ScheduleEditor, DEFAULT_SCHEDULE, type WeekSchedule } from "@/components/store/ScheduleEditor";

export default function Settings() {
  const { store, refreshUser } = useAuth();

  const [name, setName] = useState(store?.name || "");
  const [description, setDescription] = useState(store?.description || "");
  const [address, setAddress] = useState(store?.address || "");
  const [city, setCity] = useState(store?.city || "");
  const [phone, setPhone] = useState(store?.phone || "");
  const [schedule, setSchedule] = useState<WeekSchedule>(() => {
    try { return store?.hours ? JSON.parse(store.hours) : DEFAULT_SCHEDULE; } catch { return DEFAULT_SCHEDULE; }
  });
  const [instagram, setInstagram] = useState(store?.instagram || "");
  const [primaryColor, setPrimaryColor] = useState(store?.primaryColor || "#d64d7a");

  if (!store) return null;

  const niche = NICHES.find((n) => n.id === store.niche);
  const storeUrl = `${window.location.origin}/loja/${store.slug}`;

  const handleSave = () => {
    updateStore(store.id, {
      name,
      description,
      address,
      city,
      phone,
      hours: JSON.stringify(schedule),
      instagram,
      primaryColor,
    });
    refreshUser();
    toast.success("Configurações salvas!");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success("Link copiado!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Configurações</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Personalize sua loja</p>
        </div>
        <Button size="sm" className="gap-1" onClick={handleSave}>
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Salvar</span>
        </Button>
      </div>

      {/* Store link */}
      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Link da sua loja</p>
              <p className="text-sm font-medium text-foreground truncate">{storeUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" /> Copiar
              </Button>
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Basic info */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display">Informações básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-2xl">{niche?.icon || "🏪"}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{niche?.label || store.niche}</p>
                <p className="text-xs text-muted-foreground">Nicho · slug: {store.slug}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Nome da loja</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Cor principal</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{primaryColor}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact info */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display">Contato e endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Cidade</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Telefone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Endereço</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Horário de funcionamento</Label>
                <Input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Ter a Sáb · 9h-18h" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Instagram</Label>
                <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@sualoja" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
