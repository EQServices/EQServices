# Script PowerShell completo para configurar todas as variáveis via CLI
# Execute: .\scripts\configurar-tudo-via-cli.ps1

Write-Host "🚀 Configuração Completa de Variáveis de Ambiente via CLI" -ForegroundColor Cyan
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host ""

# Parte 1: Netlify
Write-Host "📋 PARTE 1: Configurar Variáveis no Netlify" -ForegroundColor Yellow
Write-Host ""
Write-Host "Deseja configurar variáveis no Netlify agora? (S/N)" -ForegroundColor Cyan
$configureNetlify = Read-Host

if ($configureNetlify -eq "S" -or $configureNetlify -eq "s" -or $configureNetlify -eq "Y" -or $configureNetlify -eq "y") {
    Write-Host ""
    Write-Host "Executando script do Netlify..." -ForegroundColor Yellow
    & ".\scripts\configurar-variaveis-netlify.ps1"
    Write-Host ""
} else {
    Write-Host "⏭️ Pulando configuração do Netlify" -ForegroundColor Yellow
    Write-Host ""
}

# Parte 2: Supabase
Write-Host "📋 PARTE 2: Configurar Secrets no Supabase" -ForegroundColor Yellow
Write-Host ""
Write-Host "Deseja configurar secrets no Supabase agora? (S/N)" -ForegroundColor Cyan
$configureSupabase = Read-Host

if ($configureSupabase -eq "S" -or $configureSupabase -eq "s" -or $configureSupabase -eq "Y" -or $configureSupabase -eq "y") {
    Write-Host ""
    Write-Host "Executando script do Supabase..." -ForegroundColor Yellow
    & ".\scripts\configurar-secrets-supabase.ps1"
    Write-Host ""
} else {
    Write-Host "⏭️ Pulando configuração do Supabase" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Fazer novo deploy no Netlify para aplicar variáveis" -ForegroundColor White
Write-Host "2. Testar se tudo está funcionando" -ForegroundColor White
Write-Host "3. Verificar logs se houver erros" -ForegroundColor White

