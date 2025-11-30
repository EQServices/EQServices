# 💳 Guia: Testar Fluxo de Pagamentos Completo

## 📋 Objetivo

Testar todo o fluxo de compra de créditos via Stripe para garantir que funciona corretamente em produção.

---

## 🧪 Checklist de Testes

### 1. Modo Teste (Stripe Test Mode)

#### ✅ Teste Básico - Compra Bem-Sucedida

1. **Acesse a aplicação** (web ou mobile)
2. **Faça login como profissional**
3. **Vá em "Comprar Créditos"**
4. **Selecione um pacote** (ex: 50 créditos)
5. **Clique em "Comprar"**
6. **Use cartão de teste**: `4242 4242 4242 4242`
   - **CVV**: Qualquer 3 dígitos (ex: 123)
   - **Data**: Qualquer data futura (ex: 12/25)
   - **CEP**: Qualquer (ex: 12345)
7. **Complete o checkout**
8. **Verifique**:
   - ✅ Redirecionamento para página de sucesso
   - ✅ Créditos adicionados à conta
   - ✅ Transação registrada no histórico
   - ✅ Webhook processado (verificar logs do Supabase)

#### ⚠️ Teste de Erro - Cartão Recusado

1. **Repita o processo acima**
2. **Use cartão de teste**: `4000 0000 0000 0002`
3. **Verifique**:
   - ✅ Mensagem de erro exibida
   - ✅ Usuário pode tentar novamente
   - ✅ Nenhum crédito foi adicionado

#### ⚠️ Teste de Cancelamento

1. **Inicie o processo de compra**
2. **Clique em "Cancelar" ou feche a janela**
3. **Verifique**:
   - ✅ Redirecionamento para página de cancelamento
   - ✅ Nenhum crédito foi adicionado
   - ✅ Nenhuma transação foi registrada

### 2. Verificar Webhook

#### ✅ Verificar Logs do Supabase

1. **Acesse**: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/logs/edge-functions
2. **Procure por**: `stripe-webhook`
3. **Verifique**:
   - ✅ Webhook recebido com sucesso
   - ✅ Assinatura validada
   - ✅ Créditos adicionados
   - ✅ Transação registrada

#### ✅ Verificar Banco de Dados

1. **Acesse**: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/editor
2. **Verifique tabelas**:
   - `credit_purchases` - Deve ter registro da compra
   - `credit_transactions` - Deve ter transação registrada
   - `professionals` - Créditos devem estar atualizados

### 3. Modo Produção (Quando Pronto)

⚠️ **ATENÇÃO**: Use valores mínimos para testes em produção!

1. **Certifique-se de estar em modo Live no Stripe**
2. **Use cartão real** (ou cartão de teste Stripe em modo live)
3. **Teste com valor mínimo** (ex: pacote mais barato)
4. **Verifique tudo novamente**

---

## 🎯 Cartões de Teste Stripe

### Sucesso
- **Número**: `4242 4242 4242 4242`
- **CVV**: Qualquer 3 dígitos
- **Data**: Qualquer data futura

### Recusado
- **Número**: `4000 0000 0000 0002`
- **CVV**: Qualquer 3 dígitos
- **Data**: Qualquer data futura

### Requer Autenticação (3D Secure)
- **Número**: `4000 0025 0000 3155`
- **CVV**: Qualquer 3 dígitos
- **Data**: Qualquer data futura

---

## 📊 Checklist Completo

### Antes do Teste
- [ ] Aplicação rodando (web ou mobile)
- [ ] Conta de profissional criada
- [ ] Stripe em modo Test (ou Live se testando produção)
- [ ] Webhook configurado no Stripe Dashboard

### Durante o Teste
- [ ] Selecionar pacote de créditos
- [ ] Iniciar checkout
- [ ] Preencher dados do cartão
- [ ] Completar pagamento

### Após o Teste
- [ ] Verificar créditos adicionados
- [ ] Verificar transação no histórico
- [ ] Verificar registro em `credit_purchases`
- [ ] Verificar registro em `credit_transactions`
- [ ] Verificar logs do webhook

---

## 🔍 Troubleshooting

### Créditos não foram adicionados
1. Verifique logs do webhook no Supabase
2. Verifique se `STRIPE_WEBHOOK_SECRET` está correto
3. Verifique se o webhook está configurado no Stripe Dashboard
4. Verifique se o evento `checkout.session.completed` está selecionado

### Erro ao iniciar checkout
1. Verifique se `STRIPE_SECRET_KEY` está configurado no Supabase
2. Verifique se `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` está configurado no Netlify
3. Verifique URLs de sucesso/cancelamento

### Webhook não recebido
1. Verifique URL do webhook no Stripe Dashboard
2. Verifique se está apontando para: `https://qeswqwhccqfbdtmywzkz.functions.supabase.co/stripe-webhook`
3. Verifique logs do Supabase Edge Functions

---

## ✅ Critérios de Sucesso

- ✅ Checkout inicia sem erros
- ✅ Pagamento processa corretamente
- ✅ Redirecionamento funciona
- ✅ Créditos são adicionados automaticamente
- ✅ Transação é registrada
- ✅ Webhook processa corretamente
- ✅ Erros são tratados adequadamente

---

**Tempo estimado**: 2-3 horas (testes completos)

