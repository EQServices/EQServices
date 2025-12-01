# 📊 Guia: Analisar Usuários no Banco de Dados

## 🎯 Objetivo

Analisar quantos usuários existem, quantos são profissionais e quantos são clientes.

---

## 🚀 Método 1: Via Supabase Dashboard (Recomendado)

### Passo a Passo

1. **Acesse o SQL Editor**:
   - URL: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new

2. **Cole a query abaixo**:

```sql
-- Análise de Usuários
SELECT 
  user_type,
  COUNT(*) as total,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as ultimos_7_dias,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as ultimos_30_dias,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentual
FROM users
GROUP BY user_type
ORDER BY total DESC;
```

3. **Clique em "Run"**

4. **Veja os resultados**:
   - Total de clientes
   - Total de profissionais
   - Crescimento recente

---

## 🔍 Método 2: Query Completa (Análise Detalhada)

Para uma análise mais completa, use o arquivo:
- `database/queries/analise_usuarios.sql`

Este arquivo contém múltiplas queries que mostram:
- Resumo geral
- Distribuição por tipo
- Análise de profissionais (créditos)
- Usuários recentes
- Estatísticas de atividade

---

## 📊 Queries Úteis

### Contar Total de Usuários

```sql
SELECT COUNT(*) as total_usuarios FROM users;
```

### Contar Clientes

```sql
SELECT COUNT(*) as total_clientes 
FROM users 
WHERE user_type = 'client';
```

### Contar Profissionais

```sql
SELECT COUNT(*) as total_profissionais 
FROM users 
WHERE user_type = 'professional';
```

### Ver Usuários Recentes

```sql
SELECT 
  email,
  user_type,
  first_name || ' ' || last_name as nome,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;
```

### Profissionais com Créditos

```sql
SELECT 
  COUNT(*) as profissionais_com_creditos,
  SUM(credits) as total_creditos
FROM professionals
WHERE credits > 0;
```

---

## 🛠️ Método 3: Via Script PowerShell

Execute:
```powershell
.\scripts\analisar-usuarios.ps1
```

O script tentará executar via CLI ou mostrará instruções para usar o Dashboard.

---

## 📈 Interpretação dos Resultados

### Exemplo de Resultado

```
user_type     | total | ultimos_7_dias | ultimos_30_dias | percentual
--------------|-------|----------------|-----------------|------------
client        | 150   | 10             | 45              | 75.00
professional  | 50    | 5              | 15              | 25.00
```

**Interpretação**:
- Total: 200 usuários
- 150 clientes (75%)
- 50 profissionais (25%)
- 15 novos usuários nos últimos 7 dias
- 60 novos usuários nos últimos 30 dias

---

## 💡 Dicas

1. **Execute regularmente** para acompanhar crescimento
2. **Compare períodos** para identificar tendências
3. **Monitore profissionais com créditos** para entender atividade
4. **Use filtros de data** para análises temporais

---

**Tempo estimado**: 5 minutos

