# Rules — Modularização

## Princípios Gerais
- **Separação de responsabilidades**: cada arquivo/módulo tem uma única função.
- **Sem lógica de negócio em componentes de UI**: componentes só renderizam, a lógica fica em hooks ou serviços.
- **Reutilização**: antes de criar um novo componente, verifique se existe um similar.

## Estrutura de Pastas (Next.js)
```
src/
├── app/                  # Rotas (App Router do Next.js)
│   ├── admin/            # Painel admin (protegido)
│   ├── contrato/[id]/    # Página do contrato do cliente
│   ├── pagamento/        # Páginas de retorno do pagamento
│   └── api/              # API Routes (backend)
│       ├── auth/         # Autenticação admin
│       ├── contracts/    # CRUD de contratos
│       └── payments/     # Integração MercadoPago
├── components/           # Componentes reutilizáveis de UI
│   ├── ui/               # Elementos base (Button, Input, Modal...)
│   ├── contract/         # Componentes do contrato (SignaturePad, ContractView)
│   └── admin/            # Componentes do painel admin
├── lib/                  # Utilitários e integrações externas
│   ├── mercadopago.ts    # Cliente MercadoPago
│   ├── contracts.ts      # Lógica de contratos (gerar, validar)
│   └── auth.ts           # Lógica de autenticação
├── hooks/                # React hooks customizados
└── types/                # TypeScript types/interfaces
```

## Regras de Componentes
- Componentes em `components/ui/` devem ser genéricos e sem lógica de negócio.
- Componentes específicos de feature ficam em suas subpastas.
- Nomeie arquivos com PascalCase para componentes (ex: `SignaturePad.tsx`).
- Nomeie hooks com camelCase começando com `use` (ex: `useContract.ts`).

## API Routes
- Cada rota de API faz apenas uma coisa.
- Sempre valide os dados de entrada antes de processar.
- Retorne respostas padronizadas: `{ success: boolean, data?: any, error?: string }`.

## Imports
- Use imports absolutos com alias `@/` (configurado no `tsconfig.json`).
- Exemplo: `import { Button } from '@/components/ui/Button'`
