# 📋 Documentação Completa — CardápioDigital

> Plataforma multi-tenant de cardápio digital para estabelecimentos de alimentação.  
> Última atualização: Março 2026

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura Técnica](#arquitetura-técnica)
3. [Fluxo do Usuário (Lojista)](#fluxo-do-usuário-lojista)
4. [Vitrine Pública (StoreFront)](#vitrine-pública-storefront)
5. [Painel Administrativo (Admin)](#painel-administrativo-admin)
6. [Super Admin](#super-admin)
7. [Sistema de Notificações](#sistema-de-notificações)
8. [Acompanhamento de Pedido](#acompanhamento-de-pedido)
9. [Integração WhatsApp](#integração-whatsapp)
10. [Sistema de Cupons](#sistema-de-cupons)
11. [Checkout e Pagamento](#checkout-e-pagamento)
12. [Nichos Suportados](#nichos-suportados)
13. [Rotas da Aplicação](#rotas-da-aplicação)
14. [Estrutura de Dados](#estrutura-de-dados)
15. [Limitações Atuais e Roadmap](#limitações-atuais-e-roadmap)

---

## Visão Geral

O **CardápioDigital** é uma plataforma SaaS multi-tenant onde qualquer pessoa pode criar sua própria loja de delivery/cardápio digital em minutos. Cada loja recebe uma URL única (`/loja/:slug`) que pode ser compartilhada com clientes via WhatsApp, redes sociais ou QR code.

### Proposta de Valor
- **Para lojistas:** criar cardápio digital sem precisar de desenvolvedor, gerenciar pedidos, produtos e clientes em um só lugar.
- **Para clientes:** navegar pelo cardápio, adicionar produtos ao carrinho, fazer pedidos e acompanhar o status em tempo real.

### Stack Tecnológica
| Tecnologia | Uso |
|---|---|
| React 18 | Framework de UI |
| TypeScript | Tipagem estática |
| Vite | Build tool |
| Tailwind CSS | Estilização |
| shadcn/ui | Componentes de UI |
| Framer Motion | Animações |
| Recharts | Gráficos (Super Admin) |
| React Router DOM | Roteamento SPA |
| localStorage | Persistência de dados (demo) |

---

## Arquitetura Técnica

### Persistência (localStorage)

Toda a persistência roda em `localStorage` através do módulo `src/lib/multiTenantStorage.ts`. As chaves utilizadas são:

| Chave | Conteúdo |
|---|---|
| `mt_users` | Lista de usuários cadastrados |
| `mt_stores` | Lista de lojas criadas |
| `mt_products` | Lista de produtos de todas as lojas |
| `mt_categories` | Categorias de todas as lojas |
| `mt_orders` | Pedidos de todas as lojas |
| `mt_notifications` | Notificações do admin |
| `mt_current_user` | Sessão do usuário logado |

### Multi-tenancy

Cada entidade (produto, pedido, categoria, notificação) possui um campo `storeId` que a vincula a uma loja específica. As queries filtram sempre por `storeId`, garantindo isolamento entre lojas.

### Autenticação

- **Cadastro:** email + senha + nome → armazenado em `mt_users`
- **Login:** validação de email + senha no localStorage
- **Sessão:** usuário logado salvo em `mt_current_user`
- **Super Admin:** email fixo `admin@sistema.com` (verificado via `isSuperAdmin()`)

> ⚠️ Senhas são armazenadas em texto plano — apenas para fins de demo.

---

## Fluxo do Usuário (Lojista)

### 1. Cadastro (`/cadastro`)
1. Usuário preenche **nome**, **email** e **senha**
2. Sistema cria o registro em `mt_users`
3. Redireciona para `/onboarding`

### 2. Onboarding (`/onboarding`) — 3 etapas

**Etapa 1 — Escolha do Nicho:**
- Grid com 10 nichos disponíveis (veja [Nichos Suportados](#nichos-suportados))
- Cada nicho tem ícone e label
- Usuário clica para selecionar

**Etapa 2 — Informações Básicas:**
- Nome da loja (obrigatório, mín. 2 caracteres)
- Descrição
- Cor primária (color picker)

**Etapa 3 — Detalhes:**
- Endereço, cidade, telefone
- Horário de funcionamento (editor visual por dia da semana com toggle aberto/fechado)
- Instagram

Ao finalizar:
- `createStore()` cria a loja com slug automático (ex: `minha-confeitaria`)
- O `userId` é vinculado ao `storeId`
- Redireciona para `/admin`

### 3. Login (`/login`)
- Email + senha
- Se o usuário já tem loja → vai para `/admin`
- Se não tem loja → vai para `/onboarding`

---

## Vitrine Pública (StoreFront)

**Rota:** `/loja/:slug`

A vitrine é a página que o **cliente final** acessa. É pública e não requer login.

### Funcionalidades

| Recurso | Descrição |
|---|---|
| **Header** | Nome da loja + ícone do nicho + botão do carrinho com badge de quantidade |
| **Hero** | Banner com nome, avaliação (⭐), cidade, horário resumido e telefone |
| **Filtro por categoria** | Pills horizontais com scroll para filtrar produtos |
| **Grid de produtos** | Cards com imagem, nome, descrição, preço (e preço promocional se houver), badge, botão "Adicionar" |
| **Carrinho lateral** | Sheet (drawer) com lista de itens, controles +/-, botão remover, total e CTA "Finalizar pedido" |
| **Produto indisponível** | Botão "Adicionar" desabilitado com label "Indisponível" |

### Carrinho

O carrinho é **local** (state do componente, não persiste entre reloads). Funcionalidades:
- Adicionar produto (incrementa quantidade se já existe)
- Alterar quantidade (+/-)
- Remover item (qty chega a 0)
- Exibir total formatado em R$
- Badge no header com contagem total de itens

---

## Painel Administrativo (Admin)

**Rota base:** `/admin`  
**Acesso:** apenas usuários logados com loja vinculada.  
**Layout:** sidebar lateral (colapsável em mobile) + header com sino de notificações e botão logout.

### Dashboard (`/admin`)

Cards KPI exibindo:
- **Receita total** — soma dos totais de todos os pedidos
- **Total de pedidos** — contagem
- **Produtos cadastrados** — contagem
- **Ticket médio** — receita / pedidos

Inclui:
- Lista dos últimos pedidos com status colorido
- Atalhos rápidos: ver loja, adicionar produto
- Guia de "primeiros passos" se a loja não tem produtos ainda

### Pedidos (`/admin/pedidos`)

| Funcionalidade | Descrição |
|---|---|
| **Listagem** | Tabela com nome do cliente, telefone, total, status e data |
| **Busca** | Por nome ou telefone do cliente |
| **Filtro por status** | Dropdown: Todos, Pendente, Confirmado, Em preparação, Pronto, Entregue, Cancelado |
| **Detalhe do pedido** | Dialog com todos os itens, quantidades, preços e total |
| **Alterar status** | Botões para avançar o status do pedido (ex: Pendente → Confirmado → Preparando → Pronto → Entregue) |
| **Cancelar pedido** | Botão para marcar como cancelado |
| **WhatsApp** | Botão para abrir conversa com o cliente via `wa.me` com resumo do pedido pré-formatado |
| **Link de rastreamento** | Botão para copiar/abrir link público de acompanhamento (`/pedido/:orderId`) |
| **Notificações** | Ao mudar status, uma notificação é criada automaticamente no sistema |

**Status possíveis (pipeline):**
```
Pendente → Confirmado → Em preparação → Pronto → Entregue
                                                    ↘ Cancelado
```

### Produtos (`/admin/produtos`)

| Funcionalidade | Descrição |
|---|---|
| **Listagem** | Tabela com imagem, nome, categoria, preço, preço promo, badge, status de disponibilidade |
| **Busca** | Por nome do produto |
| **Filtro por categoria** | Dropdown com categorias da loja |
| **Criar produto** | Dialog com formulário completo |
| **Editar produto** | Dialog pré-preenchido |
| **Duplicar produto** | Clona todos os dados do produto |
| **Excluir produto** | Com confirmação (AlertDialog) |
| **Criar categoria** | Dialog simples com nome + imagem |

**Campos do produto:**
- Nome, descrição, preço, preço promocional (opcional)
- Imagem (URL), categoria
- Disponível (toggle), quantidade disponível
- Badge (ex: "Novo", "Mais vendido")
- Entrega e retirada (toggles)
- Tempo de preparo, avaliação

### Clientes (`/admin/clientes`)

- Extrai clientes únicos a partir dos pedidos (agrupa por telefone ou nome)
- Exibe: nome, telefone, total de pedidos, total gasto, último pedido
- Tabela com scroll horizontal em mobile

### Cupons (`/admin/cupons`)

| Funcionalidade | Descrição |
|---|---|
| **Listagem** | Tabela com código, tipo, valor, usos, status |
| **Criar cupom** | Dialog com: código, tipo (percentual/fixo), valor do desconto, mín. pedido, limite de usos, data de validade |
| **Editar cupom** | Dialog pré-preenchido |
| **Ativar/desativar** | Toggle de status |
| **Excluir cupom** | Com confirmação |
| **Relatórios** | Aba dedicada com métricas de uso dos cupons |

**Tipos de cupom:**
- `percentage` — desconto percentual (ex: 10%)
- `fixed` — valor fixo em R$ (ex: R$ 5,00)

### Eventos (`/admin/eventos`)

> ⚠️ **Placeholder** — página ainda não implementada. Exibe apenas "Em breve".

### Configurações (`/admin/configuracoes`)

| Campo | Descrição |
|---|---|
| Nome da loja | Editável |
| Descrição | Textarea |
| Endereço | Rua/número |
| Cidade | Texto |
| Telefone | Texto (usado no WhatsApp) |
| Horário de funcionamento | Editor visual por dia da semana (ScheduleEditor) |
| Instagram | @handle |
| Cor primária | Color picker |
| Link da loja | Exibe URL pública com botão copiar e botão abrir |

---

## Super Admin

**Rota base:** `/superadmin`  
**Acesso:** apenas o usuário com email `admin@sistema.com`

### Dashboard (`/superadmin`)
- KPIs globais: total de lojas, pedidos, usuários, receita total
- Gráfico de barras: pedidos por loja (Recharts)
- Gráfico de área: receita por loja
- Distribuição de lojas por nicho

### Lojas (`/superadmin/lojas`)
- Lista todas as lojas do sistema
- Exibe: nome, nicho, dono, slug, data de criação
- Ação: excluir loja (remove também produtos, categorias e pedidos associados)

### Pedidos (`/superadmin/pedidos`)
- Lista todos os pedidos de todas as lojas
- Filtro por status e busca por cliente
- Pode alterar status de qualquer pedido

### Usuários (`/superadmin/usuarios`)
- Lista todos os usuários cadastrados
- Exibe: nome, email, loja vinculada, data de criação
- Ação: excluir usuário (remove loja e todos os dados associados)

---

## Sistema de Notificações

### Como funciona

O sistema de notificações é **real** e funciona integrado ao fluxo de pedidos.

**Gatilhos automáticos:**
- Quando o status de um pedido é alterado no admin, uma `TenantNotification` é criada automaticamente com:
  - Tipo: `status_change`
  - Título: "Pedido atualizado"
  - Mensagem: "Pedido de [cliente] → [novo status]"
  - Referência ao `orderId`

**UI no Admin:**
- **Sino** no header com badge vermelho mostrando contagem de não-lidas
- **Popover** ao clicar no sino:
  - Lista de notificações ordenadas por data (mais recente primeiro)
  - Ícone diferenciado por tipo (novo pedido vs mudança de status)
  - Indicador visual de não-lida (fundo azulado + dot)
  - Timestamp relativo ("agora", "5min atrás", "2h atrás", "1d atrás")
  - Clicar na notificação marca como lida
  - Botão "Marcar todas" para limpar todas de uma vez

**Dados armazenados:**
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

---

## Acompanhamento de Pedido

**Rota:** `/pedido/:orderId`  
**Acesso:** público (qualquer pessoa com o link)

### Funcionalidades

- **Timeline visual** com 5 etapas animadas:
  1. 🟡 Pendente — pedido recebido
  2. 🔵 Confirmado — loja aceitou
  3. 🟣 Em preparação — sendo feito
  4. 🟢 Pronto — pronto para entrega/retirada
  5. ✅ Entregue — finalizado

- **Status cancelado:** exibe badge vermelho especial no topo, timeline fica cinza
- **Informações exibidas:**
  - Nome da loja com ícone do nicho
  - ID do pedido (últimos 6 caracteres em maiúsculo)
  - Nome do cliente
  - Data e hora do pedido
  - Lista de itens com quantidade e preço individual
  - Total do pedido

### Botão WhatsApp (cliente → loja)
- Botão verde "Falar com a loja" no rodapé da página
- Gera link `wa.me` com o telefone da loja
- Mensagem pré-formatada:
  ```
  Olá! Gostaria de informações sobre meu pedido #ABC123
  ```

### Como acessar
1. O lojista copia o link do pedido no admin (botão com ícone de link externo)
2. Envia ao cliente via WhatsApp ou outro canal
3. O cliente abre no navegador e vê o status atualizado

---

## Integração WhatsApp

O WhatsApp é integrado em dois pontos do sistema via links `wa.me`:

### 1. Admin → Cliente
**Onde:** página de pedidos, no dialog de detalhes do pedido  
**Botão:** ícone de mensagem (MessageCircle)

**Formato da mensagem:**
```
Olá [Nome]! Sobre seu pedido #[ID]:

• 2x Bolo de Chocolate
• 1x Torta de Morango

Total: R$ 85,00
```

**Link gerado:**
```
https://wa.me/5511999999999?text=Olá%20Maria!%20Sobre%20seu%20pedido...
```

### 2. Cliente → Loja
**Onde:** página de acompanhamento do pedido (`/pedido/:orderId`)  
**Botão:** "Falar com a loja" (verde, ícone WhatsApp)

**Formato da mensagem:**
```
Olá! Gostaria de informações sobre meu pedido #ABC123
```

### Lógica de geração
```typescript
function generateWhatsAppLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, ""); // remove não-numéricos
  return `https://wa.me/55${clean}?text=${encodeURIComponent(message)}`;
}
```
> O prefixo `55` (Brasil) é adicionado automaticamente.

---

## Sistema de Cupons

### Funcionalidades
- Criar cupons com código personalizado (ex: `DESCONTO10`)
- Dois tipos: percentual (`percentage`) ou valor fixo (`fixed`)
- Configurar valor mínimo do pedido para ativar
- Limite de usos totais
- Data de validade
- Ativar/desativar sem excluir
- Relatórios de uso

### Aplicação no Checkout
- Campo para digitar código do cupom
- Validação: ativo, dentro da validade, limite de usos, valor mínimo
- Desconto aplicado no total e exibido no resumo

---

## Checkout e Pagamento

**Rota:** `/checkout`

### Etapas do Checkout

**Etapa 0 — Identificação:**
- Busca cliente por WhatsApp ou CPF (auto-preenchimento)
- Opção de pular e preencher manualmente

**Etapa 1 — Dados Pessoais:**
- Nome, telefone, CPF
- Método de entrega: Delivery ou Retirada

**Etapa 2 — Endereço/Retirada:**
- Se delivery: endereço completo (rua, número, complemento, bairro, cidade)
- Se retirada: exibe informações do ponto de retirada
- Campo de observações

**Etapa 3 — Pagamento:**
- Métodos: PIX, Cartão, Dinheiro
- Se dinheiro: campo "troco para"
- Campo de cupom de desconto
- Resumo: subtotal, taxa de entrega, desconto, total

### Dados salvos
- Dados do cliente são persistidos em `localStorage` para auto-preenchimento futuro
- Pedido é criado via `createOrder()` (quando integrado)

---

## Nichos Suportados

| ID | Label | Ícone |
|---|---|---|
| `confeitaria` | Confeitaria | 🎂 Cake |
| `hamburgueria` | Hamburgueria | 🥩 Beef |
| `pizzaria` | Pizzaria | 🍕 Pizza |
| `restaurante` | Restaurante | 🍴 UtensilsCrossed |
| `cafeteria` | Cafeteria | ☕ Coffee |
| `sorveteria` | Sorveteria | 🍦 IceCreamCone |
| `padaria` | Padaria | 🥐 Croissant |
| `acai` | Açaí & Sucos | 🍒 Cherry |
| `japonesa` | Culinária Japonesa | 🐟 Fish |
| `outro` | Outro | 🏪 Store |

Cada nicho define o ícone exibido no header da loja, sidebar do admin e cards na landing page.

---

## Rotas da Aplicação

### Públicas
| Rota | Componente | Descrição |
|---|---|---|
| `/` | Landing | Página inicial com apresentação, features e lojas em destaque |
| `/login` | Auth | Tela de login |
| `/cadastro` | Auth | Tela de cadastro |
| `/onboarding` | Onboarding | Wizard de criação da loja (3 etapas) |
| `/loja/:slug` | StoreFront | Vitrine pública da loja |
| `/checkout` | Checkout | Finalização de pedido |
| `/pedido/:orderId` | OrderTracking | Acompanhamento público do pedido |

### Admin (autenticado + loja)
| Rota | Componente | Descrição |
|---|---|---|
| `/admin` | Dashboard | Visão geral com KPIs |
| `/admin/pedidos` | Orders | Gestão de pedidos |
| `/admin/produtos` | Products | CRUD de produtos e categorias |
| `/admin/clientes` | Customers | Lista de clientes derivada dos pedidos |
| `/admin/eventos` | Events | Em breve (placeholder) |
| `/admin/cupons` | Coupons | Gestão de cupons de desconto |
| `/admin/configuracoes` | Settings | Configurações da loja |

### Super Admin (`admin@sistema.com`)
| Rota | Componente | Descrição |
|---|---|---|
| `/superadmin` | SADashboard | KPIs globais + gráficos |
| `/superadmin/lojas` | SAStores | Gestão de todas as lojas |
| `/superadmin/pedidos` | SAOrders | Todos os pedidos do sistema |
| `/superadmin/usuarios` | SAUsers | Gestão de usuários |

---

## Estrutura de Dados

### StoreConfig
```typescript
{
  id: string;
  ownerId: string;        // ID do usuário dono
  name: string;
  slug: string;           // URL-friendly, único, gerado automaticamente
  niche: string;          // ID do nicho
  description: string;
  logo: string;
  primaryColor: string;   // hex (ex: "#d64d7a")
  address: string;
  city: string;
  phone: string;
  hours: string;          // JSON do WeekSchedule
  instagram: string;
  rating: number;         // padrão 5.0
  createdAt: string;      // ISO date
}
```

### TenantUser
```typescript
{
  id: string;
  email: string;
  password: string;       // ⚠️ plain text (demo)
  name: string;
  storeId?: string;       // vinculado após criar loja
  createdAt: string;
}
```

### TenantProduct
```typescript
{
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;    // preço promocional
  image: string;          // URL da imagem
  category: string;       // ID da categoria
  available: boolean;
  availableQty: number;
  badge?: string;         // ex: "Novo", "Promoção"
  delivery: boolean;
  pickup: boolean;
  rating?: number;
  prepTime?: string;      // ex: "30 min"
}
```

### TenantOrder
```typescript
{
  id: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    name: string;
    qty: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
}
```

### TenantNotification
```typescript
{
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

### Coupon
```typescript
{
  id: string;
  code: string;           // ex: "DESCONTO10"
  type: "percentage" | "fixed";
  value: number;          // 10 = 10% ou R$10
  minOrder: number;       // valor mínimo do pedido
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string;      // ISO date
}
```

---

## Limitações Atuais e Roadmap

### ⚠️ Limitações

| Item | Descrição |
|---|---|
| **Persistência** | Tudo roda em `localStorage` — os dados são perdidos ao limpar o navegador |
| **Senhas** | Armazenadas em texto plano (apenas demo) |
| **Super Admin** | Baseado em email fixo, sem sistema de roles real |
| **Fluxo de pedidos** | O carrinho da StoreFront não persiste o pedido via `createOrder()` — os pedidos no admin são manuais/mock |
| **Imagens** | Produtos usam URL de imagem — não há upload real |
| **Pagamento** | Não há integração com gateway de pagamento |
| **Eventos** | Página placeholder, sem CRUD implementado |
| **Tempo real** | Sem WebSocket/SSE — atualizações exigem refresh |

### 🚀 Roadmap Sugerido

| Prioridade | Feature | Descrição |
|---|---|---|
| **P0** | Corrigir fluxo de pedidos | Conectar carrinho da StoreFront ao `createOrder()` para pedidos aparecerem no admin |
| **P1** | Backend real | Migrar de localStorage para Supabase/banco de dados |
| **P2** | Upload de imagens | Storage para logos e fotos de produtos |
| **P3** | Eventos funcional | CRUD completo com exibição na vitrine |
| **P4** | Relatórios no admin | Gráficos Recharts no dashboard do lojista |
| **P5** | Taxa de entrega configurável | Campo nas Settings + aplicação no checkout |
| **P6** | Horário inteligente | Badge "Aberto/Fechado" + bloqueio de pedidos fora do horário |
| **P7** | Avaliações | Clientes avaliam pedidos, média exibida na loja |
| **P8** | Notificação push/som | Alerta sonoro e push notification para novos pedidos |
| **P9** | Multi-idioma | Suporte a inglês e espanhol |

---

## Como Usar o Sistema

### Criar uma loja (lojista)
1. Acesse `/cadastro` e crie sua conta
2. Complete o onboarding em 3 etapas (nicho, info, detalhes)
3. Acesse `/admin` para gerenciar sua loja
4. Adicione produtos em `/admin/produtos`
5. Copie o link da sua loja em `/admin/configuracoes`
6. Compartilhe com seus clientes!

### Fazer um pedido (cliente)
1. Acesse a URL da loja (ex: `/loja/minha-confeitaria`)
2. Navegue pelos produtos e adicione ao carrinho
3. Clique em "Finalizar pedido"
4. Preencha seus dados e escolha entrega/retirada
5. Confirme o pedido

### Gerenciar pedidos (lojista)
1. Acesse `/admin/pedidos`
2. Veja novos pedidos na lista
3. Clique no pedido para ver detalhes
4. Mude o status conforme o andamento
5. Use o botão WhatsApp para falar com o cliente
6. Copie o link de rastreamento e envie ao cliente

### Acompanhar pedido (cliente)
1. Receba o link de rastreamento do lojista
2. Abra no navegador
3. Veja a timeline com o status atualizado
4. Use "Falar com a loja" se precisar de ajuda

### Acessar o Super Admin
1. Faça login com `admin@sistema.com`
2. Acesse `/superadmin`
3. Visualize métricas globais, gerencie lojas e usuários
