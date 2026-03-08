

## Plano: Substituir emojis por ícones Lucide React

### O que muda

A constante `NICHES` em `multiTenantStorage.ts` hoje usa emojis (`"🎂"`, `"🍔"`, etc.). Vamos trocar o campo `icon` de `string` para o **nome** de um ícone Lucide, e criar um componente helper que renderiza o ícone correto.

### Mapeamento de nichos → ícones Lucide

| Nicho | Emoji atual | Ícone Lucide |
|---|---|---|
| Confeitaria | 🎂 | `Cake` |
| Hamburgueria | 🍔 | `Beef` |
| Pizzaria | 🍕 | `Pizza` |
| Restaurante | 🍽️ | `UtensilsCrossed` |
| Cafeteria | ☕ | `Coffee` |
| Sorveteria | 🍦 | `IceCreamCone` |
| Padaria | 🥐 | `Croissant` |
| Açaí & Sucos | 🫐 | `Cherry` |
| Culinária Japonesa | 🍣 | `Fish` |
| Outro | 🏪 | `Store` |

### Arquivos alterados

1. **`src/lib/multiTenantStorage.ts`** — Trocar o campo `icon` de emoji para nome do ícone Lucide (ex: `"Cake"`, `"Beef"`). Exportar um componente `NicheIcon` que recebe o nome e renderiza o `<LucideIcon>` correspondente.

2. **`src/components/admin/AdminSidebar.tsx`** — Onde mostra `{niche?.icon || "🏪"}`, usar `<NicheIcon>`.

3. **`src/pages/StoreFront.tsx`** — 3 pontos onde emojis aparecem → substituir por `<NicheIcon>`.

4. **`src/pages/Onboarding.tsx`** — Seleção de nicho: trocar `<span>{n.icon}</span>` por `<NicheIcon>`.

5. **`src/pages/Landing.tsx`** — Seção de nichos e showcase de lojas: trocar emojis por `<NicheIcon>`.

6. **`src/pages/admin/Settings.tsx`** — Exibição do nicho atual: trocar emoji por `<NicheIcon>`.

### Abordagem técnica

Criar um mapa `Record<string, LucideIcon>` e um componente simples:

```tsx
import { Cake, Beef, Pizza, ... } from "lucide-react";

const NICHE_ICONS: Record<string, React.ComponentType<any>> = {
  Cake, Beef, Pizza, UtensilsCrossed, Coffee, IceCreamCone, Croissant, Cherry, Fish, Store
};

export function NicheIcon({ name, ...props }) {
  const Icon = NICHE_ICONS[name] || Store;
  return <Icon {...props} />;
}
```

Todos os locais que hoje renderizam `niche?.icon` como texto passarão a usar `<NicheIcon name={niche?.icon} className="h-5 w-5" />`.

