# Script PowerShell para configurar variáveis de ambiente no Netlify via CLI
# Execute: .\scripts\configurar-variaveis-netlify.ps1

Write-Host "🌐 Configurando Variáveis de Ambiente no Netlify" -ForegroundColor Cyan
Write-Host ""

# Verificar se está logado
Write-Host "📋 Verificando login no Netlify..." -ForegroundColor Yellow
$sites = netlify sites:list 2>&1

if ($LASTEXITCODE -ne 0 -or $sites -match "not logged in") {
    Write-Host "❌ Não está logado no Netlify CLI" -ForegroundColor Red
    Write-Host "🔐 Fazendo login..." -ForegroundColor Yellow
    netlify login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao fazer login. Execute manualmente: netlify login" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Login verificado" -ForegroundColor Green
Write-Host ""

# Listar sites disponíveis
Write-Host "📦 Sites disponíveis:" -ForegroundColor Cyan
netlify sites:list
Write-Host ""

$siteName = Read-Host "Digite o nome do site (ou pressione Enter para usar o site linkado)"

if ([string]::IsNullOrWhiteSpace($siteName)) {
    Write-Host "🔗 Usando site linkado..." -ForegroundColor Yellow
} else {
    Write-Host "📌 Usando site: $siteName" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📝 Configure as variáveis de ambiente:" -ForegroundColor Cyan
Write-Host ""

# Variáveis obrigatórias
$vars = @(
    @{Key="EXPO_PUBLIC_SUPABASE_URL"; Prompt="Supabase URL"; Example="https://qeswqwhccqfbdtmywzkz.supabase.co"},
    @{Key="EXPO_PUBLIC_SUPABASE_ANON_KEY"; Prompt="Supabase Anon Key"; Example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."},
    @{Key="EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"; Prompt="Stripe Publishable Key"; Example="pk_live_... ou pk_test_..."},
    @{Key="EXPO_PUBLIC_STRIPE_SUCCESS_URL"; Prompt="Stripe Success URL"; Example="https://dainty-gnome-5cbd33.netlify.app/checkout/sucesso"},
    @{Key="EXPO_PUBLIC_STRIPE_CANCEL_URL"; Prompt="Stripe Cancel URL"; Example="https://dainty-gnome-5cbd33.netlify.app/checkout/cancelado"}
)

# Variáveis opcionais
$optionalVars = @(
    @{Key="EXPO_PUBLIC_SENTRY_DSN"; Prompt="Sentry DSN (opcional)"; Example="https://xxx@xxx.ingest.sentry.io/xxx"},
    @{Key="EXPO_PUBLIC_SENTRY_ENABLED"; Prompt="Sentry Enabled (opcional)"; Example="true"}
)

$successCount = 0

# Configurar variáveis obrigatórias
foreach ($var in $vars) {
    Write-Host "🔧 $($var.Prompt)" -ForegroundColor Yellow
    Write-Host "   Exemplo: $($var.Example)" -ForegroundColor Gray
    $value = Read-Host "   Valor"
    
    if (-not [string]::IsNullOrWhiteSpace($value)) {
        if ([string]::IsNullOrWhiteSpace($siteName)) {
            $result = netlify env:set "$($var.Key)=$value" --context production 2>&1
        } else {
            $result = netlify env:set "$($var.Key)=$value" --site $siteName --context production 2>&1
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $($var.Key) configurada!" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ❌ Erro ao configurar $($var.Key)" -ForegroundColor Red
            Write-Host "   $result" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️ Valor vazio, pulando..." -ForegroundColor Yellow
    }
    Write-Host ""
}

# Perguntar sobre variáveis opcionais
Write-Host "💡 Deseja configurar variáveis opcionais (Sentry)? (S/N)" -ForegroundColor Cyan
$addOptional = Read-Host

if ($addOptional -eq "S" -or $addOptional -eq "s" -or $addOptional -eq "Y" -or $addOptional -eq "y") {
    foreach ($var in $optionalVars) {
        Write-Host "🔧 $($var.Prompt)" -ForegroundColor Yellow
        Write-Host "   Exemplo: $($var.Example)" -ForegroundColor Gray
        $value = Read-Host "   Valor (ou Enter para pular)"
        
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            if ([string]::IsNullOrWhiteSpace($siteName)) {
                $result = netlify env:set "$($var.Key)=$value" --context production 2>&1
            } else {
                $result = netlify env:set "$($var.Key)=$value" --site $siteName --context production 2>&1
            }
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ $($var.Key) configurada!" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "   ❌ Erro ao configurar $($var.Key)" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
}

Write-Host "📊 Resultado: $successCount variáveis configuradas" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Para verificar, execute: netlify env:list" -ForegroundColor Yellow

