/**
 * Script para criar o perfil Elastiquality e torná-lo admin
 * Execute: node scripts/criar-e-tornar-admin.js
 * 
 * IMPORTANTE: Este script precisa da SUPABASE_SERVICE_ROLE_KEY
 * Configure antes de executar:
 * $env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key"
 * 
 * Obtenha a chave em:
 * https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/settings/api
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração
const SUPABASE_URL = 'https://qeswqwhccqfbdtmywzkz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = 'elastiquality@elastiquality.pt';
const ADMIN_PASSWORD = 'Empresa2025!';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não configurada!');
  console.error('');
  console.error('Configure a variável de ambiente:');
  console.error('');
  console.error('PowerShell:');
  console.error('$env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key"');
  console.error('');
  console.error('CMD:');
  console.error('set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key');
  console.error('');
  console.error('Obtenha a chave em:');
  console.error('https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/settings/api');
  console.error('(Procure por "service_role" na seção "Project API keys")');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function criarETornarAdmin() {
  console.log('🚀 Iniciando processo de criação do perfil Elastiquality...\n');

  try {
    // Passo 1: Verificar se o usuário já existe
    console.log('📋 Passo 1: Verificando se o usuário já existe...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, user_type, is_admin')
      .eq('email', ADMIN_EMAIL)
      .single();

    let userId;

    if (existingUser) {
      console.log('✅ Usuário já existe:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Tipo: ${existingUser.user_type}`);
      console.log(`   Admin: ${existingUser.is_admin}`);
      console.log('');
      userId = existingUser.id;

      if (existingUser.is_admin) {
        console.log('✅ Usuário JÁ É ADMIN! Nada a fazer.');
        console.log('');
        console.log('🎉 Faça login em: https://dainty-gnome-5cbd33.netlify.app');
        console.log('   Email: elastiquality@elastiquality.pt');
        console.log('   Senha: Empresa2025!');
        process.exit(0);
      }
    } else {
      // Passo 2: Criar usuário no auth.users ou buscar existente
      console.log('📋 Passo 2: Criando usuário no Supabase Auth...');
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          name: 'Elastiquality',
          first_name: 'Elastiquality',
          last_name: 'Portugal'
        }
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log('⚠️ Usuário já existe no Auth, buscando...');

          // Buscar usuário existente no Auth
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

          if (listError) {
            console.error('❌ ERRO ao listar usuários:', listError.message);
            process.exit(1);
          }

          const existingAuthUser = users.find(u => u.email === ADMIN_EMAIL);

          if (!existingAuthUser) {
            console.error('❌ ERRO: Usuário existe no Auth mas não foi encontrado na lista');
            process.exit(1);
          }

          console.log('✅ Usuário encontrado no Auth!');
          console.log(`   ID: ${existingAuthUser.id}`);
          console.log('');
          userId = existingAuthUser.id;
        } else {
          console.error('❌ ERRO ao criar usuário:', authError.message);
          process.exit(1);
        }
      } else {
        console.log('✅ Usuário criado no Auth!');
        console.log(`   ID: ${authUser.user.id}`);
        console.log('');
        userId = authUser.user.id;
      }

      // Passo 3: Inserir na tabela users (ou atualizar se já existe)
      console.log('📋 Passo 3: Inserindo/atualizando dados na tabela users...');
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: ADMIN_EMAIL,
          name: 'Elastiquality',
          first_name: 'Elastiquality',
          last_name: 'Portugal',
          phone: '+351000000000',
          user_type: 'professional',
          location_label: 'Portugal',
          is_admin: false, // Será definido como true no próximo passo
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (userError) {
        console.error('❌ ERRO ao inserir/atualizar usuário:', userError.message);
        process.exit(1);
      }

      console.log('✅ Dados inseridos/atualizados na tabela users!');
      console.log('');

      // Passo 4: Inserir na tabela professionals (ou atualizar se já existe)
      console.log('📋 Passo 4: Criando/atualizando perfil profissional...');
      const { error: profError } = await supabase
        .from('professionals')
        .upsert({
          id: userId,
          categories: ['all'], // Todas as categorias
          regions: ['all'], // Todas as regiões
          credits: 10000,
          rating: 5.0,
          review_count: 0
        }, {
          onConflict: 'id'
        });

      if (profError) {
        console.error('❌ ERRO ao criar/atualizar perfil profissional:', profError.message);
        process.exit(1);
      }

      console.log('✅ Perfil profissional criado/atualizado!');
      console.log('');
    }

    // Passo 5: Tornar admin
    console.log('📋 Passo 5: Tornando usuário admin...');
    const { error: adminError } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('id', userId);

    if (adminError) {
      console.error('❌ ERRO ao tornar admin:', adminError.message);
      process.exit(1);
    }

    console.log('✅ Usuário tornado admin com sucesso!');
    console.log('');

    // Passo 6: Verificar
    console.log('📋 Passo 6: Verificando...');
    const { data: finalUser, error: verifyError } = await supabase
      .from('users')
      .select('email, user_type, is_admin, created_at')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('❌ ERRO ao verificar:', verifyError.message);
      process.exit(1);
    }

    console.log('✅ Verificação concluída:');
    console.log(`   Email: ${finalUser.email}`);
    console.log(`   Tipo: ${finalUser.user_type}`);
    console.log(`   Admin: ${finalUser.is_admin}`);
    console.log(`   Criado em: ${new Date(finalUser.created_at).toLocaleString('pt-PT')}`);
    console.log('');

    if (finalUser.is_admin) {
      console.log('🎉 SUCESSO! Perfil Elastiquality criado e configurado como ADMIN!');
      console.log('');
      console.log('📱 Próximos passos:');
      console.log('   1. Acesse: https://dainty-gnome-5cbd33.netlify.app');
      console.log('   2. Faça login com:');
      console.log('      Email: elastiquality@elastiquality.pt');
      console.log('      Senha: Empresa2025!');
      console.log('   3. Você será redirecionado para o Dashboard Admin');
      console.log('');
      console.log('✅ O perfil tem acesso a:');
      console.log('   - TODAS as 51 categorias de serviços');
      console.log('   - TODAS as 20 regiões de Portugal');
      console.log('   - 10.000 créditos iniciais');
      console.log('   - Dashboard Admin completo');
    } else {
      console.error('❌ ERRO: Usuário ainda não é admin!');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ ERRO INESPERADO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar
criarETornarAdmin();

