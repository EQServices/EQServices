# 💰 CÁLCULO DE RECEITA: Modelo de Negócio Elastiquality

## 📊 RESUMO EXECUTIVO

**Custos Mensais Totais**: €20.368,91  
**Receita Líquida Necessária para Break-Even**: €20.368,91/mês (após taxas Stripe)  
**Modelo de Receita**: Venda de créditos/moedas para profissionais desbloquearem leads  
**Taxa Stripe**: 1,4% + €0,25 por transação (cartões europeus)  
**Profissionais Ativos Necessários**: ~300 profissionais (com contribuição líquida média de €68,00/mês)

---

## 🎯 MODELO DE NEGÓCIO

### Como Funciona:
1. **Clientes** criam pedidos de serviço (GRATUITO)
2. **Sistema** cria leads automaticamente
3. **Profissionais** compram créditos para desbloquear leads
4. **Receita** = Venda de créditos/moedas

### Estrutura de Preços de Créditos:

| Pacote | Créditos | Preço Bruto (€) | Taxa Stripe* | Preço Líquido (€) | Preço por Crédito (€) | Observações |
|--------|----------|-----------------|--------------|-------------------|----------------------|-------------|
| **Pacote Inicial** | 20 | 19,00 | 0,52 | 18,48 | 0,92 | 5% desconto |
| **Pacote Básico** | 50 | 45,00 | 0,88 | 44,12 | 0,88 | 10% desconto |
| **Pacote Premium** | 100 | 80,00 | 1,37 | 78,63 | 0,79 | 20% desconto |
| **Unidade** | 1 | 1,00 | 0,26 | 0,74 | 0,74 | Preço individual |

*Taxa Stripe: 1,4% + €0,25 por transação (taxa padrão para cartões europeus)

**Fórmula de Cálculo da Taxa Stripe**:
```
Taxa = (Preço × 0,014) + 0,25
Receita Líquida = Preço - Taxa
```

**Exemplos de Cálculo**:
- Pacote Inicial: €19,00 - [(€19,00 × 0,014) + €0,25] = €19,00 - €0,52 = **€18,48**
- Pacote Básico: €45,00 - [(€45,00 × 0,014) + €0,25] = €45,00 - €0,88 = **€44,12**
- Pacote Premium: €80,00 - [(€80,00 × 0,014) + €0,25] = €80,00 - €1,37 = **€78,63**
- Unidade: €1,00 - [(€1,00 × 0,014) + €0,25] = €1,00 - €0,26 = **€0,74**

**Nota**: O preço médio por crédito varia conforme o pacote escolhido. Os valores líquidos são após dedução das taxas da Stripe.

---

## 💵 CUSTO POR LEAD (POR CATEGORIA) - MÁXIMO 10 MOEDAS

| Categoria | Custo em Créditos | Custo Médio (€)* | Observações |
|-----------|-------------------|-------------------|-------------|
| Reformas e Construção | 10 | 10,00 | Categoria premium (máximo) |
| Consultoria | 9 | 9,00 | Categoria premium |
| Mudanças/Transporte | 8 | 8,00 | Categoria alta |
| Eventos | 7 | 7,00 | Categoria alta |
| Serviço Automóvel | 7 | 7,00 | Categoria alta |
| Design/Fotografia | 7 | 7,00 | Categoria alta |
| Tecnologia e Informática | 6 | 6,00 | Categoria média-alta |
| Saúde e Bem-Estar | 6 | 6,00 | Categoria média-alta |
| Pintura | 4 | 4,00 | Categoria média |
| Beleza e Estética | 4 | 4,00 | Categoria média |
| Eletricista | 3 | 3,00 | Categoria básica |
| Canalizador | 3 | 3,00 | Categoria básica |
| Assistência Técnica | 3 | 3,00 | Categoria básica |
| Limpeza | 3 | 3,00 | Categoria básica |
| Jardinagem | 3 | 3,00 | Categoria básica |
| Aulas Particulares | 3 | 3,00 | Categoria básica |
| Cuidados Pessoais | 3 | 3,00 | Categoria básica |
| Outros | 3 | 3,00 | Categoria básica |

*Custo médio assumindo preço de €1,00 por crédito (preço unitário)

**Custo Médio Ponderado por Lead**: ~€5,00 (considerando distribuição de categorias e máximo de 10 moedas)

---

## 💳 TAXAS DE PROCESSAMENTO - STRIPE

### Taxas Aplicadas

**Stripe Portugal - Cartões Europeus:**
- **Taxa**: 1,4% + €0,25 por transação
- **Aplicável a**: Cartões de crédito e débito europeus
- **Fórmula**: `Taxa = (Valor × 0,014) + 0,25`

### Impacto das Taxas nos Preços

| Pacote | Preço Bruto | Taxa Stripe | Receita Líquida | % Taxa |
|--------|-------------|-------------|-----------------|--------|
| Pacote Inicial (€19) | €19,00 | €0,52 | €18,48 | 2,74% |
| Pacote Básico (€45) | €45,00 | €0,88 | €44,12 | 1,96% |
| Pacote Premium (€80) | €80,00 | €1,37 | €78,63 | 1,71% |
| Unidade (€1) | €1,00 | €0,26 | €0,74 | 26,00% |

**Observação**: A taxa percentual é maior em valores menores devido à taxa fixa de €0,25.

### Impacto Total nas Receitas

**Exemplo Mensal (330 profissionais - Mix 70/30):**
- Receita Bruta: €21.080,00
- Taxas Stripe: ~€295,00 (1,4% do total + €0,25 × 330 transações)
- **Receita Líquida**: €20.785,00

**Perda por Taxas**: ~1,4% do valor total + €0,25 por transação

---

## 📈 CENÁRIOS DE RECEITA

### Cenário 1: Receita Mínima (Break-Even)

**Objetivo**: €20.368,91/mês (receita líquida após taxas Stripe)

#### Opção A: Apenas Pacote Básico (50 créditos = €44,12 líquido)

```
Receita Líquida Necessária: €20.368,91
Preço Líquido por Pacote: €44,12 (€45,00 - €0,88 taxa Stripe)

Número de Pacotes = €20.368,91 / €44,12 = 461,7 pacotes/mês
≈ 462 profissionais comprando 1 pacote básico/mês
```

#### Opção B: Apenas Pacote Premium (100 créditos = €78,63 líquido)

```
Receita Líquida Necessária: €20.368,91
Preço Líquido por Pacote: €78,63 (€80,00 - €1,37 taxa Stripe)

Número de Pacotes = €20.368,91 / €78,63 = 259,0 pacotes/mês
≈ 259 profissionais comprando 1 pacote premium/mês
```

#### Opção C: Mix Realista (70% Premium + 30% Básico)

```
70% Premium: 183 profissionais × €78,63 = €14.389,29
30% Básico: 157 profissionais × €44,12 = €6.926,84
Total: 340 profissionais = €21.316,13/mês ✅
```

**✅ RESULTADO**: Precisa de aproximadamente **275-285 profissionais ativos** comprando créditos mensalmente (considerando receita líquida após taxas)

---

### Cenário 2: Receita com Margem de Segurança (20% acima do break-even)

**Objetivo**: €24.442,69/mês (€20.368,91 × 1,20) - receita líquida

```
Com Mix 70/30:
- 220 profissionais Premium × €78,63 = €17.298,60
- 189 profissionais Básico × €44,12 = €8.338,68
Total: 409 profissionais = €25.637,28/mês ✅
```

**✅ RESULTADO**: Precisa de aproximadamente **400-410 profissionais ativos**

---

### Cenário 3: Receita para Crescimento (50% acima do break-even)

**Objetivo**: €30.553,37/mês (€20.368,91 × 1,50) - receita líquida

```
Com Mix 70/30:
- 272 profissionais Premium × €78,63 = €21.387,36
- 233 profissionais Básico × €44,12 = €10.279,96
Total: 505 profissionais = €31.667,32/mês ✅
```

**✅ RESULTADO**: Precisa de aproximadamente **500-510 profissionais ativos**

---

## 🔢 CÁLCULO BASEADO EM LEADS VENDIDOS

### Assumindo Custo Médio por Lead: €5,00 (máximo 10 moedas)

**Receita por Lead Vendido**: €5,00 (média ponderada)

```
Receita Necessária: €20.368,91/mês
Receita por Lead: €5,00

Leads Necessários = €20.368,91 / €5,00 = 4.073,78 leads/mês
≈ 4.075 leads vendidos por mês
```

### Distribuição por Categoria (Exemplo Realista)

| Categoria | Custo (moedas) | % do Total | Leads/Mês | Receita (€) |
|-----------|----------------|------------|-----------|-------------|
| Limpeza | 3 | 20% | 815 | 2.445 |
| Eletricista | 3 | 15% | 611 | 1.833 |
| Canalizador | 3 | 15% | 611 | 1.833 |
| Pintura | 4 | 12% | 489 | 1.956 |
| Jardinagem | 3 | 10% | 407 | 1.221 |
| Reformas | 10 | 8% | 326 | 3.260 |
| Eventos | 7 | 5% | 204 | 1.428 |
| Outros | 3 | 10% | 407 | 1.221 |
| **TOTAL** | **-** | **100%** | **4.070** | **€15.197** |

*Nota: Com custo médio de €5,00 por lead, são necessários aproximadamente 4.075 leads/mês para atingir o break-even de €20.368,91

---

## 👥 QUANTOS PROFISSIONAIS SÃO NECESSÁRIOS?

### Análise de Comportamento do Profissional

#### Perfil Tipo 1: Profissional Ativo (Compra Mensal)
- Compra 1 pacote/mês (Inicial €18,48, Básico €44,12 ou Premium €78,63 líquido)
- Desbloqueia 10-20 leads/mês
- **Contribuição Líquida**: €18,48-78,63/mês (média €55,00 considerando mix: 20% Inicial, 40% Básico, 40% Premium)

#### Perfil Tipo 2: Profissional Muito Ativo (Compra 2x/mês)
- Compra 2 pacotes/mês
- Desbloqueia 30-50 leads/mês
- **Contribuição Líquida**: €36,96-157,26/mês (média €110,00)

#### Perfil Tipo 3: Profissional Ocasional (Compra a cada 2 meses)
- Compra 1 pacote a cada 2 meses (geralmente Inicial ou Básico)
- Desbloqueia 5-10 leads/mês
- **Contribuição Líquida**: €9,24-22,06/mês (média mensal €20,00)

### Cálculo com Mix de Profissionais

**Assumindo distribuição realista:**
- 60% Profissionais Ativos (1x/mês): Contribuem €55,00/mês (mix: 20% Inicial, 40% Básico, 40% Premium, após taxas)
- 30% Profissionais Muito Ativos (2x/mês): Contribuem €110,00/mês (após taxas)
- 10% Profissionais Ocasionais (0,5x/mês): Contribuem €20,00/mês (após taxas)

**Contribuição Média Líquida por Profissional**: 
```
(0,60 × €55,00) + (0,30 × €110,00) + (0,10 × €20,00) = €33,00 + €33,00 + €2,00 = €68,00/mês
```

**Número de Profissionais Necessários**:
```
€20.368,91 / €68,00 = 299,5 profissionais
≈ 300 profissionais ativos na plataforma
```

**Nota**: Com a adição do Pacote Inicial (mais acessível), a contribuição média diminuiu, mas isso pode aumentar a taxa de conversão de cadastrados para ativos.

---

## 📊 PROJEÇÃO MENSAL DETALHADA

### Mês 1 (Início - Conservador)

| Métrica | Valor |
|---------|-------|
| Profissionais Cadastrados | 50 |
| Profissionais Ativos (compram créditos) | 15 (30%) |
| - Ativos (1x/mês) | 9 × €55,00 = €495,00 |
| - Muito Ativos (2x/mês) | 4 × €110,00 = €440,00 |
| - Ocasionais (0,5x/mês) | 2 × €20,00 = €40,00 |
| **Receita Líquida Mês 1** | **€975,00** |
| **Gap para Break-Even** | **€19.393,91** |

### Mês 3 (Crescimento Inicial)

| Métrica | Valor |
|---------|-------|
| Profissionais Cadastrados | 150 |
| Profissionais Ativos | 45 (30%) |
| **Receita Líquida Mês 3** | **€3.060,00** |
| **Gap para Break-Even** | **€17.308,91** |

### Mês 6 (Aceleração)

| Métrica | Valor |
|---------|-------|
| Profissionais Cadastrados | 400 |
| Profissionais Ativos | 120 (30%) |
| **Receita Líquida Mês 6** | **€8.160,00** |
| **Gap para Break-Even** | **€12.208,91** |

### Mês 9 (Aproximando Break-Even)

| Métrica | Valor |
|---------|-------|
| Profissionais Cadastrados | 700 |
| Profissionais Ativos | 210 (30%) |
| **Receita Líquida Mês 9** | **€14.280,00** |
| **Status** | **❌ Ainda abaixo do Break-Even (faltam €6.088,91)** |

### Mês 10-11 (Break-Even)

| Métrica | Valor |
|---------|-------|
| Profissionais Cadastrados | 1.000 |
| Profissionais Ativos | 300 (30%) |
| **Receita Líquida Mês 10-11** | **€20.400,00** |
| **Status** | **✅ Break-Even Atingido** |

### Mês 12 (Crescimento Sustentado)

| Métrica | Valor |
|---------|-------|
| Profissionais Cadastrados | 1.200 |
| Profissionais Ativos | 360 (30%) |
| **Receita Líquida Mês 12** | **€24.480,00** |
| **Lucro Mensal** | **€4.111,09** |

---

## 🎯 METAS POR FASE

### Fase 1: Validação (Meses 1-3)
- **Meta**: 50-150 profissionais cadastrados
- **Ativos**: 15-45 profissionais
- **Receita Líquida**: €975 - €3.060/mês (após taxas Stripe)
- **Foco**: Validar modelo, ajustar preços, testar Pacote Inicial

### Fase 2: Crescimento (Meses 4-6)
- **Meta**: 150-400 profissionais cadastrados
- **Ativos**: 45-120 profissionais
- **Receita Líquida**: €3.060 - €8.160/mês (após taxas Stripe)
- **Foco**: Marketing, aquisição de profissionais, conversão para pacotes maiores

### Fase 3: Break-Even (Meses 10-12)
- **Meta**: 1.000-1.200 profissionais cadastrados
- **Ativos**: 300-360 profissionais
- **Receita Líquida**: €20.400 - €24.480/mês (após taxas Stripe)
- **Foco**: Atingir sustentabilidade, otimizar mix de pacotes

### Fase 4: Escala (Meses 13-18)
- **Meta**: 1.200-1.800 profissionais cadastrados
- **Ativos**: 360-540 profissionais
- **Receita Líquida**: €24.480 - €36.720/mês (após taxas Stripe)
- **Foco**: Escalar e otimizar, aumentar ticket médio

---

## 💡 FÓRMULAS ÚTEIS

### Receita Mensal
```
Receita = (Nº Profissionais Ativos) × (Contribuição Média)
```

### Número de Profissionais Necessários
```
Profissionais = Receita Necessária / Contribuição Média
```

### Taxa de Conversão (Cadastrados → Ativos)
```
Taxa Conversão = Profissionais Ativos / Profissionais Cadastrados
```

### Leads Necessários
```
Leads = Receita Necessária / Preço Médio por Lead
```

---

## 📋 RESUMO EXECUTIVO - METAS

### Para Atingir Break-Even (€20.368,91/mês - receita líquida):

| Métrica | Valor Alvo |
|---------|------------|
| **Profissionais Cadastrados** | 1.000-1.100 |
| **Profissionais Ativos** | 300-330 (30% conversão) |
| **Leads Vendidos/Mês** | 4.000-4.100 (custo médio €5,00) |
| **Receita Líquida Média/Profissional** | €68,00/mês (após taxas Stripe) |

### Para Crescimento Sustentável (€30.000/mês - receita líquida):

| Métrica | Valor Alvo |
|---------|------------|
| **Profissionais Cadastrados** | 1.500-1.700 |
| **Profissionais Ativos** | 450-510 (30% conversão) |
| **Leads Vendidos/Mês** | 6.000-6.100 (custo médio €5,00) |
| **Receita Líquida Média/Profissional** | €65-70/mês (após taxas Stripe) |

---

## 🚀 ESTRATÉGIAS PARA ATINGIR AS METAS

### 1. Aumentar Taxa de Conversão (Cadastrados → Ativos)
- **Atual**: 30% (assumido)
- **Meta**: 40-50%
- **Ações**: Onboarding melhorado, primeiros leads grátis, incentivos

### 2. Aumentar Frequência de Compra
- **Atual**: 1x/mês (média)
- **Meta**: 1,5x/mês
- **Ações**: Descontos para compras recorrentes, pacotes anuais

### 3. Aumentar Ticket Médio
- **Atual**: €85-90/pacote
- **Meta**: €100-120/pacote
- **Ações**: Pacotes maiores, leads premium, assinaturas

### 4. Reduzir Churn (Profissionais que param de comprar)
- **Meta**: <10% churn mensal
- **Ações**: Qualidade de leads, suporte, gamificação

---

## ⚠️ CONSIDERAÇÕES IMPORTANTES

### Fatores que Afetam os Cálculos:

1. **Taxa de Conversão Real**: Pode ser menor que 30% inicialmente
2. **Churn Rate**: Profissionais podem parar de comprar
3. **Sazonalidade**: Algumas categorias têm picos (ex: jardinagem no verão)
4. **Qualidade dos Leads**: Leads ruins reduzem compras futuras
5. **Competição**: Outras plataformas podem competir

### Recomendações:

1. **Começar Conservador**: Assumir 20-25% de conversão inicialmente
2. **Focar em Qualidade**: Melhor ter 100 profissionais muito ativos que 200 inativos
3. **Monitorar Métricas**: Acompanhar conversão, churn, LTV
4. **Ajustar Preços**: Testar diferentes preços e pacotes
5. **Investir em Marketing**: Para atrair profissionais de qualidade

---

**Próximo Passo**: Use estes números para criar sua estratégia de aquisição de profissionais e projeções de receita!

