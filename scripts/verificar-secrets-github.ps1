# Script para verificar se os secrets do GitHub estão configurados
# Execute: .\scripts\verificar-secrets-github.ps1

Write-Host "🔍 Verificando Secrets do GitHub para Backups" -ForegroundColor Cyan
Write-Host ""

$RequiredSecrets = @(
    @{Name="SUPABASE_ACCESS_TOKEN"; Description="Token de acesso do Supabase"},
    @{Name="SUPABASE_PROJECT_REF"; Description="ID do projeto Supabase (deve ser: qeswqwhccqfbdtmywzkz)"}
)

Write-Host "📋 Secrets necessários:" -ForegroundColor Yellow
foreach ($secret in $RequiredSecrets) {
    Write-Host "   - $($secret.Name): $($secret.Description)" -ForegroundColor White
}
Write-Host ""

Write-Host "⚠️ IMPORTANTE: Para verificar os secrets, você precisa:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opção 1: Via GitHub Web Interface" -ForegroundColor Cyan
Write-Host "   1. Acesse: https://github.com/SuporteElastiquality/APP/settings/secrets/actions" -ForegroundColor White
Write-Host "   2. Verifique se os seguintes secrets existem:" -ForegroundColor White
foreach ($secret in $RequiredSecrets) {
    Write-Host "      ✅ $($secret.Name)" -ForegroundColor Green
}
Write-Host ""

Write-Host "Opção 2: Via GitHub CLI (se instalado)" -ForegroundColor Cyan
Write-Host "   Execute: gh secret list" -ForegroundColor White
Write-Host ""

Write-Host "Opção 3: Testar o Workflow" -ForegroundColor Cyan
Write-Host "   1. Acesse: https://github.com/SuporteElastiquality/APP/actions" -ForegroundColor White
Write-Host "   2. Clique em 'Database Backup'" -ForegroundColor White
Write-Host "   3. Clique em 'Run workflow' → 'Run workflow'" -ForegroundColor White
Write-Host "   4. Verifique se executa com sucesso" -ForegroundColor White
Write-Host ""

Write-Host "📄 Verificando arquivo do workflow..." -ForegroundColor Yellow
if (Test-Path ".github/workflows/backup.yml") {
    Write-Host "   ✅ Workflow encontrado: .github/workflows/backup.yml" -ForegroundColor Green
    
    $workflowContent = Get-Content ".github/workflows/backup.yml" -Raw
    
    foreach ($secret in $RequiredSecrets) {
        if ($workflowContent -match $secret.Name) {
            Write-Host "   ✅ Workflow referencia: $($secret.Name)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Workflow NÃO referencia: $($secret.Name)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ Workflow não encontrado!" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Dica: Se os secrets não estiverem configurados, siga o guia:" -ForegroundColor Cyan
Write-Host "   GUIA_CONFIGURAR_GITHUB_SECRETS.md" -ForegroundColor White
Write-Host ""

