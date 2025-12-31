# 🔄 Fluxo de Interação Cliente ↔ Profissional

## 📋 Visão Geral

O **Elastiquality** conecta clientes que precisam de serviços a profissionais qualificados através de um sistema de leads, propostas e chat. Este documento explica todo o processo de interação entre os dois tipos de usuários.

---

## 🎯 Fluxo Completo (Passo a Passo)

### **FASE 1: Cliente Cria Pedido de Serviço** 👤

#### 1.1 Cliente cria um pedido
- **Tela**: `NewServiceRequestScreen`
- **Campos obrigatórios**:
  - Título do serviço *
  - Categoria/Serviço *
  - Descrição detalhada *
  - Localização (distrito, concelho, freguesia) *
- **Campos opcionais**:
  - Orçamento estimado
  - Fotos do serviço necessário

#### 1.2 Sistema cria o pedido
- **Tabela**: `service_requests`
- **Status inicial**: `pending`
- **Dados salvos**:
  - Informações do cliente (`client_id`)
  - Categoria, título, descrição
  - Localização completa
  - Fotos (se houver)
  - Orçamento estimado (se informado)

#### 1.3 Sistema cria Lead automaticamente
- **Tabela**: `leads`
- **Processo**: Quando um pedido é criado, o sistema automaticamente cria um "lead" (oportunidade)
- **Dados do Lead**:
  - Referência ao pedido (`service_request_id`)
  - Categoria do serviço
  - Custo em créditos (calculado dinamicamente por categoria)
  - Localização
  - Descrição resumida

**Nota**: O lead só aparece para profissionais que:
- Têm a categoria do serviço configurada no perfil
- Têm a região/localização correspondente configurada
- Ainda não desbloquearam esse lead específico

---

### **FASE 2: Profissional Visualiza Leads** 💼

#### 2.1 Profissional vê oportunidades disponíveis
- **Tela**: `ProfessionalHomeScreen`
- **Filtros aplicados automaticamente**:
  - ✅ Categoria: Apenas leads das categorias que o profissional oferece
  - ✅ Região: Apenas leads das regiões onde o profissional atende
  - ✅ Não desbloqueados: Exclui leads já desbloqueados pelo profissional

#### 2.2 Profissional precisa de créditos
- **Sistema**: Profissional precisa comprar créditos para desbloquear leads
- **Tela**: `BuyCreditsScreen`
- **Pacotes disponíveis**:
  - Pacote Inicial: 20 créditos por €19 (5% de desconto)
  - Pacote Básico: 50 créditos por €45 (10% de desconto)
  - Pacote Premium: 100 créditos por €80 (20% de desconto)

#### 2.3 Profissional desbloqueia um lead
- **Tela**: `LeadDetailScreen`
- **Processo**:
  1. Profissional visualiza detalhes do lead
  2. Vê o custo em créditos
  3. Clica em "Desbloquear Lead"
  4. Sistema verifica se tem créditos suficientes
  5. Se sim: debita créditos e cria registro em `unlocked_leads`
  6. Se não: mostra erro "Créditos insuficientes"

**Tabelas envolvidas**:
- `unlocked_leads`: Registra que o profissional desbloqueou o lead
- `professionals`: Atualiza saldo de créditos (decrementa)
- `credit_transactions`: Registra a transação de débito

---

### **FASE 3: Profissional Envia Proposta** 📝

#### 3.1 Profissional acessa detalhes do lead desbloqueado
- **Tela**: `LeadDetailScreen`
- **Informações visíveis**:
  - Categoria e descrição do serviço
  - Localização completa
  - Fotos enviadas pelo cliente (se houver)
  - Data de criação do pedido
  - Status da proposta (se já enviou uma)

#### 3.2 Profissional envia proposta
- **Tela**: `SendProposalScreen`
- **Campos obrigatórios**:
  - Valor da proposta (€) *
  - Descrição detalhada *
- **Campos opcionais**:
  - Prazo estimado

#### 3.3 Sistema cria proposta
- **Tabela**: `proposals`
- **Status inicial**: `pending`
- **Dados salvos**:
  - Referência ao pedido (`service_request_id`)
  - ID do profissional (`professional_id`)
  - Valor proposto
  - Descrição
  - Prazo estimado (se informado)

**Notificações**:
- Cliente recebe notificação de nova proposta
- Profissional recebe confirmação de envio

---

### **FASE 4: Cliente Recebe e Avalia Propostas** ✅

#### 4.1 Cliente visualiza propostas recebidas
- **Tela**: `ServiceRequestDetailScreen`
- **Informações exibidas**:
  - Lista de todas as propostas recebidas
  - Nome do profissional
  - Valor proposto
  - Descrição da proposta
  - Prazo estimado
  - Avaliação média do profissional (se houver)
  - Status da proposta (pending/accepted/rejected)

#### 4.2 Cliente pode filtrar propostas
- **Filtros disponíveis**:
  - Por avaliação mínima (ex: apenas profissionais com 4+ estrelas)
  - Por valor (menor/maior)
  - Por data (mais recentes primeiro)

#### 4.3 Cliente aceita uma proposta
- **Ação**: Clica em "Aceitar Proposta"
- **Processo automático**:
  1. ✅ Proposta selecionada → status muda para `accepted`
  2. ❌ Outras propostas → status muda para `rejected`
  3. 📋 Pedido → status muda de `pending` para `active`
  4. 🔔 Notificação enviada ao profissional

**Tabelas atualizadas**:
- `proposals`: Status atualizado
- `service_requests`: Status muda para `active`

#### 4.4 Cliente pode rejeitar proposta
- **Ação**: Clica em "Rejeitar Proposta"
- **Processo**:
  - Proposta → status muda para `rejected`
  - Outras propostas continuam `pending`
  - Pedido continua `pending` (aguardando outras propostas)

---

### **FASE 5: Comunicação via Chat** 💬

#### 5.1 Início da conversa
- **Quem pode iniciar**:
  - ✅ Cliente: Após receber proposta (ou a qualquer momento)
  - ✅ Profissional: Após desbloquear lead

#### 5.2 Sistema cria conversa automaticamente
- **Função**: `ensure_conversation()`
- **Tabelas**:
  - `conversations`: Cria conversa vinculada ao pedido
  - `conversation_participants`: Adiciona cliente e profissional como participantes

**Características**:
- Uma conversa por pedido (1:1 entre cliente e profissional)
- Se já existe conversa, reutiliza a existente
- Vinculada ao `service_request_id`

#### 5.3 Troca de mensagens
- **Tela Cliente**: `ChatConversationScreen` (dentro de `ClientChat`)
- **Tela Profissional**: `ProChatConversationScreen` (dentro de `ProfessionalChat`)
- **Funcionalidades**:
  - Mensagens em tempo real (Supabase Realtime)
  - Envio de fotos/imagens
  - Indicador de "lido/não lido"
  - Histórico completo de mensagens

**Tabelas**:
- `messages`: Armazena todas as mensagens
- Campos: `conversation_id`, `sender_id`, `content`, `media_url`, `read_by[]`

---

### **FASE 6: Execução e Conclusão do Serviço** 🎉

#### 6.1 Serviço em andamento
- **Status do pedido**: `active`
- **Comunicação**: Cliente e profissional conversam via chat
- **Ações disponíveis**:
  - Trocar mensagens
  - Enviar fotos do progresso
  - Combinar detalhes finais

#### 6.2 Cliente marca serviço como concluído
- **Tela**: `ServiceRequestDetailScreen`
- **Ação**: Botão "Marcar como Concluído"
- **Processo**:
  1. Pedido → status muda para `completed`
  2. Data de conclusão registrada (`completed_at`)
  3. Sistema sugere avaliação do profissional

#### 6.3 Cliente avalia o profissional
- **Tela**: `ReviewScreen`
- **Campos**:
  - Avaliação (1-5 estrelas) *
  - Comentário (opcional)
- **Dados salvos**:
  - `reviews`: Nova avaliação criada
  - `professionals`: Rating médio atualizado automaticamente
  - `professionals`: Contador de avaliações incrementado

**Impacto**:
- Avaliação aparece no perfil do profissional
- Influencia futuras propostas (clientes podem filtrar por avaliação)
- Melhora a reputação do profissional

---

## 🔄 Resumo Visual do Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO                               │
└─────────────────────────────────────────────────────────────────┘

1. CLIENTE CRIA PEDIDO
   └─> service_requests (status: pending)
       └─> leads (criado automaticamente)

2. PROFISSIONAL VÊ LEADS
   └─> Filtrados por categoria e região
   └─> Precisa desbloquear com créditos

3. PROFISSIONAL DESBLOQUEIA LEAD
   └─> unlocked_leads (registro criado)
   └─> Créditos debitados

4. PROFISSIONAL ENVIA PROPOSTA
   └─> proposals (status: pending)

5. CLIENTE AVALIA PROPOSTAS
   ├─> Aceita → proposals (accepted)
   │   └─> service_requests (status: active)
   └─> Rejeita → proposals (rejected)

6. CHAT INICIADO
   └─> conversations (criada automaticamente)
   └─> messages (troca de mensagens)

7. SERVIÇO EXECUTADO
   └─> service_requests (status: completed)

8. CLIENTE AVALIA PROFISSIONAL
   └─> reviews (nova avaliação)
   └─> professionals (rating atualizado)
```

---

## 📊 Tabelas Principais e Relacionamentos

### **service_requests** (Pedidos)
- Criado por: Cliente
- Status: `pending` → `active` → `completed` ou `cancelled`
- Vinculado a: `client_id`

### **leads** (Oportunidades)
- Criado por: Sistema (automaticamente)
- Vinculado a: `service_request_id`
- Filtrado por: Categoria e região do profissional

### **unlocked_leads** (Leads Desbloqueados)
- Criado por: Profissional (ao desbloquear)
- Vinculado a: `lead_id` + `professional_id`
- Custo: Débito de créditos

### **proposals** (Propostas)
- Criado por: Profissional
- Status: `pending` → `accepted` ou `rejected`
- Vinculado a: `service_request_id` + `professional_id`

### **conversations** (Conversas)
- Criado por: Sistema (automaticamente)
- Vinculado a: `service_request_id`
- Participantes: Cliente + Profissional

### **messages** (Mensagens)
- Criado por: Cliente ou Profissional
- Vinculado a: `conversation_id`
- Tipos: Texto ou imagem

### **reviews** (Avaliações)
- Criado por: Cliente
- Vinculado a: `service_request_id` + `professional_id` + `client_id`
- Impacto: Atualiza rating do profissional

---

## 💡 Pontos Importantes

### **Para Clientes**:
- ✅ Criar pedidos é **GRATUITO**
- ✅ Receber propostas é **GRATUITO**
- ✅ Chat é **GRATUITO**
- ✅ Pagamento é feito **DIRETAMENTE** ao profissional (fora da plataforma)

### **Para Profissionais**:
- ✅ Cadastro é **GRATUITO**
- ✅ Enviar propostas é **GRATUITO** (após desbloquear lead)
- ✅ Chat é **GRATUITO**
- 💰 **Custo**: Apenas para desbloquear leads (créditos)
- 💰 **Receita**: Recebe diretamente do cliente (fora da plataforma)

### **Sistema de Créditos**:
- Profissionais compram créditos para desbloquear leads
- Cada categoria tem um custo diferente
- Não há reembolso por leads desbloqueados

### **Filtros Automáticos**:
- Leads aparecem apenas para profissionais relevantes
- Baseado em categorias e regiões configuradas
- Exclui leads já desbloqueados
- Melhora a experiência e aumenta conversão

---

## 🎯 Benefícios do Sistema

### **Para Clientes**:
1. Encontra profissionais qualificados facilmente
2. Compara múltiplas propostas
3. Vê avaliações antes de escolher
4. Comunicação direta via chat
5. Tudo gratuito para o cliente

### **Para Profissionais**:
1. Recebe leads qualificados (já filtrados)
2. Paga apenas por oportunidades relevantes
3. Constrói reputação através de avaliações
4. Comunicação direta com clientes
5. Controle total sobre propostas

---

## 📱 Telas Principais

### **Cliente**:
- `NewServiceRequestScreen`: Criar pedido
- `ClientHomeScreen`: Ver pedidos criados
- `ServiceRequestDetailScreen`: Ver detalhes e propostas
- `ChatConversationScreen`: Conversar com profissional
- `ReviewScreen`: Avaliar profissional

### **Profissional**:
- `ProfessionalHomeScreen`: Ver leads disponíveis
- `LeadDetailScreen`: Ver detalhes do lead
- `SendProposalScreen`: Enviar proposta
- `ProChatConversationScreen`: Conversar com cliente
- `BuyCreditsScreen`: Comprar créditos

---

**Última atualização**: Janeiro 2025

