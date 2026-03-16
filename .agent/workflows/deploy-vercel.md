---
description: Como fazer deploy do projeto no Vercel
---

// turbo-all

## Deploy no Vercel

1. Certifique-se de que o projeto está linkado ao repositório Git (GitHub/GitLab).

2. Instale a CLI do Vercel se ainda não tiver:
```
npm install -g vercel
```

3. Na raiz do projeto, faça login:
```
vercel login
```

4. Configure as variáveis de ambiente no Vercel Dashboard:
   - `ADMIN_PASSWORD` — senha do painel admin
   - `MERCADOPAGO_ACCESS_TOKEN` — token de acesso da API do MercadoPago
   - `NEXTAUTH_SECRET` — string aleatória para JWT/sessão
   - `NEXT_PUBLIC_BASE_URL` — URL base do site (ex: https://seusite.vercel.app)

5. Para deploy de produção:
```
vercel --prod
```

6. Verifique os logs no dashboard: https://vercel.com/dashboard

## Notas
- O arquivo `.env.local` NUNCA deve ser commitado no Git (já está no `.gitignore`).
- Sempre use variáveis de ambiente para tokens e senhas.
- O deploy automático ocorre a cada push na branch `main`.
