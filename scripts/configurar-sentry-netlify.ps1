# Script para configurar Sentry no Netlify
# Execute: .\scripts\configurar-sentry-netlify.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$SentryDsn = "https://1f64e493ce8a3698166ea7d0300f05e1@o4510460187705344.ingest.de.sentry.io/4510460190523472"
)

Write-Host "🐛 Configurando Sentry no Netlify" -ForegroundColor Cyan
Write-Host ""

# Verificar se Netlify CLI está instalado
if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Netlify CLI não encontrado." -ForegroundColor Red
    Write-Host "💡 Instale com: npm install -g netlify-cli" -ForegroundColor Yellow
    Write-Host "💡 Ou configure manualmente no Netlify Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://app.netlify.com/sites/dainty-gnome-5cbd33/settings/deploys#environment-variables" -ForegroundColor White
    Write-Host "   2. Adicione:" -ForegroundColor White
    Write-Host "      EXPO_PUBLIC_SENTRY_DSN = $SentryDsn" -ForegroundColor Gray
    Write-Host "      EXPO_PUBLIC_SENTRY_ENABLED = true" -ForegroundColor Gray
    exit 1
}

Write-Host "📝 Configurando variáveis de ambiente..." -ForegroundColor Yellow
Write-Host ""

# Tentar configurar via CLI
try {
    Write-Host "🔧 Adicionando EXPO_PUBLIC_SENTRY_DSN..." -ForegroundColor Yellow
    netlify env:set EXPO_PUBLIC_SENTRY_DSN "$SentryDsn" --context production
    
    Write-Host "🔧 Adicionando EXPO_PUBLIC_SENTRY_ENABLED..." -ForegroundColor Yellow
    netlify env:set EXPO_PUBLIC_SENTRY_ENABLED "true" --context production
    
    Write-Host ""
    Write-Host "✅ Variáveis configuradas com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Variáveis configuradas:" -ForegroundColor Cyan
    Write-Host "   EXPO_PUBLIC_SENTRY_DSN = $SentryDsn" -ForegroundColor White
    Write-Host "   EXPO_PUBLIC_SENTRY_ENABLED = true" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Faça um novo deploy no Netlify" -ForegroundColor White
    Write-Host "   2. Verifique se o Sentry está capturando erros" -ForegroundColor White
    Write-Host "   3. Acesse: https://sentry.io para ver os erros" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "⚠️ Erro ao configurar via CLI. Configure manualmente:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Acesse: https://app.netlify.com/sites/dainty-gnome-5cbd33/settings/deploys#environment-variables" -ForegroundColor White
    Write-Host "2. Adicione as seguintes variáveis:" -ForegroundColor White
    Write-Host "   EXPO_PUBLIC_SENTRY_DSN = $SentryDsn" -ForegroundColor Gray
    Write-Host "   EXPO_PUBLIC_SENTRY_ENABLED = true" -ForegroundColor Gray
    Write-Host "3. Faça um novo deploy" -ForegroundColor White
}

Write-Host ""

