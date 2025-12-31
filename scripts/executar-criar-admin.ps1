# Script PowerShell para criar perfil Elastiquality e tornar admin
# Execute: .\scripts\executar-criar-admin.ps1

Write-Host "🚀 Configurando variável de ambiente..." -ForegroundColor Cyan
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlc3dxd2hjY3FmYmR0bXl3emt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5OTA5NywiZXhwIjoyMDc4Mjc1MDk3fQ.XTmwe34gfw8y5cYFigM_P4hhxxuU16ZUUS-c2-T-XJc"

Write-Host "✅ Variável configurada!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Executando script Node.js..." -ForegroundColor Cyan
Write-Host ""

node scripts/criar-e-tornar-admin.js

Write-Host ""
Write-Host "✅ Processo concluído!" -ForegroundColor Green

