# Script rápido para configurar variáveis via CLI
# Usa o projeto Netlify linkado automaticamente

Write-Host "🚀 Configuração Rápida de Variáveis de Ambiente" -ForegroundColor Cyan
Write-Host ""

# Verificar projeto linkado
Write-Host "📦 Projeto Netlify linkado: dainty-gnome-5cbd33" -ForegroundColor Green
Write-Host "📦 Project Ref Supabase: qeswqwhccqfbdtmywzkz" -ForegroundColor Green
Write-Host ""

# Verificar se existe arquivo .env.production
if (Test-Path ".env.production") {
    Write-Host "💡 Arquivo .env.production encontrado!" -ForegroundColor Yellow
    Write-Host "Deseja importar variáveis do arquivo? (S/N)" -ForegroundColor Cyan
    $import = Read-Host
    
    if ($import -eq "S" -or $import -eq "s") {
        Write-Host "📥 Importando variáveis do .env.production..." -ForegroundColor Yellow
        netlify env:import .env.production
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Variáveis importadas do arquivo!" -ForegroundColor Green
            Write-Host ""
            Write-Host "💡 Verifique: netlify env:list" -ForegroundColor Yellow
            exit 0
        }
    }
}

Write-Host "📝 Configure as variáveis manualmente:" -ForegroundColor Cyan
Write-Host ""

# Netlify - Variáveis obrigatórias
Write-Host "🌐 NETLIFY (Variáveis Públicas)" -ForegroundColor Yellow
Write-Host ""

$netlifyVars = @(
    @{Key="EXPO_PUBLIC_SUPABASE_URL"; Value=""; Default="https://qeswqwhccqfbdtmywzkz.supabase.co"},
    @{Key="EXPO_PUBLIC_SUPABASE_ANON_KEY"; Value=""; Default=""},
    @{Key="EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"; Value=""; Default=""},
    @{Key="EXPO_PUBLIC_STRIPE_SUCCESS_URL"; Value=""; Default="https://dainty-gnome-5cbd33.netlify.app/checkout/sucesso"},
    @{Key="EXPO_PUBLIC_STRIPE_CANCEL_URL"; Value=""; Default="https://dainty-gnome-5cbd33.netlify.app/checkout/cancelado"}
)

foreach ($var in $netlifyVars) {
    Write-Host "🔧 $($var.Key)" -ForegroundColor Yellow
    if ($var.Default) {
        Write-Host "   Padrão: $($var.Default)" -ForegroundColor Gray
        $value = Read-Host "   Valor (Enter para usar padrão)"
        if ([string]::IsNullOrWhiteSpace($value)) {
            $value = $var.Default
        }
    } else {
        $value = Read-Host "   Valor"
    }
    
    if (-not [string]::IsNullOrWhiteSpace($value)) {
        Write-Host "   ⏳ Configurando..." -ForegroundColor Gray
        netlify env:set "$($var.Key)=$value" --context production | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Configurada!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erro ao configurar" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Supabase - Secrets
Write-Host "🗄️ SUPABASE (Secrets)" -ForegroundColor Yellow
Write-Host ""

$supabaseSecrets = @(
    @{Key="STRIPE_SECRET_KEY"; Prompt="Stripe Secret Key (sk_live_... ou sk_test_...)"},
    @{Key="STRIPE_WEBHOOK_SECRET"; Prompt="Stripe Webhook Secret (whsec_...)"},
    @{Key="SUPABASE_SERVICE_ROLE_KEY"; Prompt="Supabase Service Role Key"}
)

$secretsToSet = @()

foreach ($secret in $supabaseSecrets) {
    Write-Host "🔐 $($secret.Prompt)" -ForegroundColor Yellow
    $value = Read-Host "   Valor"
    
    if (-not [string]::IsNullOrWhiteSpace($value)) {
        $secretsToSet += "$($secret.Key)=$value"
    }
    Write-Host ""
}

if ($secretsToSet.Count -gt 0) {
    Write-Host "⏳ Configurando secrets no Supabase..." -ForegroundColor Yellow
    $secretsString = $secretsToSet -join " "
    npx supabase secrets set $secretsString --project-ref qeswqwhccqfbdtmywzkz
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Secrets configurados!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao configurar secrets" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Verificar configuração:" -ForegroundColor Cyan
Write-Host "  netlify env:list" -ForegroundColor White
Write-Host "  npx supabase secrets list --project-ref qeswqwhccqfbdtmywzkz" -ForegroundColor White

