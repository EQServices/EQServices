# ✅ Checklist de Deploy - Elastiquality

Use este checklist antes de fazer deploy para produção.

---

## 📋 Pré-Deploy

### Código
- [ ] Código está funcionando localmente
- [ ] Não há erros no console
- [ ] Não há warnings críticos
- [ ] Build local funciona (`npm run build:web`)
- [ ] Testes passam (`npm test`)

### Configuração
- [ ] Arquivo `.env` configurado
- [ ] Arquivo `.env.production` criado
- [ ] Variáveis de ambiente verificadas
- [ ] `netlify.toml` configurado

### Banco de Dados
- [ ] Schema SQL executado no Supabase
- [ ] Tabelas criadas
- [ ] RLS policies ativas
- [ ] Índices criados
- [ ] Backup configurado

### Funcionalidades
- [ ] Login funciona
- [ ] Registro funciona (cliente e profissional)
- [ ] Criar pedido funciona
- [ ] Upload de imagens funciona
- [ ] Navegação funciona
- [ ] Chat funciona (se implementado)

---

## 🚀 Deploy

### Método 1: Interface Web
- [ ] Conta Netlify criada
- [ ] Repositório conectado
- [ ] Build settings configurados
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy iniciado

### Método 2: CLI
- [ ] Netlify CLI instalado (`npm install -g netlify-cli`)
- [ ] Login feito (`netlify login`)
- [ ] Build local feito (`npm run build:web`)
- [ ] Deploy de teste feito (`netlify deploy`)
- [ ] Deploy de produção feito (`netlify deploy --prod`)

### Método 3: Script
- [ ] Script executado (`.\deploy.ps1 test` ou `.\deploy.ps1 prod`)

---

## 🧪 Pós-Deploy

### Verificações Básicas
- [ ] Site está acessível
- [ ] HTTPS funciona
- [ ] Favicon aparece
- [ ] Logo aparece
- [ ] Cores corretas

### Funcionalidades
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Criar pedido funciona
- [ ] Upload de imagens funciona
- [ ] Navegação funciona
- [ ] Rotas funcionam (não dá 404)

### Responsividade
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Navegadores
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Performance
- [ ] Tempo de carregamento < 3s
- [ ] Imagens otimizadas
- [ ] Bundle size razoável
- [ ] Lighthouse score > 80

### SEO e PWA
- [ ] Meta tags configuradas
- [ ] Open Graph configurado
- [ ] Manifest.json presente
- [ ] PWA instalável
- [ ] Service Worker funciona

---

## 🔒 Segurança

- [ ] HTTPS ativo
- [ ] Headers de segurança configurados
- [ ] Variáveis sensíveis não expostas
- [ ] CORS configurado
- [ ] Rate limiting ativo (se implementado)

---

## 📊 Monitoramento

- [ ] Analytics configurado
- [ ] Sentry configurado (se implementado)
- [ ] Logs acessíveis
- [ ] Alertas configurados

---

## 🌐 Domínio (Opcional)

- [ ] Domínio comprado
- [ ] DNS configurado
- [ ] SSL configurado
- [ ] Redirecionamento www → não-www
- [ ] Redirecionamento http → https

---

## 📝 Documentação

- [ ] README atualizado
- [ ] CHANGELOG atualizado
- [ ] Versão atualizada
- [ ] Documentação de API atualizada

---

## 🎯 Comunicação

- [ ] Equipe notificada
- [ ] Beta testers notificados
- [ ] Usuários notificados (se aplicável)
- [ ] Redes sociais atualizadas

---

## 🚨 Plano de Rollback

- [ ] Backup do código anterior
- [ ] Backup do banco de dados
- [ ] Procedimento de rollback documentado
- [ ] Contatos de emergência atualizados

---

## ✅ Aprovação Final

- [ ] Testes completos realizados
- [ ] Aprovação do responsável
- [ ] Horário de deploy definido
- [ ] Monitoramento ativo

---

**Data do Deploy**: _______________  
**Responsável**: _______________  
**Versão**: _______________  
**URL**: _______________

---

## 📞 Contatos de Emergência

**Supabase Support**: support@supabase.io  
**Netlify Support**: https://answers.netlify.com  
**Stripe Support**: https://support.stripe.com

---

## 🎉 Pós-Deploy Bem-Sucedido

Após deploy bem-sucedido:

1. ✅ Monitorar por 24h
2. ✅ Verificar logs regularmente
3. ✅ Responder feedback de usuários
4. ✅ Corrigir bugs críticos imediatamente
5. ✅ Celebrar! 🎊

---

**Status**: [ ] Pronto para Deploy  
**Última Verificação**: _______________

