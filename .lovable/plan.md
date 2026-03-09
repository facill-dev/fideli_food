

# Plano: Sistema de Fidelização Multi-Tenant (MVP)

## Escopo do MVP

Implementar fidelização segregada por loja com **pontos** e **cashback** independentes, carteira por cliente+loja, configuração por tenant, governança global, e integração no checkout e admin.

---

## Arquitetura de Dados (localStorage)

Novas chaves: `mt_loyalty_config`, `mt_loyalty_wallets`, `mt_loyalty_movements`, `mt_loyalty_global`, `mt_loyalty_campaigns`

### Interfaces principais

```typescript
// Configuração global da plataforma (super admin)
interface LoyaltyGlobalConfig {
  enabled: boolean;
  pointsEnabled: boolean;
  cashbackEnabled: boolean;
  allowTenantCustomization: boolean;
  allowManualAdjustments: boolean;
  allowCombineWithCoupon: boolean;
  maxPointsPerReal: number;        // ex: 10
  maxCashbackPercent: number;      // ex: 15
  maxCashbackPerOrder: number;     // ex: 50
  maxDiscountPercentPerOrder: number; // ex: 30
  defaultExpirationDays: number;   // ex: 90
  releaseOn: "delivered" | "confirmed"; // marco de liberação padrão
}

// Configuração por loja
interface LoyaltyStoreConfig {
  storeId: string;
  enabled: boolean;
  programName: string;
  programDescription: string;
  // Pontos
  pointsEnabled: boolean;
  pointsPerReal: number;          // ex: 5 pontos por R$1
  pointsRedemptionRate: number;   // ex: 100 pontos = R$10
  minOrderForPoints: number;
  maxPointsPerOrder: number;
  pointsExpirationDays: number;   // 0 = sem expiração
  // Cashback
  cashbackEnabled: boolean;
  cashbackPercent: number;
  minOrderForCashback: number;
  maxCashbackPerOrder: number;
  cashbackExpirationDays: number;
  // Uso
  minPointsToRedeem: number;
  maxDiscountPercentPerOrder: number;
  allowCombinePointsAndCashback: boolean;
  allowCombineWithCoupon: boolean;
  releaseOn: "delivered" | "confirmed";
}

// Carteira do cliente por loja
interface LoyaltyWallet {
  id: string;
  storeId: string;
  customerId: string;          // phone ou cpf
  customerName: string;
  pointsBalance: number;
  pointsPending: number;
  cashbackBalance: number;     // em reais
  cashbackPending: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalPointsExpired: number;
  totalCashbackEarned: number;
  totalCashbackUsed: number;
  totalCashbackExpired: number;
  lastMovementAt: string;
}

// Movimentação
interface LoyaltyMovement {
  id: string;
  storeId: string;
  walletId: string;
  customerId: string;
  type: "points" | "cashback";
  action: "credit_pending" | "credit_released" | "debit_redeem" 
       | "debit_expiration" | "debit_reversal" 
       | "manual_credit" | "manual_debit";
  amount: number;
  balanceAfter: number;
  orderId?: string;
  campaignId?: string;
  reason?: string;
  performedBy?: string;        // "system" ou userId
  createdAt: string;
}

// Campanha
interface LoyaltyCampaign {
  id: string;
  storeId: string;
  name: string;
  description: string;
  type: "points_multiplier" | "cashback_bonus";
  multiplier?: number;         // ex: 2 = pontos dobrados
  bonusPercent?: number;       // ex: 5 = +5% cashback
  startDate: string;
  endDate: string;
  active: boolean;
  minOrder: number;
}
```

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/loyaltyStorage.ts` | Data layer completo: config global, config loja, wallets, movements, campaigns, motor de cálculo |
| `src/pages/admin/Loyalty.tsx` | Página admin: config do programa, dashboard, campanhas, clientes fidelizados, ajustes manuais (tabs) |
| `src/pages/superadmin/SALoyalty.tsx` | Governança global: config plataforma, dashboard consolidado, painel por tenant |

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/App.tsx` | Rotas `/admin/fidelizacao` e `/superadmin/fidelizacao` |
| `src/components/admin/AdminSidebar.tsx` | Link "Fidelização" com ícone `Heart` |
| `src/components/superadmin/SuperAdminSidebar.tsx` | Link "Fidelização" |
| `src/pages/StoreFront.tsx` | Exibir saldo do cliente na loja + info do programa |
| `src/pages/Checkout.tsx` | Aplicar pontos/cashback + preview de ganhos |
| `src/pages/admin/Orders.tsx` | Ao mudar status para "delivered", liberar benefícios pendentes |
| `src/pages/admin/Dashboard.tsx` | KPI card de fidelização |

---

## Detalhamento por Bloco

### 1. Storage Layer (`loyaltyStorage.ts`)

**Config global:** `getGlobalConfig()`, `updateGlobalConfig()` com defaults sensatos.

**Config loja:** `getStoreConfig(storeId)`, `updateStoreConfig(storeId, data)` — valida contra limites globais.

**Wallets:** `getWallet(storeId, customerId)`, `getOrCreateWallet(storeId, customerId, name)`, `getWalletsByStore(storeId)`, `getWalletsByCustomer(customerId)`.

**Motor de cálculo:**
- `calculateEarnings(storeId, orderTotal)` → retorna `{ points, cashback }` previstos
- `creditPending(storeId, customerId, orderId, orderTotal)` → registra créditos pendentes
- `releasePending(orderId)` → libera pendentes quando pedido entregue
- `redeemPoints(walletId, points)` → debita pontos, retorna desconto
- `redeemCashback(walletId, amount)` → debita cashback
- `reverseBenefits(orderId)` → reverte em cancelamento
- `processExpirations()` → varre e expira saldos vencidos
- `manualAdjust(walletId, type, action, amount, reason, performedBy)`

**Campanhas:** `getCampaigns(storeId)`, `addCampaign()`, `updateCampaign()`, `getActiveCampaign(storeId)` — aplica multiplicador no motor.

**Movements:** `getMovements(walletId)`, `getMovementsByStore(storeId)`.

### 2. Admin Fidelização (`Loyalty.tsx`)

4 tabs:
- **Dashboard**: KPIs (clientes ativos, pontos emitidos/resgatados/expirados, cashback emitido/usado/expirado, passivo atual, taxa de recompra)
- **Configuração**: Toggles e campos do programa (nome, pontos/cashback, taxas, validade, limites de uso), com validação contra limites globais
- **Campanhas**: CRUD de campanhas (pontos dobrados, cashback extra) com período e status
- **Clientes**: Lista de wallets da loja (saldo, último uso), busca, ajuste manual com motivo obrigatório + histórico de movimentações

### 3. Super Admin Fidelização (`SALoyalty.tsx`)

3 tabs:
- **Dashboard**: KPIs consolidados (tenants com programa ativo, total pontos/cashback emitidos, passivo total, top lojas por recompra)
- **Governança Global**: Toggles e limites máximos da plataforma
- **Por Tenant**: Lista de lojas com status do programa, passivo, permitir habilitar/desabilitar

### 4. Integração no Checkout

No `Checkout.tsx`, após identificação do cliente (phone/cpf):
- Buscar wallet daquela loja
- Mostrar card "Seus benefícios nesta loja" (pontos disponíveis, cashback disponível)
- Toggle para usar pontos (com slider de quanto usar, respeitando limites)
- Toggle para usar cashback (com slider)
- Validações: mínimo de pedido, máximo de desconto, combinações permitidas
- No resumo: linhas "Desconto por pontos", "Desconto por cashback"
- Preview: "Após este pedido você ganhará X pontos e R$ Y de cashback"
- Ao confirmar: `creditPending()` registra benefícios

### 5. Integração na StoreFront

Na header ou abaixo do hero da loja:
- Se o programa está ativo e o cliente tem wallet: banner "Você tem X pontos e R$ Y de cashback nesta loja"
- Se não tem wallet: "Esta loja tem programa de fidelização! Acumule pontos e cashback."
- Identificação do cliente por phone (input discreto ou lookup do localStorage)

### 6. Liberação de Benefícios (Orders.tsx)

Quando o lojista muda status para "delivered" ou "ready":
- Chamar `releasePending(orderId)` para liberar pontos/cashback pendentes
- Criar notificação "Benefícios liberados para [cliente]"

Quando cancela:
- Chamar `reverseBenefits(orderId)`

---

## Fluxo Completo

```text
Cliente compra R$100 na Loja A (5pts/R$1, 3% cashback)
  ↓
creditPending → 500pts pendentes + R$3 cashback pendente
  ↓
Lojista marca "Entregue" no admin
  ↓
releasePending → 500pts liberados + R$3 liberados
  ↓
Próxima compra: cliente vê "500 pontos | R$3 cashback"
  ↓
No checkout: usa 200pts (= R$20) + R$3 cashback = R$23 desconto
  ↓
Novo pedido R$77 líquido → gera novos benefícios
```

---

## Total estimado: ~3 arquivos novos + ~7 modificados

