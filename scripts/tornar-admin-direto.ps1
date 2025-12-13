# Script para tornar usuário admin diretamente via UPDATE SQL
# Requer: Service Role Key do Supabase

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectRef = "qeswqwhccqfbdtmywzkz",
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceRoleKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$UserEmail = "elastiquality@elastiquality.pt"
)

Write-Host "👤 Tornando usuário admin diretamente" -ForegroundColor Cyan
Write-Host ""

if (-not $ServiceRoleKey) {
    Write-Host "⚠️ Service Role Key não fornecida" -ForegroundColor Yellow
    Write-Host "💡 Para obter:" -ForegroundColor Cyan
    Write-Host "   1. Acesse: https://supabase.com/dashboard/project/$ProjectRef/settings/api" -ForegroundColor White
    Write-Host "   2. Copie a 'service_role' key (secret)" -ForegroundColor White
    Write-Host "   3. Execute: .\scripts\tornar-admin-direto.ps1 -ServiceRoleKey 'sua-key-aqui'" -ForegroundColor White
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
Write-Host "⏳ Atualizando campo is_admin..." -ForegroundColor Gray
Write-Host ""

# Primeiro, verificar se o usuário existe
Write-Host "🔍 Verificando se usuário existe..." -ForegroundColor Yellow
try {
    $UserCheck = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/users?email=eq.$UserEmail&select=id,email,is_admin" -Method Get -Headers $Headers -ErrorAction Stop
    
    if (-not $UserCheck -or $UserCheck.Count -eq 0) {
        Write-Host "❌ Usuário com email $UserEmail não encontrado!" -ForegroundColor Red
        Write-Host "💡 Verifique se o email está correto" -ForegroundColor Yellow
        exit 1
    }
    
    $user = $UserCheck[0]
    Write-Host "   ✅ Usuário encontrado:" -ForegroundColor Green
    Write-Host "      ID: $($user.id)" -ForegroundColor White
    Write-Host "      Email: $($user.email)" -ForegroundColor White
    Write-Host "      Admin atual: $($user.is_admin)" -ForegroundColor White
    Write-Host ""
    
    if ($user.is_admin -eq $true) {
        Write-Host "ℹ️ Usuário já é admin!" -ForegroundColor Cyan
        exit 0
    }
    
} catch {
    Write-Host "⚠️ Não foi possível verificar usuário via REST API" -ForegroundColor Yellow
    Write-Host "   Continuando com atualização direta..." -ForegroundColor Gray
    Write-Host ""
}

# Atualizar usando PATCH
Write-Host "🔄 Atualizando is_admin para TRUE..." -ForegroundColor Yellow
try {
    $UpdateBody = @{
        is_admin = $true
    } | ConvertTo-Json
    
    $Response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/users?email=eq.$UserEmail" -Method PATCH -Headers $Headers -Body $UpdateBody -ErrorAction Stop
    
    Write-Host "✅ Usuário $UserEmail tornado admin com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Verificar novamente
    Write-Host "🔍 Verificando atualização..." -ForegroundColor Yellow
    $FinalCheck = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/users?email=eq.$UserEmail&select=id,email,is_admin" -Method Get -Headers $Headers -ErrorAction Stop
    
    if ($FinalCheck -and $FinalCheck.Count -gt 0) {
        $finalUser = $FinalCheck[0]
        Write-Host "   ✅ Confirmação:" -ForegroundColor Green
        Write-Host "      ID: $($finalUser.id)" -ForegroundColor White
        Write-Host "      Email: $($finalUser.email)" -ForegroundColor White
        Write-Host "      Admin: $($finalUser.is_admin)" -ForegroundColor $(if ($finalUser.is_admin) { "Green" } else { "Red" })
    }
    
} catch {
    Write-Host "❌ Erro ao atualizar usuário" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "   Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "💡 Alternativa: Execute manualmente no SQL Editor do Supabase:" -ForegroundColor Yellow
    Write-Host "   UPDATE users SET is_admin = TRUE WHERE email = '$UserEmail';" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Ou usando a função:" -ForegroundColor Yellow
    Write-Host "   SELECT make_user_admin('$UserEmail');" -ForegroundColor Cyan
    
    exit 1
}

Write-Host ""
Write-Host "✅ Concluído!" -ForegroundColor Green

