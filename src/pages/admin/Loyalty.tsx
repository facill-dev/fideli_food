import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Heart, Star, Coins, Wallet, Users, TrendingUp, Gift,
  Plus, Search, ArrowUpDown, Edit, Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  getStoreConfig, updateStoreConfig, getWalletsByStore,
  getMovementsByStore, getCampaigns, addCampaign, updateCampaign, deleteCampaign,
  manualAdjust, getMovements, getGlobalConfig, pointsToMoney,
  type LoyaltyStoreConfig, type LoyaltyWallet, type LoyaltyCampaign, type LoyaltyMovement,
} from "@/lib/loyaltyStorage";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function Loyalty() {
  const { store } = useAuth();
  const storeId = store?.id || "";
  const globalConfig = getGlobalConfig();

  const [config, setConfig] = useState<LoyaltyStoreConfig>(() => getStoreConfig(storeId));
  const [wallets, setWallets] = useState<LoyaltyWallet[]>(() => getWalletsByStore(storeId));
  const [campaigns, setCampaigns] = useState<LoyaltyCampaign[]>(() => getCampaigns(storeId));
  const [searchWallet, setSearchWallet] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<LoyaltyWallet | null>(null);
  const [walletMovements, setWalletMovements] = useState<LoyaltyMovement[]>([]);

  // Campaign dialog
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Partial<LoyaltyCampaign>>({});

  // Manual adjust dialog
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [adjustType, setAdjustType] = useState<"points" | "cashback">("points");
  const [adjustCredit, setAdjustCredit] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  if (!globalConfig.enabled) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Fidelização</h1>
        <Card><CardContent className="p-8 text-center">
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">O módulo de fidelização está desativado pela plataforma.</p>
        </CardContent></Card>
      </div>
    );
  }

  const handleSaveConfig = (data: Partial<LoyaltyStoreConfig>) => {
    const updated = updateStoreConfig(storeId, data);
    setConfig(updated);
    toast.success("Configuração salva!");
  };

  const refresh = () => {
    setWallets(getWalletsByStore(storeId));
    setCampaigns(getCampaigns(storeId));
  };

  // Dashboard stats
  const totalPointsEmitted = wallets.reduce((s, w) => s + w.totalPointsEarned, 0);
  const totalPointsRedeemed = wallets.reduce((s, w) => s + w.totalPointsRedeemed, 0);
  const totalCashbackEmitted = wallets.reduce((s, w) => s + w.totalCashbackEarned, 0);
  const totalCashbackUsed = wallets.reduce((s, w) => s + w.totalCashbackUsed, 0);
  const activeWallets = wallets.filter((w) => w.pointsBalance > 0 || w.cashbackBalance > 0).length;
  const currentLiability = wallets.reduce((s, w) => s + w.cashbackBalance + w.cashbackPending, 0);

  const filteredWallets = wallets.filter((w) =>
    w.customerName.toLowerCase().includes(searchWallet.toLowerCase()) ||
    w.customerId.includes(searchWallet.replace(/\D/g, ""))
  );

  const handleSaveCampaign = () => {
    if (!editCampaign.name || !editCampaign.startDate || !editCampaign.endDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (editCampaign.id) {
      updateCampaign(editCampaign.id, editCampaign);
    } else {
      addCampaign({
        storeId,
        name: editCampaign.name || "",
        description: editCampaign.description || "",
        type: editCampaign.type || "points_multiplier",
        multiplier: editCampaign.multiplier,
        bonusPercent: editCampaign.bonusPercent,
        startDate: editCampaign.startDate || "",
        endDate: editCampaign.endDate || "",
        active: editCampaign.active ?? true,
        minOrder: editCampaign.minOrder || 0,
      });
    }
    setCampaignDialog(false);
    setEditCampaign({});
    refresh();
    toast.success("Campanha salva!");
  };

  const handleManualAdjust = () => {
    if (!selectedWallet || !adjustAmount || !adjustReason.trim()) {
      toast.error("Preencha valor e motivo");
      return;
    }
    manualAdjust(
      selectedWallet.id, adjustType, adjustCredit,
      Number(adjustAmount), adjustReason, "admin"
    );
    setAdjustDialog(false);
    setAdjustAmount("");
    setAdjustReason("");
    refresh();
    setWalletMovements(getMovements(selectedWallet.id));
    toast.success("Ajuste realizado!");
  };

  const ACTION_LABELS: Record<string, string> = {
    credit_pending: "Crédito pendente",
    credit_released: "Crédito liberado",
    debit_redeem: "Resgate",
    debit_expiration: "Expiração",
    debit_reversal: "Reversão",
    manual_credit: "Ajuste +",
    manual_debit: "Ajuste -",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" /> Fidelização
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gerencie seu programa de fidelidade
          </p>
        </div>
        <Badge variant={config.enabled ? "default" : "secondary"}>
          {config.enabled ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        {/* ─── Dashboard ─── */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Clientes ativos</span>
                </div>
                <p className="text-xl font-bold font-display text-foreground">{activeWallets}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Pontos emitidos</span>
                </div>
                <p className="text-xl font-bold font-display text-foreground">{totalPointsEmitted.toLocaleString("pt-BR")}</p>
                <p className="text-[10px] text-muted-foreground">{totalPointsRedeemed.toLocaleString("pt-BR")} resgatados</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Cashback emitido</span>
                </div>
                <p className="text-xl font-bold font-display text-foreground">{fmt(totalCashbackEmitted)}</p>
                <p className="text-[10px] text-muted-foreground">{fmt(totalCashbackUsed)} utilizado</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-destructive" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Passivo atual</span>
                </div>
                <p className="text-xl font-bold font-display text-destructive">{fmt(currentLiability)}</p>
              </CardContent>
            </Card>
          </div>

          {!config.enabled && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center">
                <Gift className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-display font-bold text-foreground mb-1">Ative seu programa de fidelização!</h3>
                <p className="text-sm text-muted-foreground mb-4">Aumente a recorrência dos seus clientes com pontos e cashback.</p>
                <Button onClick={() => handleSaveConfig({ enabled: true })}>
                  <Heart className="h-4 w-4 mr-2" /> Ativar agora
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Configuração ─── */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Programa</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Programa ativo</Label>
                <Switch checked={config.enabled} onCheckedChange={(v) => handleSaveConfig({ enabled: v })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Nome do programa</Label>
                <Input value={config.programName} onChange={(e) => setConfig({ ...config, programName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Descrição</Label>
                <Textarea value={config.programDescription} onChange={(e) => setConfig({ ...config, programDescription: e.target.value })} />
              </div>
              <Button size="sm" onClick={() => handleSaveConfig({ programName: config.programName, programDescription: config.programDescription })}>
                Salvar
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Points config */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" /> Pontos
                  </CardTitle>
                  <Switch checked={config.pointsEnabled} onCheckedChange={(v) => handleSaveConfig({ pointsEnabled: v })} />
                </div>
              </CardHeader>
              {config.pointsEnabled && (
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Pontos por R$1</Label>
                      <Input type="number" value={config.pointsPerReal} onChange={(e) => setConfig({ ...config, pointsPerReal: Number(e.target.value) })} />
                      <p className="text-[10px] text-muted-foreground mt-0.5">Máx: {globalConfig.maxPointsPerReal}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Taxa de conversão</Label>
                      <Input type="number" value={config.pointsRedemptionRate} onChange={(e) => setConfig({ ...config, pointsRedemptionRate: Number(e.target.value) })} />
                      <p className="text-[10px] text-muted-foreground mt-0.5">{config.pointsRedemptionRate} pts = R$1</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Mín. p/ pontuar (R$)</Label>
                      <Input type="number" value={config.minOrderForPoints} onChange={(e) => setConfig({ ...config, minOrderForPoints: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label className="text-xs">Máx. pontos/pedido</Label>
                      <Input type="number" value={config.maxPointsPerOrder} onChange={(e) => setConfig({ ...config, maxPointsPerOrder: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Mín. p/ resgatar</Label>
                      <Input type="number" value={config.minPointsToRedeem} onChange={(e) => setConfig({ ...config, minPointsToRedeem: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label className="text-xs">Validade (dias)</Label>
                      <Input type="number" value={config.pointsExpirationDays} onChange={(e) => setConfig({ ...config, pointsExpirationDays: Number(e.target.value) })} />
                      <p className="text-[10px] text-muted-foreground mt-0.5">0 = sem expiração</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleSaveConfig({
                    pointsPerReal: config.pointsPerReal,
                    pointsRedemptionRate: config.pointsRedemptionRate,
                    minOrderForPoints: config.minOrderForPoints,
                    maxPointsPerOrder: config.maxPointsPerOrder,
                    minPointsToRedeem: config.minPointsToRedeem,
                    pointsExpirationDays: config.pointsExpirationDays,
                  })}>Salvar pontos</Button>
                </CardContent>
              )}
            </Card>

            {/* Cashback config */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" /> Cashback
                  </CardTitle>
                  <Switch checked={config.cashbackEnabled} onCheckedChange={(v) => handleSaveConfig({ cashbackEnabled: v })} />
                </div>
              </CardHeader>
              {config.cashbackEnabled && (
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Cashback (%)</Label>
                      <Input type="number" value={config.cashbackPercent} onChange={(e) => setConfig({ ...config, cashbackPercent: Number(e.target.value) })} />
                      <p className="text-[10px] text-muted-foreground mt-0.5">Máx: {globalConfig.maxCashbackPercent}%</p>
                    </div>
                    <div>
                      <Label className="text-xs">Máx. por pedido (R$)</Label>
                      <Input type="number" value={config.maxCashbackPerOrder} onChange={(e) => setConfig({ ...config, maxCashbackPerOrder: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Pedido mín. (R$)</Label>
                      <Input type="number" value={config.minOrderForCashback} onChange={(e) => setConfig({ ...config, minOrderForCashback: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label className="text-xs">Validade (dias)</Label>
                      <Input type="number" value={config.cashbackExpirationDays} onChange={(e) => setConfig({ ...config, cashbackExpirationDays: Number(e.target.value) })} />
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleSaveConfig({
                    cashbackPercent: config.cashbackPercent,
                    maxCashbackPerOrder: config.maxCashbackPerOrder,
                    minOrderForCashback: config.minOrderForCashback,
                    cashbackExpirationDays: config.cashbackExpirationDays,
                  })}>Salvar cashback</Button>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Usage rules */}
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Regras de uso</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Combinar pontos + cashback</Label>
                  <Switch checked={config.allowCombinePointsAndCashback} onCheckedChange={(v) => handleSaveConfig({ allowCombinePointsAndCashback: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Combinar com cupom</Label>
                  <Switch checked={config.allowCombineWithCoupon} onCheckedChange={(v) => handleSaveConfig({ allowCombineWithCoupon: v })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Máx. desconto por pedido (%)</Label>
                  <Input type="number" value={config.maxDiscountPercentPerOrder} onChange={(e) => {
                    const v = Math.min(Number(e.target.value), globalConfig.maxDiscountPercentPerOrder);
                    handleSaveConfig({ maxDiscountPercentPerOrder: v });
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Liberar benefícios em</Label>
                  <Select value={config.releaseOn} onValueChange={(v: "delivered" | "confirmed") => handleSaveConfig({ releaseOn: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivered">Pedido entregue</SelectItem>
                      <SelectItem value="confirmed">Pedido confirmado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Campanhas ─── */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{campaigns.length} campanha(s)</p>
            <Button size="sm" onClick={() => { setEditCampaign({ type: "points_multiplier", active: true, minOrder: 0, multiplier: 2 }); setCampaignDialog(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Nova campanha
            </Button>
          </div>

          {campaigns.length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <Gift className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma campanha criada.</p>
              <p className="text-xs text-muted-foreground mt-1">Crie campanhas de pontos dobrados ou cashback extra.</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {campaigns.map((c) => {
                const isActive = c.active && new Date(c.startDate) <= new Date() && new Date(c.endDate) >= new Date();
                return (
                  <Card key={c.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">{c.name}</p>
                            <Badge variant={isActive ? "default" : "secondary"} className="text-[10px]">
                              {isActive ? "Ativa" : c.active ? "Agendada" : "Inativa"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {c.type === "points_multiplier" ? `${c.multiplier}x pontos` : `+${c.bonusPercent}% cashback`}
                            {c.minOrder > 0 && ` · Pedido mín: ${fmt(c.minOrder)}`}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(c.startDate).toLocaleDateString("pt-BR")} — {new Date(c.endDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCampaign(c); setCampaignDialog(true); }}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { deleteCampaign(c.id); refresh(); toast.success("Campanha removida"); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Campaign dialog */}
          <Dialog open={campaignDialog} onOpenChange={setCampaignDialog}>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">{editCampaign.id ? "Editar" : "Nova"} campanha</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Nome *</Label>
                  <Input value={editCampaign.name || ""} onChange={(e) => setEditCampaign({ ...editCampaign, name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Textarea value={editCampaign.description || ""} onChange={(e) => setEditCampaign({ ...editCampaign, description: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select value={editCampaign.type || "points_multiplier"} onValueChange={(v) => setEditCampaign({ ...editCampaign, type: v as LoyaltyCampaign["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points_multiplier">Multiplicador de pontos</SelectItem>
                      <SelectItem value="cashback_bonus">Bônus de cashback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editCampaign.type === "points_multiplier" ? (
                  <div>
                    <Label className="text-xs">Multiplicador</Label>
                    <Input type="number" value={editCampaign.multiplier || 2} onChange={(e) => setEditCampaign({ ...editCampaign, multiplier: Number(e.target.value) })} />
                    <p className="text-[10px] text-muted-foreground">Ex: 2 = pontos dobrados</p>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs">Bônus cashback (%)</Label>
                    <Input type="number" value={editCampaign.bonusPercent || 5} onChange={(e) => setEditCampaign({ ...editCampaign, bonusPercent: Number(e.target.value) })} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Início *</Label>
                    <Input type="date" value={editCampaign.startDate?.slice(0, 10) || ""} onChange={(e) => setEditCampaign({ ...editCampaign, startDate: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Fim *</Label>
                    <Input type="date" value={editCampaign.endDate?.slice(0, 10) || ""} onChange={(e) => setEditCampaign({ ...editCampaign, endDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Pedido mínimo (R$)</Label>
                  <Input type="number" value={editCampaign.minOrder || 0} onChange={(e) => setEditCampaign({ ...editCampaign, minOrder: Number(e.target.value) })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Campanha ativa</Label>
                  <Switch checked={editCampaign.active ?? true} onCheckedChange={(v) => setEditCampaign({ ...editCampaign, active: v })} />
                </div>
                <Button className="w-full" onClick={handleSaveCampaign}>Salvar campanha</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── Clientes ─── */}
        <TabsContent value="customers" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou telefone..." value={searchWallet} onChange={(e) => setSearchWallet(e.target.value)} className="pl-9" />
          </div>

          {filteredWallets.length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum cliente fidelizado ainda.</p>
              <p className="text-xs text-muted-foreground mt-1">Os clientes acumularão benefícios quando fizerem pedidos.</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {filteredWallets.map((w) => (
                <Card key={w.id} className="border-border/50 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => {
                  setSelectedWallet(w);
                  setWalletMovements(getMovements(w.id));
                }}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{w.customerName}</p>
                        <p className="text-xs text-muted-foreground">{w.customerId}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {config.pointsEnabled && (
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{w.pointsBalance}</p>
                            <p className="text-[10px] text-muted-foreground">pontos</p>
                          </div>
                        )}
                        {config.cashbackEnabled && (
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">{fmt(w.cashbackBalance)}</p>
                            <p className="text-[10px] text-muted-foreground">cashback</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Wallet detail dialog */}
          <Dialog open={!!selectedWallet} onOpenChange={() => setSelectedWallet(null)}>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
              {selectedWallet && (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-display">{selectedWallet.customerName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="border-border/50">
                        <CardContent className="p-3 text-center">
                          <Star className="h-4 w-4 text-primary mx-auto mb-1" />
                          <p className="text-lg font-bold text-foreground">{selectedWallet.pointsBalance}</p>
                          <p className="text-[10px] text-muted-foreground">pontos disponíveis</p>
                          {selectedWallet.pointsPending > 0 && (
                            <p className="text-[10px] text-primary mt-0.5">+{selectedWallet.pointsPending} pendentes</p>
                          )}
                        </CardContent>
                      </Card>
                      <Card className="border-border/50">
                        <CardContent className="p-3 text-center">
                          <Coins className="h-4 w-4 text-primary mx-auto mb-1" />
                          <p className="text-lg font-bold text-foreground">{fmt(selectedWallet.cashbackBalance)}</p>
                          <p className="text-[10px] text-muted-foreground">cashback disponível</p>
                          {selectedWallet.cashbackPending > 0 && (
                            <p className="text-[10px] text-primary mt-0.5">+{fmt(selectedWallet.cashbackPending)} pendente</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {globalConfig.allowManualAdjustments && (
                      <Button size="sm" variant="outline" className="w-full" onClick={() => setAdjustDialog(true)}>
                        <ArrowUpDown className="h-4 w-4 mr-2" /> Ajuste manual
                      </Button>
                    )}

                    <Separator />
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Histórico de movimentações</p>
                      {walletMovements.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhuma movimentação.</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {walletMovements.map((m) => (
                            <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                              <div className="min-w-0">
                                <p className="text-foreground font-medium">
                                  {ACTION_LABELS[m.action] || m.action} · {m.type === "points" ? "Pontos" : "Cashback"}
                                </p>
                                <p className="text-muted-foreground">
                                  {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                                  {m.reason && ` · ${m.reason}`}
                                </p>
                              </div>
                              <span className={`font-bold shrink-0 ml-2 ${
                                m.action.includes("credit") || m.action === "manual_credit" ? "text-primary" : "text-destructive"
                              }`}>
                                {m.action.includes("credit") || m.action === "manual_credit" ? "+" : "-"}
                                {m.type === "points" ? m.amount : fmt(m.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Manual adjust dialog */}
          <Dialog open={adjustDialog} onOpenChange={setAdjustDialog}>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-display">Ajuste manual</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Tipo de saldo</Label>
                  <Select value={adjustType} onValueChange={(v) => setAdjustType(v as "points" | "cashback")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Pontos</SelectItem>
                      <SelectItem value="cashback">Cashback (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Operação</Label>
                  <Select value={adjustCredit ? "credit" : "debit"} onValueChange={(v) => setAdjustCredit(v === "credit")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Adicionar (+)</SelectItem>
                      <SelectItem value="debit">Remover (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Valor *</Label>
                  <Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="Ex: 100" />
                </div>
                <div>
                  <Label className="text-xs">Motivo *</Label>
                  <Textarea value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Descreva o motivo do ajuste..." />
                </div>
                <Button className="w-full" onClick={handleManualAdjust}>Confirmar ajuste</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
