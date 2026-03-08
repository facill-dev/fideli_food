

## Plano: Sistema de dados salvos com localStorage + busca por WhatsApp/CPF

Como o projeto ainda não tem Supabase conectado, vou implementar a **Fase 1 com localStorage** agora, e deixar a estrutura preparada para a Fase 2 (busca por banco) quando o Supabase for conectado.

### Como vai funcionar

1. **Após o primeiro pedido**, os dados pessoais e de endereço do cliente são salvos no `localStorage` do navegador.
2. **Na próxima visita**, o checkout já vem preenchido automaticamente com os dados salvos.
3. **Tela de identificação rápida**: Antes do Step 1, aparece uma mini-tela perguntando "Já pediu antes?" com opção de digitar WhatsApp ou CPF para buscar os dados (por enquanto busca no localStorage, futuramente no Supabase).
4. O cliente pode editar os dados a qualquer momento e eles são atualizados no storage.

### Alterações

**1. Criar `src/lib/customerStorage.ts`**
- Interface `SavedCustomerData` com campos: name, phone, cpf, address, number, complement, neighborhood, city
- Funções: `saveCustomerData(data)`, `getCustomerData()`, `findCustomerByIdentifier(phoneOrCpf)` — todas usando localStorage
- Chave: `doce_encanto_customer`

**2. Atualizar `src/pages/Checkout.tsx`**
- Ao montar o componente, carregar dados do localStorage e pré-preencher o formulário
- Adicionar um **Step 0 (identificação)** antes do Step 1:
  - Input para WhatsApp ou CPF com botão "Buscar"
  - Botão "Sou novo aqui" para pular direto
  - Se encontrar dados, preenche e vai para Step 1 já preenchido
- Ao confirmar o pedido (`handlePlaceOrder`), salvar os dados no localStorage
- Ajustar a barra de steps para mostrar 4 etapas quando no step 0, ou manter 3 etapas e tratar o step 0 como uma tela de "pré-checkout"

### Experiência do usuário

```text
┌─────────────────────────────┐
│  Já pediu com a gente?      │
│                             │
│  [WhatsApp ou CPF________]  │
│  [Buscar meus dados]        │
│                             │
│  ou                         │
│  [Sou novo aqui →]          │
└─────────────────────────────┘
       ↓ encontrou dados
┌─────────────────────────────┐
│  Step 1: Dados (preenchido) │
│  Nome: Maria Silva    ✓     │
│  WhatsApp: (11)...   ✓     │
│  ...                        │
└─────────────────────────────┘
```

