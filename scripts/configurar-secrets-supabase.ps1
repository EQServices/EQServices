# Script PowerShell para configurar secrets no Supabase via CLI
# Execute: .\scripts\configurar-secrets-supabase.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectRef = "qeswqwhccqfbdtmywzkz"
)

Write-Host "🗄️ Configurando Secrets no Supabase" -ForegroundColor Cyan
Write-Host ""

# Verificar se está logado
Write-Host "📋 Verificando login no Supabase..." -ForegroundColor Yellow
$projects = npx supabase projects list 2>&1

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
Write-Host "📦 Project Ref: $ProjectRef" -ForegroundColor Cyan
Write-Host ""

# Secrets obrigatórios
$secrets = @(
    @{Key="STRIPE_SECRET_KEY"; Prompt="Stripe Secret Key"; Example="sk_live_... ou sk_test_..."; Note="Obtenha em: https://dashboard.stripe.com/apikeys"},
    @{Key="STRIPE_WEBHOOK_SECRET"; Prompt="Stripe Webhook Secret"; Example="whsec_..."; Note="Obtenha em: https://dashboard.stripe.com/webhooks"},
    @{Key="SUPABASE_SERVICE_ROLE_KEY"; Prompt="Supabase Service Role Key"; Example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; Note="Obtenha em: Supabase Dashboard → Settings → API → service_role"}
)

# Secrets opcionais
$optionalSecrets = @(
    @{Key="SUPABASE_URL"; Prompt="Supabase URL (opcional)"; Example="https://qeswqwhccqfbdtmywzkz.supabase.co"}
)

$successCount = 0

# Configurar secrets obrigatórios
foreach ($secret in $secrets) {
    Write-Host "🔐 $($secret.Prompt)" -ForegroundColor Yellow
    Write-Host "   Exemplo: $($secret.Example)" -ForegroundColor Gray
    Write-Host "   💡 $($secret.Note)" -ForegroundColor Cyan
    $value = Read-Host "   Valor"
    
    if (-not [string]::IsNullOrWhiteSpace($value)) {
        Write-Host "   ⏳ Configurando..." -ForegroundColor Gray
        
        $result = npx supabase secrets set "$($secret.Key)=$value" --project-ref $ProjectRef 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $($secret.Key) configurado!" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ❌ Erro ao configurar $($secret.Key)" -ForegroundColor Red
            Write-Host "   $result" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️ Valor vazio, pulando..." -ForegroundColor Yellow
    }
    Write-Host ""
}

# Perguntar sobre secrets opcionais
Write-Host "💡 Deseja configurar SUPABASE_URL? (S/N)" -ForegroundColor Cyan
$addOptional = Read-Host

if ($addOptional -eq "S" -or $addOptional -eq "s" -or $addOptional -eq "Y" -or $addOptional -eq "y") {
    foreach ($secret in $optionalSecrets) {
        Write-Host "🔐 $($secret.Prompt)" -ForegroundColor Yellow
        Write-Host "   Exemplo: $($secret.Example)" -ForegroundColor Gray
        $value = Read-Host "   Valor (ou Enter para pular)"
        
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            $result = npx supabase secrets set "$($secret.Key)=$value" --project-ref $ProjectRef 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ $($secret.Key) configurado!" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "   ❌ Erro ao configurar $($secret.Key)" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
}

Write-Host "📊 Resultado: $successCount secrets configurados" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Para verificar, execute: npx supabase secrets list --project-ref $ProjectRef" -ForegroundColor Yellow

