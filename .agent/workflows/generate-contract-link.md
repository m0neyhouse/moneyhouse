---
description: Como gerar um link de contrato para um cliente
---

## Gerar Link de Contrato (Fluxo Admin)

### Passo a passo
1. Acesse o painel admin: `https://seusite.vercel.app/admin`
2. Faça login com sua senha configurada em `ADMIN_PASSWORD`
3. Preencha os campos:
   - **Nome do cliente** (ex: João Silva)
   - **Serviço contratado** (ex: Criação de Site)
   - **Valor** (ex: 1500.00)
   - **Descrição do serviço** (opcional, aparece no contrato)
   - **Validade do link** (em dias, padrão: 7 dias)
4. Clique em **"Gerar Link"**
5. Copie o link gerado e envie pelo Instagram para o cliente

### O que o cliente verá
1. Abre o link
2. Lê o contrato com seus dados preenchidos automaticamente
3. Desenha a assinatura no campo de assinatura digital
4. Clica em **"Assinar e Pagar"**
5. É redirecionado para o checkout do MercadoPago com o valor correto

### Observações
- Links expiram após o prazo configurado
- Cada link é único e de uso único (após assinatura, não pode ser reassinado)
- O sistema registra data/hora da assinatura junto com a imagem da assinatura
