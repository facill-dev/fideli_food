

## Plano: Substituir todos os emojis restantes por icones Lucide

### Alteracoes

**6 arquivos, 6 trocas simples:**

| Arquivo | Emoji | Lucide Icon | Contexto |
|---|---|---|---|
| `src/pages/admin/Dashboard.tsx` | `🚀` | `Rocket` | Estado vazio "Comece a montar" |
| `src/pages/admin/Orders.tsx` | `📋` | `ClipboardList` | Estado vazio "Nenhum pedido" |
| `src/pages/admin/Products.tsx` | `✕` | `X` | Botao fechar input de categoria |
| `src/pages/Landing.tsx` | `✨` | `Sparkles` | Badge "Gratis para comecar" |
| `src/pages/Onboarding.tsx` | `🎉` | Remover emoji do texto | Toast de sucesso |
| `src/pages/Checkout.tsx` | `🎉` | Remover emoji do texto | Toast de boas-vindas |

### Detalhes tecnicos

- Dashboard e Orders: trocar `<p className="text-4xl mb-3">emoji</p>` por `<IconName className="h-10 w-10 text-muted-foreground mx-auto mb-3" />` (mesmo padrao usado em Products e Coupons).
- Products: trocar texto `✕` dentro do `<Button>` por `<X className="h-4 w-4" />`.
- Landing: trocar `✨` por `<Sparkles className="h-4 w-4 inline" />`.
- Toasts: simplesmente remover o emoji da string, sem substituir por icone (toasts sao texto puro).

