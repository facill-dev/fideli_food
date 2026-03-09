import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Heart, Shield, Store, Users, Coins, Star, TrendingUp, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  getGlobalConfig, updateGlobalConfig, getAllStoreConfigs,
  getAllWallets, getAllMovements, getWalletsByStore,
  type LoyaltyGlobalConfig, type LoyaltyStoreConfig,
} from "@/lib/loyaltyStorage";
import { getAllStores, type StoreConfig } from "@/lib/multiTenantStorage";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function SALoyalty() {
  const [global, setGlobal] = useState<LoyaltyGlobalConfig>(() => getGlobalConfig());
  const stores = getAllStores();
  const storeConfigs = getAllStoreConfigs();
  const allWallets = getAllWallets();

  const activePrograms = storeConfigs.filter((c) => c.enabled).length;
  const totalPointsEmitted = allWallets.reduce((s, w) => s + w.totalPointsEarned, 0);
  const totalCashbackEmitted = allWallets.reduce((s, w) => s + w.totalCashbackEarned, 0);
  const totalLiability = allWallets.reduce((s, w) => s + w.cashbackBalance + w.cashbackPending, 0);
  const clientsWithBalance = allWallets.filter((w) => w.pointsBalance > 0 || w.cashbackBalance > 0).length;

  const handleSaveGlobal = (data: Partial<LoyaltyGlobalConfig>) => {
    const updated = updateGlobalConfig(data);
    setGlobal(updated);
    toast.success("Configuração global salva!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Fidelização — Plataforma</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Governança global e monitoramento</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="governance">Governança</TabsTrigger>
          <TabsTrigger value="tenants">Por Loja</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="h-4 w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Programas ativos</span>
                </div>
                <p className="text-xl font-bold font-display text-foreground">{activePrograms}</p>
                <p className="text-[10px] text-muted-foreground">de {stores.length} lojas</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Clientes com saldo</span>
                </div>
                <p className="text-xl font-bold font-display text-foreground">{clientsWithBalance}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Pontos emitidos</span>
                </div>
                <p className="text-xl font-bold font-display text-foreground">{totalPointsEmitted.toLocaleString("pt-BR")}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-destructive" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Passivo total</span>
                </div>
                <p className="text-xl font-bold font-display text-destructive">{fmt(totalLiability)}</p>
                <p className="text-[10px] text-muted-foreground">{fmt(totalCashbackEmitted)} emitido total</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Governance */}
        <TabsContent value="governance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Módulo de fidelização</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Fidelização ativa na plataforma</Label>
                <Switch checked={global.enabled} onCheckedChange={(v) => handleSaveGlobal({ enabled: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Pontos permitidos</Label>
                <Switch checked={global.pointsEnabled} onCheckedChange={(v) => handleSaveGlobal({ pointsEnabled: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Cashback permitido</Label>
                <Switch checked={global.cashbackEnabled} onCheckedChange={(v) => handleSaveGlobal({ cashbackEnabled: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Ajustes manuais permitidos</Label>
                <Switch checked={global.allowManualAdjustments} onCheckedChange={(v) => handleSaveGlobal({ allowManualAdjustments: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Combinar com cupom</Label>
                <Switch checked={global.allowCombineWithCoupon} onCheckedChange={(v) => handleSaveGlobal({ allowCombineWithCoupon: v })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base font-display">Limites máximos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Máx pontos por R$1</Label>
                  <Input type="number" value={global.maxPointsPerReal} onChange={(e) => handleSaveGlobal({ maxPointsPerReal: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Máx cashback (%)</Label>
                  <Input type="number" value={global.maxCashbackPercent} onChange={(e) => handleSaveGlobal({ maxCashbackPercent: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Máx cashback por pedido (R$)</Label>
                  <Input type="number" value={global.maxCashbackPerOrder} onChange={(e) => handleSaveGlobal({ maxCashbackPerOrder: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Máx desconto por pedido (%)</Label>
                  <Input type="number" value={global.maxDiscountPercentPerOrder} onChange={(e) => handleSaveGlobal({ maxDiscountPercentPerOrder: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Validade padrão (dias)</Label>
                  <Input type="number" value={global.defaultExpirationDays} onChange={(e) => handleSaveGlobal({ defaultExpirationDays: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Marco de liberação padrão</Label>
                  <Select value={global.releaseOn} onValueChange={(v: "delivered" | "confirmed") => handleSaveGlobal({ releaseOn: v })}>
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

        {/* Per tenant */}
        <TabsContent value="tenants" className="space-y-4">
          {stores.length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <Store className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma loja cadastrada.</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {stores.map((s) => {
                const sc = storeConfigs.find((c) => c.storeId === s.id);
                const wallets = getWalletsByStore(s.id);
                const liability = wallets.reduce((sum, w) => sum + w.cashbackBalance + w.cashbackPending, 0);
                const activeClients = wallets.filter((w) => w.pointsBalance > 0 || w.cashbackBalance > 0).length;
                return (
                  <Card key={s.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Store className="h-4 w-4 text-primary shrink-0" />
                          <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                        </div>
                        <Badge variant={sc?.enabled ? "default" : "secondary"} className="text-[10px]">
                          {sc?.enabled ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-sm font-bold text-foreground">{activeClients}</p>
                          <p className="text-[10px] text-muted-foreground">clientes</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-sm font-bold text-foreground">
                            {sc?.pointsEnabled ? `${sc.pointsPerReal}pts/R$` : "—"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">pontos</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-sm font-bold text-destructive">{fmt(liability)}</p>
                          <p className="text-[10px] text-muted-foreground">passivo</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
