import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Package, Truck, XCircle, MessageCircle, Store, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrderById, getStoreById, type TenantOrder } from "@/lib/multiTenantStorage";

const STEPS: { status: TenantOrder["status"]; label: string; icon: React.ElementType }[] = [
  { status: "pending", label: "Pedido recebido", icon: Clock },
  { status: "confirmed", label: "Confirmado", icon: CheckCircle2 },
  { status: "preparing", label: "Em preparação", icon: Package },
  { status: "ready", label: "Pronto para retirada", icon: Store },
  { status: "delivered", label: "Entregue", icon: Truck },
];

const STATUS_ORDER = ["pending", "confirmed", "preparing", "ready", "delivered"] as const;

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function generateWhatsAppLink(phone: string, orderSummary: string): string {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/55${clean}?text=${encodeURIComponent(orderSummary)}`;
}

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = orderId ? getOrderById(orderId) : undefined;
  const store = order ? getStoreById(order.storeId) : undefined;

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="h-14 w-14 text-destructive mb-4" />
        <h1 className="text-xl font-display font-bold text-foreground">Pedido não encontrado</h1>
        <p className="text-muted-foreground text-sm mt-2 mb-6">O link pode estar incorreto ou o pedido foi removido.</p>
        <Button asChild variant="outline">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = isCancelled ? -1 : STATUS_ORDER.indexOf(order.status as typeof STATUS_ORDER[number]);

  const orderSummary = `Olá! Gostaria de saber o status do meu pedido #${order.id.slice(-6).toUpperCase()}.\n\nItens:\n${order.items.map((i) => `- ${i.qty}x ${i.name}`).join("\n")}\n\nTotal: ${formatCurrency(order.total)}`;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          {store && (
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <Link to={`/loja/${store.slug}`}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <div>
            <p className="text-xs text-muted-foreground">{store?.name ?? "Loja"}</p>
            <h1 className="font-display font-bold text-foreground text-sm sm:text-base">
              Pedido #{order.id.slice(-6).toUpperCase()}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Status badge */}
        {isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-semibold text-destructive text-sm">Pedido cancelado</p>
              <p className="text-xs text-muted-foreground">Entre em contato com a loja para mais informações.</p>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        {!isCancelled && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-display font-semibold text-foreground mb-5 text-sm">Status do pedido</h2>
            <div className="space-y-0">
              {STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                const active = i === currentStepIndex;
                const Icon = step.icon;
                const isLast = i === STEPS.length - 1;
                return (
                  <div key={step.status} className="flex items-start gap-3">
                    {/* Icon + line */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                        transition={{ duration: 0.4 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          done
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done ? <Icon className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </motion.div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 mt-0.5 transition-colors duration-300 ${i < currentStepIndex ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pt-1 pb-8">
                      <p className={`text-sm font-medium transition-colors ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      {active && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-primary mt-0.5"
                        >
                          Status atual
                        </motion.p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-display font-semibold text-foreground text-sm">Resumo do pedido</h2>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.qty}x {item.name}</span>
                <span className="font-medium text-foreground">{formatCurrency(item.qty * item.price)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleString("pt-BR")}
          </div>
        </div>

        {/* WhatsApp */}
        {store?.phone && (
          <Button
            asChild
            className="w-full bg-[hsl(142,72%,29%)] hover:bg-[hsl(142,72%,24%)] text-white gap-2"
            size="lg"
          >
            <a href={generateWhatsAppLink(store.phone, orderSummary)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Falar com a loja no WhatsApp
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
