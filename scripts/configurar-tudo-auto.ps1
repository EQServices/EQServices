# Script para configurar TUDO automaticamente via CLI
# Obtém o máximo possível e configura tudo

Write-Host "🚀 Configuração Automática Completa via CLI" -ForegroundColor Cyan
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host ""

$ProjectRef = "qeswqwhccqfbdtmywzkz"
$SupabaseUrl = "https://$ProjectRef.supabase.co"
$NetlifySite = "dainty-gnome-5cbd33"

Write-Host "📦 Configuração:" -ForegroundColor Yellow
Write-Host "   Supabase Project: $ProjectRef" -ForegroundColor White
Write-Host "   Supabase URL: $SupabaseUrl" -ForegroundColor White
Write-Host "   Netlify Site: $NetlifySite" -ForegroundColor White
Write-Host ""

# Obter chaves do Supabase via CLI
Write-Host "🔍 Obtendo chaves do Supabase via CLI..." -ForegroundColor Yellow
$apiKeysOutput = npx supabase projects api-keys --project-ref $ProjectRef 2>&1

# Extrair anon key
$anonKey = ""
if ($apiKeysOutput -match "anon.*\|.*(eyJ[^\s\|]+)") {
    $anonKey = $matches[1]
} elseif ($apiKeysOutput -match "eyJ[^\s\|]+") {
    $anonKey = ($apiKeysOutput | Select-String -Pattern "eyJ[^\s\|]+" -AllMatches).Matches[0].Value
}

if ($anonKey) {
    Write-Host "✅ Anon Key obtida!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Não foi possível obter Anon Key automaticamente" -ForegroundColor Yellow
    Write-Host "   Você precisará fornecer manualmente" -ForegroundColor Yellow
}

Write-Host ""

# Configurar Netlify
Write-Host "🌐 Configurando Variáveis no Netlify..." -ForegroundColor Yellow
Write-Host ""

# 1. Supabase URL
Write-Host "   Configurando EXPO_PUBLIC_SUPABASE_URL..." -ForegroundColor Gray
netlify env:set "EXPO_PUBLIC_SUPABASE_URL=$SupabaseUrl" --context production 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ EXPO_PUBLIC_SUPABASE_URL = $SupabaseUrl" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Já existe ou erro" -ForegroundColor Yellow
}

# 2. Supabase Anon Key (se obtida)
if ($anonKey) {
    Write-Host "   Configurando EXPO_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor Gray
    netlify env:set "EXPO_PUBLIC_SUPABASE_ANON_KEY=$anonKey" --context production 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ EXPO_PUBLIC_SUPABASE_ANON_KEY configurada!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Já existe ou erro" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️ EXPO_PUBLIC_SUPABASE_ANON_KEY precisa ser configurada manualmente" -ForegroundColor Yellow
    Write-Host "      Execute: netlify env:set EXPO_PUBLIC_SUPABASE_ANON_KEY='sua-chave' --context production" -ForegroundColor Gray
}

# 3. Stripe URLs
$stripeSuccessUrl = "https://$NetlifySite.netlify.app/checkout/sucesso"
$stripeCancelUrl = "https://$NetlifySite.netlify.app/checkout/cancelado"

Write-Host "   Configurando EXPO_PUBLIC_STRIPE_SUCCESS_URL..." -ForegroundColor Gray
netlify env:set "EXPO_PUBLIC_STRIPE_SUCCESS_URL=$stripeSuccessUrl" --context production 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ EXPO_PUBLIC_STRIPE_SUCCESS_URL = $stripeSuccessUrl" -ForegroundColor Green
}

Write-Host "   Configurando EXPO_PUBLIC_STRIPE_CANCEL_URL..." -ForegroundColor Gray
netlify env:set "EXPO_PUBLIC_STRIPE_CANCEL_URL=$stripeCancelUrl" --context production 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ EXPO_PUBLIC_STRIPE_CANCEL_URL = $stripeCancelUrl" -ForegroundColor Green
}

Write-Host ""

# Variáveis que precisam ser fornecidas
Write-Host "📝 Variáveis que precisam ser configuradas:" -ForegroundColor Yellow
Write-Host ""

# Stripe Publishable Key
Write-Host "🔧 EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY" -ForegroundColor Yellow
Write-Host "   💡 Obtenha em: https://dashboard.stripe.com/apikeys" -ForegroundColor Cyan
Write-Host "   💡 Use pk_live_... para produção ou pk_test_... para testes" -ForegroundColor Cyan
$stripePublishableKey = Read-Host "   Valor (ou Enter para pular)"

if (-not [string]::IsNullOrWhiteSpace($stripePublishableKey)) {
    Write-Host "   ⏳ Configurando..." -ForegroundColor Gray
    netlify env:set "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePublishableKey" --context production 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Configurada!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erro ao configurar" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️ Pulando..." -ForegroundColor Yellow
}

Write-Host ""

# Verificar secrets do Supabase
Write-Host "🗄️ Verificando Secrets do Supabase..." -ForegroundColor Yellow
Write-Host ""

$secretsList = npx supabase secrets list --project-ref $ProjectRef 2>&1 | Out-String

$hasStripeSecret = $secretsList -match "STRIPE_SECRET_KEY"
$hasWebhookSecret = $secretsList -match "STRIPE_WEBHOOK_SECRET"
$hasServiceRole = $secretsList -match "SUPABASE_SERVICE_ROLE_KEY"

if ($hasStripeSecret) {
    Write-Host "   ✅ STRIPE_SECRET_KEY já configurado" -ForegroundColor Green
} else {
    Write-Host "   ❌ STRIPE_SECRET_KEY faltando" -ForegroundColor Red
}

if ($hasWebhookSecret) {
    Write-Host "   ✅ STRIPE_WEBHOOK_SECRET já configurado" -ForegroundColor Green
} else {
    Write-Host "   ❌ STRIPE_WEBHOOK_SECRET faltando" -ForegroundColor Red
}

if ($hasServiceRole) {
    Write-Host "   ✅ SUPABASE_SERVICE_ROLE_KEY já configurado" -ForegroundColor Green
} else {
    Write-Host "   ❌ SUPABASE_SERVICE_ROLE_KEY faltando" -ForegroundColor Red
}

if (-not ($hasStripeSecret -and $hasWebhookSecret -and $hasServiceRole)) {
    Write-Host ""
    Write-Host "⚠️ Alguns secrets estão faltando. Deseja configurá-los agora? (S/N)" -ForegroundColor Yellow
    $configureSecrets = Read-Host
    
    if ($configureSecrets -eq "S" -or $configureSecrets -eq "s") {
        Write-Host ""
        
        $secretsToSet = @()
        
        if (-not $hasStripeSecret) {
            Write-Host "🔐 STRIPE_SECRET_KEY" -ForegroundColor Yellow
            Write-Host "   💡 Obtenha em: https://dashboard.stripe.com/apikeys (sk_live_... ou sk_test_...)" -ForegroundColor Cyan
            $value = Read-Host "   Valor"
            if (-not [string]::IsNullOrWhiteSpace($value)) {
                $secretsToSet += "STRIPE_SECRET_KEY=$value"
            }
        }
        
        if (-not $hasWebhookSecret) {
            Write-Host "🔐 STRIPE_WEBHOOK_SECRET" -ForegroundColor Yellow
            Write-Host "   💡 Obtenha em: https://dashboard.stripe.com/webhooks → Signing secret (whsec_...)" -ForegroundColor Cyan
            $value = Read-Host "   Valor"
            if (-not [string]::IsNullOrWhiteSpace($value)) {
                $secretsToSet += "STRIPE_WEBHOOK_SECRET=$value"
            }
        }
        
        if (-not $hasServiceRole) {
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
Write-Host "🚀 Próximo passo: Fazer novo deploy no Netlify" -ForegroundColor Yellow

