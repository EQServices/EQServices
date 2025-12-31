# 🚀 Atualizar Valores dos Pacotes de Créditos

## ⚠️ Importante

Esta migration atualiza os valores dos pacotes de créditos no banco de dados.

## 📋 Valores Corretos

- **Pacote Inicial**: 20 créditos por €19 (5% de desconto)
- **Pacote Básico**: 50 créditos por €45 (10% de desconto)
- **Pacote Premium**: 100 créditos por €80 (20% de desconto)
- **Pay as you go**: 1 crédito por €1 (sem desconto)

## 📋 Passo a Passo

### Via Supabase Dashboard

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto: **Elastiqualyt's Project**

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New query**

3. **Cole o SQL da Migration**
   - Abra o arquivo: `supabase/migrations/20250127_update_credit_packages_values.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor

4. **Execute a Migration**
   - Clique em **Run** (ou pressione `Ctrl+Enter`)
   - Aguarde alguns segundos
   - Você deve ver: "Success. No rows returned"

5. **Verificar**
   - Vá em **Table Editor**
   - Selecione a tabela `credit_packages`
   - Verifique se os valores estão corretos:
     - Pacote Inicial: price = 19.00, discount = 5
     - Pacote Básico: price = 45.00, discount = 10
     - Pacote Premium: price = 80.00, discount = 20

## ✅ O que foi Alterado na Interface

- ✅ Removida menção "Válido por 3 meses após a compra"
- ✅ Removida informação "Créditos expiram em 3 meses" do card informativo
- ✅ Mantida apenas "Pagamento seguro via Stripe Checkout"

## 🔍 Verificação Pós-Migration

Após executar a migration, verifique:

```sql
-- Verificar valores dos pacotes
SELECT name, credits, price, discount, active 
FROM credit_packages 
ORDER BY credits;
```

Você deve ver:
- Pacote Inicial: 20 créditos, €19.00, 5% desconto
- Pacote Básico: 50 créditos, €45.00, 10% desconto
- Pacote Premium: 100 créditos, €80.00, 20% desconto
- Pay as you go: 1 crédito, €1.00, 0% desconto

