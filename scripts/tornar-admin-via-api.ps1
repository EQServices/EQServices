# Script para tornar usuário admin via API do Supabase
# Requer: Service Role Key do Supabase

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectRef = "qeswqwhccqfbdtmywzkz",
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceRoleKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$UserEmail = "elastiquality@elastiquality.pt"
)

Write-Host "👤 Tornando usuário admin via API" -ForegroundColor Cyan
Write-Host ""

if (-not $ServiceRoleKey) {
    Write-Host "⚠️ Service Role Key não fornecida" -ForegroundColor Yellow
    Write-Host "💡 Para obter:" -ForegroundColor Cyan
    Write-Host "   1. Acesse: https://supabase.com/dashboard/project/$ProjectRef/settings/api" -ForegroundColor White
    Write-Host "   2. Copie a 'service_role' key (secret)" -ForegroundColor White
    Write-Host "   3. Execute: .\scripts\tornar-admin-via-api.ps1 -ServiceRoleKey 'sua-key-aqui'" -ForegroundColor White
    Write-Host ""
    $ServiceRoleKey = Read-Host "Cole a Service Role Key aqui"
    
    if (-not $ServiceRoleKey) {
        Write-Host "❌ Service Role Key é obrigatória" -ForegroundColor Red
        exit 1
    }
}

$SupabaseUrl = "https://$ProjectRef.supabase.co"
$Headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "📧 Email do usuário: $UserEmail" -ForegroundColor Yellow
Write-Host "⏳ Executando função make_user_admin..." -ForegroundColor Gray
Write-Host ""

# Executar função make_user_admin via RPC
$Body = @{
    user_email = $UserEmail
} | ConvertTo-Json

try {
    $Response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/make_user_admin" -Method Post -Headers $Headers -Body $Body -ErrorAction Stop
    Write-Host "✅ Usuário $UserEmail tornado admin com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Verificar se realmente foi tornado admin
    Write-Host "🔍 Verificando status do usuário..." -ForegroundColor Yellow
    $CheckBody = @{
        query = "SELECT id, email, is_admin FROM users WHERE email = '$UserEmail';"
    } | ConvertTo-Json
    
    $CheckHeaders = @{
        "apikey" = $ServiceRoleKey
        "Authorization" = "Bearer $ServiceRoleKey"
        "Content-Type" = "application/json"
    }
    
    try {
        $UserCheck = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/users?email=eq.$UserEmail&select=id,email,is_admin" -Method Get -Headers $CheckHeaders -ErrorAction Stop
        if ($UserCheck -and $UserCheck.Count -gt 0) {
            $user = $UserCheck[0]
            Write-Host "   ID: $($user.id)" -ForegroundColor White
            Write-Host "   Email: $($user.email)" -ForegroundColor White
            Write-Host "   Admin: $($user.is_admin)" -ForegroundColor $(if ($user.is_admin) { "Green" } else { "Red" })
        }
    } catch {
        Write-Host "   ⚠️ Não foi possível verificar o status (mas a operação pode ter sido bem-sucedida)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Erro ao tornar usuário admin" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails) {
            Write-Host "   Detalhes: $($errorDetails.message)" -ForegroundColor Red
        } else {
            Write-Host "   Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "💡 Alternativas:" -ForegroundColor Yellow
    Write-Host "   1. Execute manualmente no SQL Editor do Supabase:" -ForegroundColor White
    Write-Host "      SELECT make_user_admin('$UserEmail');" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   2. Ou atualize diretamente:" -ForegroundColor White
    Write-Host "      UPDATE users SET is_admin = TRUE WHERE email = '$UserEmail';" -ForegroundColor Cyan
    
    exit 1
}

Write-Host ""
Write-Host "✅ Concluído!" -ForegroundColor Green

