# Script para executar todas as migrations SQL no Supabase via API
# Execute: .\scripts\executar-todas-migrations.ps1

$ProjectRef = "qeswqwhccqfbdtmywzkz"
$SupabaseUrl = "https://$ProjectRef.supabase.co"

Write-Host "🗄️ Executando Migrations SQL no Supabase" -ForegroundColor Cyan
Write-Host "Project Ref: $ProjectRef" -ForegroundColor Yellow
Write-Host ""

# Ler os arquivos SQL
$migrations = @(
    @{File="database/migrations/001_production_indexes.sql"; Name="Índices de Produção"},
    @{File="database/migrations/002_rate_limiting.sql"; Name="Rate Limiting"},
    @{File="database/migrations/003_audit_logs.sql"; Name="Audit Logs"}
)

Write-Host "📋 Migrations encontradas:" -ForegroundColor Cyan
foreach ($migration in $migrations) {
    Write-Host "   - $($migration.Name)" -ForegroundColor White
}
Write-Host ""

Write-Host "⚠️ IMPORTANTE: Este script não pode executar SQL diretamente via API." -ForegroundColor Yellow
Write-Host "   Você precisa executar manualmente no Supabase SQL Editor." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Instruções:" -ForegroundColor Cyan
Write-Host "   1. Acesse: https://supabase.com/dashboard/project/$ProjectRef/sql/new" -ForegroundColor White
Write-Host "   2. Copie e cole o conteúdo de cada arquivo SQL" -ForegroundColor White
Write-Host "   3. Execute cada script separadamente" -ForegroundColor White
Write-Host ""

foreach ($migration in $migrations) {
    if (Test-Path $migration.File) {
        Write-Host "📄 $($migration.Name)" -ForegroundColor Yellow
        Write-Host "   Arquivo: $($migration.File)" -ForegroundColor Gray
        Write-Host "   Conteúdo:" -ForegroundColor Gray
        Write-Host ""
        Get-Content $migration.File | Select-Object -First 5 | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGray }
        Write-Host "   ... (resto do arquivo)" -ForegroundColor DarkGray
        Write-Host ""
    } else {
        Write-Host "❌ Arquivo não encontrado: $($migration.File)" -ForegroundColor Red
    }
}

Write-Host "✅ Script concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Dica: Use o script executar-migrations-producao.ps1 para executar via Supabase CLI" -ForegroundColor Cyan

