---
description: Como configurar a integração com o MercadoPago
---

## Configuração do MercadoPago (Checkout Pro)

### 1. Obter credenciais
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Crie uma aplicação nova (ou use uma existente)
3. Copie o **Access Token** de produção
4. Para testes, use o **Access Token de Sandbox**

### 2. Configurar no projeto
Adicione no arquivo `.env.local` (nunca commitar):
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx
```
No Vercel Dashboard, adicione a mesma variável em: Settings > Environment Variables

### 3. Fluxo de pagamento
- O sistema cria uma preferência de pagamento via API (`/api/create-payment`)
- A API retorna um `init_point` (URL do checkout do MercadoPago)
- O cliente é redirecionado para esse link após assinar o contrato
- URLs de retorno configuradas:
  - `success_url`: `/pagamento/sucesso`
  - `failure_url`: `/pagamento/falha`
  - `pending_url`: `/pagamento/pendente`

### 4. Testando com Sandbox
Use as contas de teste do MercadoPago para simular pagamentos:
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/test-integration/test-user-accounts

### 5. Webhooks (opcional futuro)
Para receber notificações de pagamento confirmado, configure um webhook:
- Endpoint: `POST /api/webhooks/mercadopago`
- Configure no painel MercadoPago > Webhooks
