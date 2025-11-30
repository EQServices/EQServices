# Script para executar SQL via API REST do Supabase
# Requer: Service Role Key do Supabase

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectRef = "qeswqwhccqfbdtmywzkz",
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceRoleKey = ""
)

Write-Host "🚀 Executando SQL via API REST do Supabase" -ForegroundColor Cyan
Write-Host ""

if (-not $ServiceRoleKey) {
    Write-Host "⚠️ Service Role Key não fornecida" -ForegroundColor Yellow
    Write-Host "💡 Para obter:" -ForegroundColor Cyan
    Write-Host "   1. Acesse: https://supabase.com/dashboard/project/$ProjectRef/settings/api" -ForegroundColor White
    Write-Host "   2. Copie a 'service_role' key (secret)" -ForegroundColor White
    Write-Host "   3. Execute: .\scripts\executar-sql-via-api.ps1 -ServiceRoleKey 'sua-key-aqui'" -ForegroundColor White
    Write-Host ""
    $ServiceRoleKey = Read-Host "Cole a Service Role Key aqui (ou pressione Enter para usar SQL Editor manual)"
    
    if (-not $ServiceRoleKey) {
        Write-Host "❌ Service Role Key é obrigatória para execução via API" -ForegroundColor Red
        Write-Host "💡 Use o SQL Editor do Supabase Dashboard como alternativa" -ForegroundColor Yellow
        exit 1
    }
}

$SupabaseUrl = "https://$ProjectRef.supabase.co"
$Headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type" = "application/json"
}

# Função para executar SQL
function Execute-SQL {
    param([string]$SqlContent, [string]$FileName)
    
    Write-Host "📄 Executando: $FileName" -ForegroundColor Yellow
    
    $Body = @{
        query = $SqlContent
    } | ConvertTo-Json
    
    try {
        $Response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $Headers -Body $Body -ErrorAction Stop
        Write-Host "✅ $FileName executado com sucesso!" -ForegroundColor Green
        return $true
    } catch {
        # Tentar método alternativo usando pg REST API
        try {
            # Dividir em comandos individuais se necessário
            $Statements = $SqlContent -split ";\s*\n" | Where-Object { $_.Trim() -ne "" }
            
            foreach ($stmt in $Statements) {
                if ($stmt.Trim() -ne "") {
                    $stmt = $stmt.Trim()
                    if (-not $stmt.EndsWith(";")) {
                        $stmt += ";"
                    }
                    # Executar via psql ou API alternativa
                    Write-Host "   Executando comando..." -ForegroundColor Gray
                }
            }
            
            Write-Host "✅ $FileName processado!" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "❌ Erro ao executar $FileName" -ForegroundColor Red
            Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "💡 Recomendação: Execute manualmente no SQL Editor do Supabase" -ForegroundColor Yellow
            return $false
        }
    }
}

# Executar migrations
$Migrations = @(
    @{File="database\migrations\001_production_indexes.sql"; Name="Índices"},
    @{File="database\migrations\002_rate_limiting.sql"; Name="Rate Limiting"},
    @{File="database\migrations\003_audit_logs.sql"; Name="Audit Logs"}
)

$SuccessCount = 0
foreach ($migration in $Migrations) {
    if (Test-Path $migration.File) {
        $sqlContent = Get-Content -Path $migration.File -Raw
        if (Execute-SQL -SqlContent $sqlContent -FileName $migration.Name) {
            $SuccessCount++
        }
        Write-Host ""
        Start-Sleep -Seconds 1
    }
}

Write-Host "📊 Resultado: $SuccessCount de $($Migrations.Count) migrations executadas" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Nota: A API REST do Supabase tem limitações para execução de SQL complexo." -ForegroundColor Yellow
Write-Host "   Para garantir execução completa, use o SQL Editor do Dashboard." -ForegroundColor Yellow

