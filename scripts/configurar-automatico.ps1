# Script para configurar variáveis automaticamente via CLI
# Tenta obter o máximo possível e pede apenas o que falta

Write-Host "🚀 Configuração Automática de Variáveis de Ambiente" -ForegroundColor Cyan
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host ""

$ProjectRef = "qeswqwhccqfbdtmywzkz"
$SupabaseUrl = "https://$ProjectRef.supabase.co"
$NetlifySite = "dainty-gnome-5cbd33"

Write-Host "📦 Configuração Detectada:" -ForegroundColor Yellow
Write-Host "   Supabase Project: $ProjectRef" -ForegroundColor White
Write-Host "   Supabase URL: $SupabaseUrl" -ForegroundColor White
Write-Host "   Netlify Site: $NetlifySite" -ForegroundColor White
Write-Host ""

# Verificar secrets do Supabase
Write-Host "🔍 Verificando secrets do Supabase..." -ForegroundColor Yellow
$supabaseSecrets = npx supabase secrets list --project-ref $ProjectRef 2>&1

if ($supabaseSecrets -match "STRIPE_SECRET_KEY" -and $supabaseSecrets -match "STRIPE_WEBHOOK_SECRET" -and $supabaseSecrets -match "SUPABASE_SERVICE_ROLE_KEY") {
    Write-Host "✅ Secrets do Supabase já configurados!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Alguns secrets do Supabase estão faltando" -ForegroundColor Yellow
}

Write-Host ""

# Configurar variáveis do Netlify
Write-Host "🌐 Configurando Variáveis no Netlify..." -ForegroundColor Yellow
Write-Host ""

# Variáveis que podemos definir automaticamente
Write-Host "📝 Configurando variáveis conhecidas..." -ForegroundColor Cyan

# 1. Supabase URL (já sabemos)
Write-Host "   ✅ EXPO_PUBLIC_SUPABASE_URL = $SupabaseUrl" -ForegroundColor Gray
netlify env:set "EXPO_PUBLIC_SUPABASE_URL=$SupabaseUrl" --context production 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Configurada!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Já existe ou erro" -ForegroundColor Yellow
}

# 2. URLs do Stripe (podemos definir com o domínio do Netlify)
$stripeSuccessUrl = "https://$NetlifySite.netlify.app/checkout/sucesso"
$stripeCancelUrl = "https://$NetlifySite.netlify.app/checkout/cancelado"

Write-Host "   ✅ EXPO_PUBLIC_STRIPE_SUCCESS_URL = $stripeSuccessUrl" -ForegroundColor Gray
netlify env:set "EXPO_PUBLIC_STRIPE_SUCCESS_URL=$stripeSuccessUrl" --context production 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Configurada!" -ForegroundColor Green
}

Write-Host "   ✅ EXPO_PUBLIC_STRIPE_CANCEL_URL = $stripeCancelUrl" -ForegroundColor Gray
netlify env:set "EXPO_PUBLIC_STRIPE_CANCEL_URL=$stripeCancelUrl" --context production 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Configurada!" -ForegroundColor Green
}

Write-Host ""

# Variáveis que precisam ser fornecidas pelo usuário
Write-Host "📝 Variáveis que precisam ser configuradas manualmente:" -ForegroundColor Yellow
Write-Host ""

$varsToConfigure = @(
    @{Key="EXPO_PUBLIC_SUPABASE_ANON_KEY"; Prompt="Supabase Anon Key"; Note="Obtenha em: https://supabase.com/dashboard/project/$ProjectRef/settings/api"},
    @{Key="EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"; Prompt="Stripe Publishable Key"; Note="Obtenha em: https://dashboard.stripe.com/apikeys (pk_live_... ou pk_test_...)"}
)

foreach ($var in $varsToConfigure) {
    Write-Host "🔧 $($var.Key)" -ForegroundColor Yellow
    Write-Host "   💡 $($var.Note)" -ForegroundColor Cyan
    $value = Read-Host "   Valor"
    
    if (-not [string]::IsNullOrWhiteSpace($value)) {
        Write-Host "   ⏳ Configurando..." -ForegroundColor Gray
        netlify env:set "$($var.Key)=$value" --context production 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Configurada!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erro ao configurar" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️ Valor vazio, pulando..." -ForegroundColor Yellow
    }
    Write-Host ""
}

# Variáveis opcionais
Write-Host "💡 Deseja configurar Sentry? (S/N)" -ForegroundColor Cyan
$addSentry = Read-Host

if ($addSentry -eq "S" -or $addSentry -eq "s") {
    Write-Host "🔧 EXPO_PUBLIC_SENTRY_DSN" -ForegroundColor Yellow
    Write-Host "   💡 Obtenha em: https://sentry.io → Settings → Projects → Client Keys" -ForegroundColor Cyan
    $sentryDsn = Read-Host "   Valor (ou Enter para pular)"
    
    if (-not [string]::IsNullOrWhiteSpace($sentryDsn)) {
        netlify env:set "EXPO_PUBLIC_SENTRY_DSN=$sentryDsn" --context production 2>&1 | Out-Null
        netlify env:set "EXPO_PUBLIC_SENTRY_ENABLED=true" --context production 2>&1 | Out-Null
        Write-Host "   ✅ Sentry configurado!" -ForegroundColor Green
    }
    Write-Host ""
}

Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host "✅ Configuração do Netlify concluída!" -ForegroundColor Green
Write-Host ""

# Verificar secrets do Supabase
Write-Host "🗄️ Verificando Secrets do Supabase..." -ForegroundColor Yellow
Write-Host ""

$secretsList = npx supabase secrets list --project-ref $ProjectRef 2>&1

$requiredSecrets = @("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SUPABASE_SERVICE_ROLE_KEY")
$missingSecrets = @()

foreach ($secret in $requiredSecrets) {
    if ($secretsList -match $secret) {
        Write-Host "   ✅ $secret já configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $secret faltando" -ForegroundColor Red
        $missingSecrets += $secret
    }
}

if ($missingSecrets.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Alguns secrets estão faltando. Deseja configurá-los agora? (S/N)" -ForegroundColor Yellow
    $configureSecrets = Read-Host
    
    if ($configureSecrets -eq "S" -or $configureSecrets -eq "s") {
        Write-Host ""
        
        $secretsToSet = @()
        
        if ($missingSecrets -contains "STRIPE_SECRET_KEY") {
            Write-Host "🔐 STRIPE_SECRET_KEY" -ForegroundColor Yellow
            Write-Host "   💡 Obtenha em: https://dashboard.stripe.com/apikeys (sk_live_... ou sk_test_...)" -ForegroundColor Cyan
            $value = Read-Host "   Valor"
            if (-not [string]::IsNullOrWhiteSpace($value)) {
                $secretsToSet += "STRIPE_SECRET_KEY=$value"
            }
        }
        
        if ($missingSecrets -contains "STRIPE_WEBHOOK_SECRET") {
            Write-Host "🔐 STRIPE_WEBHOOK_SECRET" -ForegroundColor Yellow
            Write-Host "   💡 Obtenha em: https://dashboard.stripe.com/webhooks → Signing secret (whsec_...)" -ForegroundColor Cyan
            $value = Read-Host "   Valor"
            if (-not [string]::IsNullOrWhiteSpace($value)) {
                $secretsToSet += "STRIPE_WEBHOOK_SECRET=$value"
            }
        }
        
        if ($missingSecrets -contains "SUPABASE_SERVICE_ROLE_KEY") {
            Write-Host "🔐 SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
            Write-Host "   💡 Obtenha em: https://supabase.com/dashboard/project/$ProjectRef/settings/api → service_role" -ForegroundColor Cyan
            $value = Read-Host "   Valor"
            if (-not [string]::IsNullOrWhiteSpace($value)) {
                $secretsToSet += "SUPABASE_SERVICE_ROLE_KEY=$value"
            }
        }
        
        if ($secretsToSet.Count -gt 0) {
            Write-Host ""
            Write-Host "⏳ Configurando secrets..." -ForegroundColor Yellow
            $secretsString = $secretsToSet -join " "
            npx supabase secrets set $secretsString --project-ref $ProjectRef
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Secrets configurados!" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host ""
    Write-Host "✅ Todos os secrets do Supabase estão configurados!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host "🎉 Configuração Completa!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Verificar configuração:" -ForegroundColor Cyan
Write-Host "   netlify env:list" -ForegroundColor White
Write-Host "   npx supabase secrets list --project-ref $ProjectRef" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Próximo passo: Fazer novo deploy no Netlify para aplicar as variáveis" -ForegroundColor Yellow
