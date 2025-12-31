/**
 * Script para tornar elastiquality@elastiquality.pt admin
 * Execute: node scripts/tornar-admin.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://qeswqwhccqfbdtmywzkz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlc3dxd2hjY3FmYmR0bXl3emt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTkwOTcsImV4cCI6MjA3ODI3NTA5N30.zKQ-IonSx1iazytJ8fPb4DrhsccFv1Hdwa0Zhx-14UA';

// Credenciais de login do usuário admin
const ADMIN_EMAIL = 'elastiquality@elastiquality.pt';
const ADMIN_PASSWORD = 'Empresa2025!';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function tornarAdmin() {
  console.log('🚀 Iniciando processo...\n');

  try {
    // Passo 0: Fazer login como o usuário
    console.log('📋 Passo 0: Fazendo login como elastiquality@elastiquality.pt...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (authError) {
      console.error('❌ ERRO ao fazer login:', authError.message);
      console.error('');
      console.error('Verifique se:');
      console.error('1. O usuário elastiquality@elastiquality.pt existe');
      console.error('2. A senha está correta (Empresa2025!)');
      console.error('3. O usuário confirmou o email');
      console.error('');
      console.error('Se o usuário não existe, crie usando:');
      console.error('   database/create_elastiquality_profile.sql');
      process.exit(1);
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('');

    // Passo 1: Verificar se o usuário existe
    console.log('📋 Passo 1: Verificando dados do usuário...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, user_type, is_admin, created_at')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (userError) {
      console.error('❌ ERRO ao buscar usuário:', userError.message);
      process.exit(1);
    }

    console.log('✅ Usuário encontrado:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Tipo: ${userData.user_type}`);
    console.log(`   Admin: ${userData.is_admin}`);
    console.log(`   Criado em: ${new Date(userData.created_at).toLocaleString('pt-PT')}`);
    console.log('');

    if (userData.is_admin) {
      console.log('✅ Usuário JÁ É ADMIN! Nada a fazer.');
      console.log('');
      console.log('🎉 Você pode fazer login agora:');
      console.log('   Email: elastiquality@elastiquality.pt');
      console.log('   Senha: Empresa2025!');
      console.log('   URL: https://dainty-gnome-5cbd33.netlify.app');
      process.exit(0);
    }

    // Passo 2: Tornar admin usando a função RPC
    console.log('📋 Passo 2: Tornando usuário admin...');
    const { data: adminData, error: adminError } = await supabase
      .rpc('make_user_admin', { user_email: ADMIN_EMAIL });

    if (adminError) {
      console.error('⚠️ Erro ao usar função make_user_admin:', adminError.message);
      console.error('');
      console.error('Isso é normal se a função não existir ainda.');
      console.error('Tentando método alternativo (UPDATE direto)...');
      console.error('');

      // Método alternativo: UPDATE direto
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('email', ADMIN_EMAIL);

      if (updateError) {
        console.error('❌ ERRO no UPDATE:', updateError.message);
        console.error('');
        console.error('SOLUÇÃO: Execute manualmente no Supabase SQL Editor:');
        console.error('');
        console.error('UPDATE users SET is_admin = TRUE');
        console.error(`WHERE email = '${ADMIN_EMAIL}';`);
        console.error('');
        console.error('URL: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new');
        process.exit(1);
      }
    }

    console.log('✅ Usuário tornado admin com sucesso!');
    console.log('');

    // Passo 3: Verificar
    console.log('📋 Passo 3: Verificando...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('email, user_type, is_admin')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (verifyError) {
      console.error('❌ ERRO ao verificar:', verifyError.message);
      process.exit(1);
    }

    console.log('✅ Verificação concluída:');
    console.log(`   Email: ${verifyData.email}`);
    console.log(`   Tipo: ${verifyData.user_type}`);
    console.log(`   Admin: ${verifyData.is_admin}`);
    console.log('');

    if (verifyData.is_admin) {
      console.log('🎉 SUCESSO! Usuário agora é ADMIN!');
      console.log('');
      console.log('📱 Próximos passos:');
      console.log('   1. Faça logout (se estiver logado)');
      console.log('   2. Faça login com:');
      console.log('      Email: elastiquality@elastiquality.pt');
      console.log('      Senha: Empresa2025!');
      console.log('   3. Você será redirecionado para o Dashboard Admin');
      console.log('');
      console.log('🌐 URL: https://dainty-gnome-5cbd33.netlify.app');
    } else {
      console.error('❌ ERRO: Usuário ainda não é admin!');
      console.error('');
      console.error('Execute manualmente no Supabase SQL Editor:');
      console.error('');
      console.error('UPDATE users SET is_admin = TRUE');
      console.error(`WHERE email = '${ADMIN_EMAIL}';`);
      console.error('');
      console.error('URL: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ ERRO INESPERADO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar
tornarAdmin();

