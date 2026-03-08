import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Store,
  CreditCard,
  QrCode,
  Banknote,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

type DeliveryMethod = "delivery" | "pickup";
type PaymentMethod = "pix" | "card" | "cash";

import { getActiveCoupons, type Coupon } from "@/data/couponsData";

interface FormData {
  name: string;
  phone: string;
  cpf: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  notes: string;
  changeFor: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, addItem, clearCart, itemCount } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    cpf: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    notes: "",
    changeFor: "",
  });
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  const deliveryFee = deliveryMethod === "delivery" ? 8.0 : 0;

  const discount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.round(total * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;

  const grandTotal = Math.max(0, total + deliveryFee - discount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    const found = VALID_COUPONS.find((c) => c.code === code);
    if (!found) {
      setCouponError("Cupom inválido");
      setAppliedCoupon(null);
      return;
    }
    if (total < found.minOrder) {
      setCouponError(`Pedido mínimo de ${formatCurrency(found.minOrder)}`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(found);
    setCouponError("");
    toast.success(`Cupom "${found.code}" aplicado! ${found.label}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Cross-sell: products not in cart, different categories
  const cartCategoryIds = [...new Set(items.map((i) => i.product.category))];
  const crossSellProducts = products
    .filter((p) => !items.some((i) => i.product.id === p.id) && !cartCategoryIds.includes(p.category) && p.available)
    .slice(0, 3);

  // Upsell: products in same categories but not in cart
  const upsellProducts = products
    .filter((p) => !items.some((i) => i.product.id === p.id) && cartCategoryIds.includes(p.category) && p.available)
    .slice(0, 3);

  const suggestions = [...upsellProducts, ...crossSellProducts].slice(0, 4);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const validateStep1 = () => {
    if (!form.name.trim() || form.name.trim().length < 3) {
      toast.error("Informe seu nome completo");
      return false;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      toast.error("Informe um telefone válido");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (deliveryMethod === "delivery") {
      if (!form.address.trim()) {
        toast.error("Informe o endereço de entrega");
        return false;
      }
      if (!form.number.trim()) {
        toast.error("Informe o número");
        return false;
      }
      if (!form.neighborhood.trim()) {
        toast.error("Informe o bairro");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    toast.success("Pedido realizado com sucesso!");
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-display font-bold text-foreground">Sua sacola está vazia</h1>
        <p className="text-sm text-muted-foreground mt-2">Adicione itens antes de finalizar o pedido.</p>
        <Button className="mt-6" onClick={() => navigate("/")}>
          Voltar ao cardápio
        </Button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
          <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-4" />
        </motion.div>
        <h1 className="text-2xl font-display font-bold text-foreground">Pedido confirmado!</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Seu pedido foi recebido e está sendo preparado. Você receberá atualizações pelo WhatsApp.
        </p>
        <div className="mt-6 p-4 bg-card rounded-xl border border-border text-left w-full max-w-sm">
          <p className="text-xs text-muted-foreground">Resumo</p>
          <p className="text-sm font-semibold text-foreground mt-1">{itemCount} itens • {formatCurrency(grandTotal)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {deliveryMethod === "delivery" ? "Entrega em" : "Retirada em"} ~30-45 min
          </p>
        </div>
        <Button className="mt-6" onClick={() => { clearCart(); navigate("/"); }}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  const stepLabels = ["Dados", deliveryMethod === "delivery" ? "Entrega" : "Retirada", "Pagamento"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => (step === 1 ? navigate(-1) : setStep((s) => (s - 1) as 1 | 2 | 3))} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-display font-bold text-foreground">Finalizar pedido</h1>
        </div>

        {/* Step indicator */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
                <p className={`text-[10px] mt-1 ${s <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {stepLabels[s - 1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-32">
        <AnimatePresence mode="wait">
          {/* Step 1: Personal data */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">Seus dados</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Precisamos dos seus dados para o pedido</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-xs">Nome completo *</Label>
                  <Input id="name" placeholder="Maria Silva" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">WhatsApp *</Label>
                  <Input id="phone" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => updateField("phone", formatPhone(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cpf" className="text-xs">CPF (opcional)</Label>
                  <Input id="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => updateField("cpf", formatCPF(e.target.value))} className="mt-1" />
                </div>
              </div>

              {/* Delivery method */}
              <div className="pt-2">
                <p className="text-sm font-semibold text-foreground mb-2">Como deseja receber?</p>
                <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as DeliveryMethod)} className="grid grid-cols-2 gap-2">
                  <Label htmlFor="delivery" className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${deliveryMethod === "delivery" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                    <RadioGroupItem value="delivery" id="delivery" />
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Entrega</p>
                      <p className="text-[10px] text-muted-foreground">{formatCurrency(8)}</p>
                    </div>
                  </Label>
                  <Label htmlFor="pickup" className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${deliveryMethod === "pickup" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Store className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Retirada</p>
                      <p className="text-[10px] text-muted-foreground">Grátis</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              {/* Upsell / Cross-sell */}
              {suggestions.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-4 w-4 text-caramel" />
                    <p className="text-sm font-semibold text-foreground">Aproveite e adicione</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {suggestions.map((product) => {
                      const price = product.promoPrice ?? product.price;
                      return (
                        <Card key={product.id} className="shrink-0 w-36 border-border/50 overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-full h-20 object-cover" />
                          <CardContent className="p-2">
                            <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs font-bold text-foreground">{formatCurrency(price)}</span>
                              <button
                                onClick={() => addItem(product, 1)}
                                className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            {product.badge && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 mt-1">{product.badge}</Badge>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Address / Pickup */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {deliveryMethod === "delivery" ? (
                <>
                  <div>
                    <h2 className="text-lg font-display font-bold text-foreground">Endereço de entrega</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Informe onde devemos entregar</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="address" className="text-xs">Rua *</Label>
                      <Input id="address" placeholder="Rua das Flores" value={form.address} onChange={(e) => updateField("address", e.target.value)} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="number" className="text-xs">Nº *</Label>
                        <Input id="number" placeholder="123" value={form.number} onChange={(e) => updateField("number", e.target.value)} className="mt-1" />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="complement" className="text-xs">Complemento</Label>
                        <Input id="complement" placeholder="Apto 4B" value={form.complement} onChange={(e) => updateField("complement", e.target.value)} className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="neighborhood" className="text-xs">Bairro *</Label>
                        <Input id="neighborhood" placeholder="Centro" value={form.neighborhood} onChange={(e) => updateField("neighborhood", e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-xs">Cidade</Label>
                        <Input id="city" placeholder="São Paulo" value={form.city} onChange={(e) => updateField("city", e.target.value)} className="mt-1" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-lg font-display font-bold text-foreground">Retirada na loja</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Retire seu pedido no endereço abaixo</p>
                  </div>
                  <Card className="border-border/50">
                    <CardContent className="p-4 flex gap-3">
                      <Store className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Doce Encanto Confeitaria</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Rua dos Doces, 42 — Centro</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Previsão: 30-45 min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <div>
                <Label htmlFor="notes" className="text-xs">Observações do pedido</Label>
                <Textarea
                  id="notes"
                  placeholder="Ex: sem glúten, alergia a nozes, etc."
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="mt-1 min-h-[70px]"
                  maxLength={300}
                />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{form.notes.length}/300</p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">Pagamento</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Escolha como deseja pagar</p>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="space-y-2">
                {[
                  { value: "pix" as const, icon: QrCode, label: "Pix", desc: "Aprovação instantânea" },
                  { value: "card" as const, icon: CreditCard, label: "Cartão na entrega", desc: "Débito ou crédito" },
                  { value: "cash" as const, icon: Banknote, label: "Dinheiro", desc: "Informe o troco" },
                ].map((opt) => (
                  <Label
                    key={opt.value}
                    htmlFor={`pay-${opt.value}`}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === opt.value ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} />
                    <opt.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>

              {paymentMethod === "cash" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <Label htmlFor="changeFor" className="text-xs">Troco para</Label>
                  <Input id="changeFor" placeholder="R$ 50,00" value={form.changeFor} onChange={(e) => updateField("changeFor", e.target.value)} className="mt-1" />
                </motion.div>
              )}

              {/* Coupon */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Cupom de desconto</p>
                </div>
                {appliedCoupon ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-muted-foreground">{appliedCoupon.label} • -{formatCurrency(discount)}</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveCoupon} className="p-1 hover:bg-muted rounded-lg transition-colors">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </motion.div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o cupom"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                        className="flex-1 uppercase"
                        maxLength={20}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      />
                      <Button variant="outline" size="default" onClick={handleApplyCoupon} className="shrink-0">
                        Aplicar
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Order summary */}
              <Separator />
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Resumo do pedido</p>
                <div className="space-y-2">
                  {items.map((item) => {
                    const price = item.product.promoPrice ?? item.product.price;
                    return (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-muted-foreground">{item.quantity}x</span>
                          <span className="text-sm text-foreground truncate">{item.product.name}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground shrink-0">{formatCurrency(price * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrega</span>
                    <span className={deliveryFee === 0 ? "text-primary font-medium" : "text-foreground"}>
                      {deliveryFee === 0 ? "Grátis" : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary">Desconto</span>
                      <span className="text-primary font-medium">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-border">
                    <span className="text-sm font-bold text-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border p-4 z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(grandTotal)}</p>
          </div>
          {step < 3 ? (
            <Button variant="hero" size="lg" onClick={handleNext} className="shrink-0">
              Continuar
            </Button>
          ) : (
            <Button variant="hero" size="lg" onClick={handlePlaceOrder} className="shrink-0">
              Confirmar pedido
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
