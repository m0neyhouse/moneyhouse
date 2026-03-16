# Rules — Segurança

## Variáveis de Ambiente
- NUNCA exponha tokens, senhas ou chaves no código-fonte.
- Use `.env.local` para desenvolvimento local (nunca commitar — está no `.gitignore`).
- Prefixo `NEXT_PUBLIC_` apenas para variáveis que PODEM ser expostas ao cliente.
- Variáveis sem prefixo só ficam disponíveis no servidor (API routes, Server Components).

## Autenticação do Admin
- A rota `/admin` é protegida por senha via sessão JWT (HTTP-only cookie).
- A senha é comparada com hash bcrypt — nunca em plain text.
- Sessões expiram em 8 horas.
- Tentativas de login incorretas são limitadas (rate limiting).

## Links de Contrato
- Cada link é um UUID v4 único gerado no servidor — não é previsível.
- Links têm data de expiração configurável (padrão: 7 dias).
- Após assinatura, o link é marcado como `signed=true` e não pode ser reutilizado.
- Os dados do contrato (nome, valor) são armazenados no servidor — o link não contém dados sensíveis na URL.

## API Routes
- Todas as rotas `/api/admin/*` verificam a sessão antes de processar.
- Valide TODOS os inputs recebidos (tipo, tamanho, formato).
- Use `zod` para validação de schema.
- Retorne erros genéricos para o cliente (não exponha stack traces).
- Aplique rate limiting em endpoints críticos (login, criação de contrato).

## Headers de Segurança
Configure no `next.config.js`:
- `X-Frame-Options: DENY` — previne clickjacking
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` restrita
- `Strict-Transport-Security` em produção

## Assinatura Digital
- A imagem da assinatura (base64) é armazenada junto com:
  - Timestamp (ISO 8601) da assinatura
  - IP do cliente (para fins de registro)
  - User-Agent do navegador
- Nunca armazene a imagem da assinatura apenas no cliente.

## MercadoPago
- O Access Token fica APENAS no servidor (sem prefixo `NEXT_PUBLIC_`).
- A criação da preferência de pagamento é feita server-side (API route).
- Valide os webhooks recebidos usando a assinatura do MercadoPago.

## Sanitização
- Sanitize todos os inputs de texto antes de renderizar em HTML (use `DOMPurify` ou similar).
- Especialmente campos como nome do cliente que aparecem no contrato.
