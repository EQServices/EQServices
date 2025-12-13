# 🎯 Criar Perfil Elastiquality - Guia Completo

## 📋 Informações do Perfil

- **Email**: `elastiquality@elastiquality.pt`
- **Senha**: `Empresa2025!`
- **Tipo**: Profissional
- **Acesso**: Todas as categorias e todas as regiões de Portugal
- **Créditos**: 10.000 (para garantir acesso ilimitado)

---

## 🚀 Passo a Passo

### **Passo 1: Criar Usuário no Supabase Auth**

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione o projeto **Elastiquality**
3. Vá em **Authentication** → **Users**
4. Clique em **Add User** (botão verde no canto superior direito)
5. Preencha:
   - **Email**: `elastiquality@elastiquality.pt`
   - **Password**: `Empresa2025!`
   - **Auto Confirm User**: ✅ Marque esta opção (para não precisar confirmar email)
6. Clique em **Create User**
7. **IMPORTANTE**: Copie o **UUID** do usuário criado (aparece na coluna "UID")
   - Exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

### **Passo 2: Executar Script SQL**

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `database/create_elastiquality_profile.sql`
4. **SUBSTITUA** `'USER_ID_AQUI'` pelo UUID copiado no Passo 1 (em 2 lugares)
   - Linha 33: `id` na tabela `users`
   - Linha 53: `id` na tabela `professionals`
5. Cole o script completo no SQL Editor
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Verifique se aparece a mensagem de sucesso

---

### **Passo 3: Verificar Criação**

Execute esta query no SQL Editor para confirmar:

```sql
SELECT 
  u.id,
  u.email,
  u.name,
  u.user_type,
  u.location_label,
  p.credits,
  array_length(p.categories, 1) as total_categorias,
  array_length(p.regions, 1) as total_regioes,
  p.rating,
  p.description
FROM public.users u
LEFT JOIN public.professionals p ON u.id = p.id
WHERE u.email = 'elastiquality@elastiquality.pt';
```

**Resultado esperado**:
- ✅ `email`: elastiquality@elastiquality.pt
- ✅ `user_type`: professional
- ✅ `credits`: 10000
- ✅ `total_categorias`: 51 (todas as categorias)
- ✅ `total_regioes`: 20 (todos os distritos + Açores + Madeira)
- ✅ `rating`: 5.00

---

## 📊 O Que Este Perfil Pode Fazer

### ✅ **Acesso Total a Oportunidades**

Este perfil terá acesso a **TODAS** as oportunidades de trabalho porque:

1. **Todas as Categorias** (51 serviços):
   - Construção e Remodelação (6 serviços)
   - Serviços Domésticos (5 serviços)
   - Limpeza (4 serviços)
   - Tecnologia e Informática (4 serviços)
   - Automóvel (4 serviços)
   - Beleza e Estética (4 serviços)
   - Saúde e Bem-Estar (4 serviços)
   - Transporte e Logística (4 serviços)
   - Educação (3 serviços)
   - Eventos e Festas (5 serviços)
   - Administrativos e Financeiros (4 serviços)
   - Criativos e Design (4 serviços)
   - Costura/Alfaiataria/Modista (4 serviços)

2. **Todas as Regiões** (20 áreas):
   - 18 Distritos de Portugal Continental
   - 2 Regiões Autónomas (Açores e Madeira)

3. **10.000 Créditos**:
   - Suficiente para desbloquear centenas de leads
   - Custo médio por lead: 15-45 créditos
   - Permite monitoramento contínuo sem preocupações

---

## 🔐 Login no Sistema

Após criar o perfil, você pode fazer login:

1. Acesse: https://dainty-gnome-5cbd33.netlify.app
2. Clique em **Entrar**
3. Digite:
   - **Email**: `elastiquality@elastiquality.pt`
   - **Senha**: `Empresa2025!`
4. Clique em **Entrar**

Você será direcionado para a **Tela Inicial do Profissional** com acesso a todos os leads disponíveis.

---

## 📱 Funcionalidades Disponíveis

Com este perfil, você poderá:

- ✅ **Ver todos os leads** de todas as categorias
- ✅ **Desbloquear leads** em qualquer região de Portugal
- ✅ **Enviar propostas** para qualquer pedido de serviço
- ✅ **Monitorar atividade** da plataforma
- ✅ **Testar funcionalidades** como profissional
- ✅ **Suporte a clientes** visualizando oportunidades

---

## 🛠️ Manutenção do Perfil

### **Adicionar Mais Créditos**

Se precisar adicionar mais créditos no futuro:

```sql
UPDATE public.professionals
SET 
  credits = credits + 10000,
  updated_at = NOW()
WHERE id = 'UUID_DO_USUARIO';
```

### **Verificar Créditos Atuais**

```sql
SELECT 
  u.email,
  p.credits,
  p.rating,
  array_length(p.categories, 1) as categorias,
  array_length(p.regions, 1) as regioes
FROM public.users u
JOIN public.professionals p ON u.id = p.id
WHERE u.email = 'elastiquality@elastiquality.pt';
```

### **Atualizar Senha**

Se precisar alterar a senha:

1. Vá em **Authentication** → **Users**
2. Encontre o usuário `elastiquality@elastiquality.pt`
3. Clique nos 3 pontinhos → **Reset Password**
4. Digite a nova senha

---

## ⚠️ Notas Importantes

1. **Não delete este perfil** - Ele é útil para monitoramento e suporte
2. **Mantenha a senha segura** - Este perfil tem acesso total
3. **Use para testes** - Ideal para testar funcionalidades de profissional
4. **Monitoramento** - Útil para ver todas as oportunidades da plataforma
5. **Suporte** - Pode ajudar clientes mostrando como funciona

---

## 🎉 Pronto!

Após seguir estes passos, o perfil **Elastiquality** estará ativo e funcionando com:

- ✅ Acesso a todas as 51 categorias de serviços
- ✅ Cobertura em todas as 20 regiões de Portugal
- ✅ 10.000 créditos para desbloquear leads
- ✅ Rating 5.0 (máximo)
- ✅ Pronto para uso imediato

---

**Dúvidas?** Consulte a documentação ou entre em contato com o suporte técnico.

