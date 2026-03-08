

## Plano: P1 + P2 + P3

Implementar **Acompanhamento de Pedido**, **Notificações Reais no Admin** e **Botão WhatsApp automático**.

---

### 1. Página de Acompanhamento do Pedido (P1)

**Rota:** `/pedido/:orderId` (pública)

**Arquivos:**
- `src/pages/OrderTracking.tsx` (novo)
- `src/App.tsx` (adicionar rota)
- `src/lib/multiTenantStorage.ts` (adicionar `getOrderById`)

**Funcionalidades:**
- Timeline visual com 5 estados: Pendente → Confirmado → Preparando → Pronto → Entregue
- Exibe nome do cliente, itens, total, data do pedido
- Badge "Cancelado" se for o caso
- Mostra nome da loja com ícone do nicho
- Design responsivo com animações Framer Motion

---

### 2. Notificações Reais no Admin (P2)

**Arquivos:**
- `src/lib/multiTenantStorage.ts` (adicionar `TenantNotification`, funções CRUD)
- `src/components/admin/NotificationPopover.tsx` (novo)
- `src/components/admin/AdminLayout.tsx` (substituir sino por popover)
- `src/pages/admin/Orders.tsx` (criar notificação ao mudar status)

**Modelo de notificação:**
```typescript
interface TenantNotification {
  id: string;
  storeId: string;
  type: "new_order" | "status_change";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  orderId?: string;
}
```

**Funcionalidades:**
- Badge com contagem de não-lidas (substitui o dot fixo)
- Popover ao clicar no sino com lista de notificações
- Marcar como lida ao clicar
- Marcar todas como lidas

---

### 3. Botão WhatsApp Automático (P3)

**Onde:** Página de acompanhamento do pedido + Dialog de pedido no admin

**Formato do link:**
```
wa.me/5511999999999?text=Olá! Meu pedido #ABC123...
```

**Funcionalidades:**
- Gera link `wa.me` com telefone da loja
- Mensagem pré-formatada com: número do pedido, itens, total
- Botão verde com ícone WhatsApp
- No admin: botão para lojista iniciar conversa com cliente

---

### Detalhes Técnicos

**Storage (multiTenantStorage.ts):**
```typescript
// Novo
getOrderById(orderId: string): TenantOrder | undefined
getNotificationsByStore(storeId: string): TenantNotification[]
addNotification(notification: Omit<TenantNotification, "id" | "createdAt">): TenantNotification
markNotificationRead(notificationId: string): void
markAllNotificationsRead(storeId: string): void
getUnreadNotificationCount(storeId: string): number
```

**Rota no App.tsx:**
```tsx
<Route path="/pedido/:orderId" element={<OrderTracking />} />
```

**WhatsApp utility:**
```typescript
function generateWhatsAppLink(phone: string, orderSummary: string): string {
  const clean = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(orderSummary);
  return `https://wa.me/55${clean}?text=${encoded}`;
}
```

---

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/multiTenantStorage.ts` | Adicionar notificações + getOrderById |
| `src/pages/OrderTracking.tsx` | Criar página de tracking |
| `src/components/admin/NotificationPopover.tsx` | Criar popover de notificações |
| `src/components/admin/AdminLayout.tsx` | Integrar NotificationPopover |
| `src/pages/admin/Orders.tsx` | Adicionar botão WhatsApp + criar notificação |
| `src/App.tsx` | Adicionar rota /pedido/:orderId |

