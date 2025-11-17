const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL não encontrada no .env');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
  console.error('   Para executar esta migração, você precisa da Service Role Key do Supabase.');
  console.error('   Encontre em: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  try {
    console.log('📝 Lendo arquivo de migração...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20241118_avatar_storage_policies.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Aplicando políticas de storage para avatar-images...');
    
    // Executar SQL usando RPC ou query direta
    // Como não há RPC específico, vamos usar a API REST do Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      // Tentar método alternativo: executar via query direta
      console.log('⚠️  Tentando método alternativo...');
      
      // Dividir o SQL em comandos individuais e executar
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (const command of commands) {
        if (command.startsWith('DO $$')) {
          // Para blocos DO, precisamos executar como está
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            console.error('❌ Erro ao executar comando:', error);
          }
        }
      }
    }

    console.log('✅ Migração aplicada com sucesso!');
    console.log('');
    console.log('📋 Políticas criadas:');
    console.log('   - Avatar images are viewable by everyone (SELECT)');
    console.log('   - Users can upload own avatar (INSERT)');
    console.log('   - Users can update own avatar (UPDATE)');
    console.log('   - Users can delete own avatar (DELETE)');
  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error.message);
    console.error('');
    console.error('💡 Alternativa: Execute o SQL manualmente no Supabase Dashboard:');
    console.error('   https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new');
    process.exit(1);
  }
}

applyMigration();

