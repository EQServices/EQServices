# Script PowerShell para executar migrations de produção no Supabase via CLI
# Execute: .\scripts\executar-migrations-producao.ps1

Write-Host "🚀 Executando Migrations de Produção no Supabase" -ForegroundColor Cyan
Write-Host ""

# Verificar se está logado
Write-Host "📋 Verificando login no Supabase..." -ForegroundColor Yellow
$loginCheck = npx supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Não está logado no Supabase CLI" -ForegroundColor Red
    Write-Host "🔐 Fazendo login..." -ForegroundColor Yellow
    npx supabase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao fazer login. Execute manualmente: npx supabase login" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Login verificado" -ForegroundColor Green
Write-Host ""

# Ler project-ref
$projectRef = Get-Content -Path "supabase\.temp\project-ref" -ErrorAction SilentlyContinue

if (-not $projectRef) {
    Write-Host "⚠️ Project-ref não encontrado. Informe o project-ref do Supabase:" -ForegroundColor Yellow
    $projectRef = Read-Host "Project Ref"
}

Write-Host "📦 Project Ref: $projectRef" -ForegroundColor Cyan
Write-Host ""

# Executar migrations
$migrations = @(
    "database\migrations\001_production_indexes.sql",
    "database\migrations\002_rate_limiting.sql",
    "database\migrations\003_audit_logs.sql"
)

foreach ($migration in $migrations) {
    if (Test-Path $migration) {
        Write-Host "📄 Executando: $migration" -ForegroundColor Yellow
        $sqlContent = Get-Content -Path $migration -Raw
        
        # Executar via Supabase CLI
        $sqlContent | npx supabase db execute --project-ref $projectRef
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $migration executado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro ao executar $migration" -ForegroundColor Red
            Write-Host "💡 Tente executar manualmente no SQL Editor do Supabase" -ForegroundColor Yellow
        }
        Write-Host ""
    } else {
        Write-Host "⚠️ Arquivo não encontrado: $migration" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique as tabelas no Supabase Table Editor" -ForegroundColor White
Write-Host "2. Verifique se rate_limits e audit_logs foram criadas" -ForegroundColor White

