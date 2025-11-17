const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.qeswqwhccqfbdtmywzkz:Empresa2025!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

async function applyMigration() {
  const client = new Client({
    connectionString,
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado!');

    console.log('📝 Lendo arquivo de migração...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20241118_avatar_storage_policies.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Aplicando políticas de storage para avatar-images...');
    console.log('');

    // Executar o SQL completo
    await client.query(sql);

    console.log('✅ Migração aplicada com sucesso!');
    console.log('');
    console.log('📋 Políticas criadas:');
    console.log('   ✓ Avatar images are viewable by everyone (SELECT)');
    console.log('   ✓ Users can upload own avatar (INSERT)');
    console.log('   ✓ Users can update own avatar (UPDATE)');
    console.log('   ✓ Users can delete own avatar (DELETE)');
    console.log('');
    console.log('🎉 Agora os utilizadores podem fazer upload dos seus avatares!');
  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error.message);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
    if (error.detail) {
      console.error(`   Detalhes: ${error.detail}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
