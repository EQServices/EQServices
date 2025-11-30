#!/bin/bash
# Script Bash para executar migrations de produção no Supabase via CLI
# Execute: bash scripts/executar-migrations-producao.sh

echo "🚀 Executando Migrations de Produção no Supabase"
echo ""

# Verificar se está logado
echo "📋 Verificando login no Supabase..."
if ! npx supabase projects list > /dev/null 2>&1; then
    echo "❌ Não está logado no Supabase CLI"
    echo "🔐 Fazendo login..."
    npx supabase login
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao fazer login. Execute manualmente: npx supabase login"
        exit 1
    fi
fi

echo "✅ Login verificado"
echo ""

# Ler project-ref
PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null)

if [ -z "$PROJECT_REF" ]; then
    echo "⚠️ Project-ref não encontrado. Informe o project-ref do Supabase:"
    read -p "Project Ref: " PROJECT_REF
fi

echo "📦 Project Ref: $PROJECT_REF"
echo ""

# Executar migrations
MIGRATIONS=(
    "database/migrations/001_production_indexes.sql"
    "database/migrations/002_rate_limiting.sql"
    "database/migrations/003_audit_logs.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    if [ -f "$migration" ]; then
        echo "📄 Executando: $migration"
        cat "$migration" | npx supabase db execute --project-ref "$PROJECT_REF"
        
        if [ $? -eq 0 ]; then
            echo "✅ $migration executado com sucesso!"
        else
            echo "❌ Erro ao executar $migration"
            echo "💡 Tente executar manualmente no SQL Editor do Supabase"
        fi
        echo ""
    else
        echo "⚠️ Arquivo não encontrado: $migration"
    fi
done

echo "🎉 Concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique as tabelas no Supabase Table Editor"
echo "2. Verifique se rate_limits e audit_logs foram criadas"

