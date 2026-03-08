

## Entendi! Aqui está o resumo do que você precisa:

Transformar o projeto atual (loja única "Festival de Fatias") em uma **plataforma SaaS multi-tenant de cardápio digital**, onde qualquer pessoa pode se cadastrar e criar sua própria loja personalizada — igual ao iFood, mas focado em cardápio digital.

### O que muda

**Hoje:** Uma loja fixa com dados hardcoded (nome, produtos, categorias, cores).

**Futuro:** Plataforma onde N lojistas se cadastram, cada um com sua loja independente.

### Funcionalidades necessárias

1. **Autenticação de lojistas** — Cadastro/login para donos de loja
2. **Onboarding da loja** — Ao se cadastrar, o lojista configura: nome da loja, nicho (confeitaria, hamburgueria, pizzaria, etc.), logo, cores, endereço, horário de funcionamento
3. **Painel admin por loja** — O admin atual passa a ser isolado por tenant (cada lojista só vê seus próprios produtos, pedidos, clientes)
4. **Loja pública por slug** — Cada loja tem sua URL tipo `/loja/minha-confeitaria` com o template atual adaptado dinamicamente (nome, logo, produtos, cores do tenant)
5. **Banco de dados multi-tenant** — Todas as tabelas (products, orders, categories, customers) ganham um `store_id` para isolar os dados. RLS garante que cada lojista só acessa o próprio dado
6. **Landing page da plataforma** — A `/` deixa de ser a loja e vira uma página de apresentação do SaaS ("Crie seu cardápio digital")

### Pré-requisito obrigatório

**Conectar o Lovable Cloud (Supabase)** — Sem banco de dados, nada disso funciona. Precisamos de:
- Tabelas: `stores`, `products`, `categories`, `orders`, `customers`, `user_roles`
- Auth do Supabase para login dos lojistas
- RLS com `store_id` em todas as tabelas
- Storage para logos e imagens de produtos

### Ordem de implementação sugerida

| Fase | O que |
|------|-------|
| **1** | Conectar Lovable Cloud + criar schema do banco (stores, products, etc.) |
| **2** | Auth (cadastro/login de lojistas) + onboarding (criar loja) |
| **3** | Painel admin multi-tenant (produtos, pedidos, config da loja) |
| **4** | Loja pública dinâmica por slug (`/loja/:slug`) |
| **5** | Landing page do SaaS + checkout adaptado por loja |

### Detalhes técnicos

- **Isolamento**: Toda query filtra por `store_id`. RLS policies usam uma função `get_user_store_id(auth.uid())` para evitar recursão.
- **Roteamento**: `/loja/:slug` carrega dados da loja dinamicamente. `/admin` verifica o `store_id` do usuário logado.
- **Template**: Os componentes atuais (Header, Hero, MenuSection, Footer) recebem os dados da loja como props em vez de hardcoded.

### Próximo passo

Antes de codar qualquer coisa, precisamos **conectar o Lovable Cloud**. Quer que eu faça isso agora?

