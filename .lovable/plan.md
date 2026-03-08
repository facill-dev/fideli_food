

## Plano: Remover emojis restantes e melhorar contraste do botão de upload

### Problemas identificados

1. **Emoji `📷`** no botão "Escolher imagem" (linha 432) — substituir por ícone Lucide `Camera`.
2. **Emoji `📦`** no estado vazio de produtos (linha 211) — substituir por ícone Lucide `Package`.
3. **Botão de upload com contraste ruim** — o estilo atual (`border border-border bg-background`) fica escuro demais no tema dark. Vou refazer com estilo mais limpo: borda sutil, fundo levemente elevado, hover suave, e texto com contraste adequado.

### Alterações em `src/pages/admin/Products.tsx`

1. **Importar** `Camera` e `Package` de `lucide-react` (já importa outros ícones).

2. **Linha 211** — Trocar `<p className="text-4xl mb-3">📦</p>` por `<Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />`.

3. **Linhas 431-432** — Refazer o label do botão de upload:
   - Remover emoji `📷`, usar `<Camera className="h-4 w-4" />`.
   - Melhorar classes: `border-dashed border-2 border-muted-foreground/30 bg-muted/50 text-foreground hover:bg-muted hover:border-muted-foreground/50` — borda tracejada suave, fundo neutro, bom contraste em ambos os temas.

### Resultado esperado

Botão de upload limpo, com ícone vetorial, borda tracejada sutil, texto legível em light e dark mode. Estado vazio com ícone consistente com o resto do admin.

