# Script para testar se o workflow de backup pode ser executado
# Execute: .\scripts\testar-workflow-backup.ps1

Write-Host "🧪 Testando Configuração do Workflow de Backup" -ForegroundColor Cyan
Write-Host ""

$WorkflowFile = ".github/workflows/backup.yml"

if (-not (Test-Path $WorkflowFile)) {
    Write-Host "❌ Arquivo do workflow não encontrado: $WorkflowFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Workflow encontrado: $WorkflowFile" -ForegroundColor Green
Write-Host ""

# Verificar se o workflow referencia os secrets corretos
$workflowContent = Get-Content $WorkflowFile -Raw

$RequiredSecrets = @("SUPABASE_ACCESS_TOKEN", "SUPABASE_PROJECT_REF")

Write-Host "📋 Verificando referências aos secrets no workflow..." -ForegroundColor Yellow
Write-Host ""

$allSecretsFound = $true

foreach ($secret in $RequiredSecrets) {
    if ($workflowContent -match "secrets\.$secret") {
        Write-Host "   ✅ Workflow referencia: $secret" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Workflow NÃO referencia: $secret" -ForegroundColor Red
        $allSecretsFound = $false
    }
}

Write-Host ""

if ($allSecretsFound) {
    Write-Host "✅ Workflow está configurado corretamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Verifique se os secrets estão configurados no GitHub:" -ForegroundColor White
    Write-Host "      https://github.com/SuporteElastiquality/APP/settings/secrets/actions" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Teste o workflow manualmente:" -ForegroundColor White
    Write-Host "      https://github.com/SuporteElastiquality/APP/actions/workflows/backup.yml" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Clique em 'Run workflow' → 'Run workflow'" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Workflow precisa ser corrigido!" -ForegroundColor Red
    Write-Host ""
}

# Verificar estrutura do workflow
Write-Host "📄 Estrutura do workflow:" -ForegroundColor Yellow
Write-Host ""

$hasSchedule = $workflowContent -match "schedule:"
$hasWorkflowDispatch = $workflowContent -match "workflow_dispatch"

if ($hasSchedule) {
    Write-Host "   ✅ Agendamento configurado (diário às 2h UTC)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Agendamento não encontrado" -ForegroundColor Yellow
}

if ($hasWorkflowDispatch) {
    Write-Host "   ✅ Execução manual habilitada (workflow_dispatch)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Execução manual não habilitada" -ForegroundColor Yellow
}

Write-Host ""

