# Script para executar migration admin e tornar usuário admin
# Execute: .\scripts\executar-migration-admin.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$UserEmail = "elastiquality@elastiquality.pt"
)

Write-Host "🚀 Executando Migration Admin e Configurando Usuário Admin" -ForegroundColor Cyan
Write-Host ""

# Verificar se Supabase CLI está disponível
$supabaseCmd = $null
if (Get-Command supabase -ErrorAction SilentlyContinue) {
    $supabaseCmd = "supabase"
} elseif (Get-Command npx -ErrorAction SilentlyContinue) {
    $supabaseCmd = "npx supabase"
} else {
    Write-Host "❌ Supabase CLI não encontrado." -ForegroundColor Red
    Write-Host "💡 Instale com: npm install -g supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Alternativa: Execute manualmente no Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new" -ForegroundColor White
    Write-Host "   2. Cole o conteúdo de: database/migrations/004_admin_system.sql" -ForegroundColor White
    Write-Host "   3. Execute" -ForegroundColor White
    Write-Host "   4. Depois execute: SELECT make_user_admin('$UserEmail');" -ForegroundColor White
    exit 1
}

Write-Host "✅ Supabase CLI encontrado: $supabaseCmd" -ForegroundColor Green
Write-Host ""

# Verificar se está logado
Write-Host "🔐 Verificando autenticação..." -ForegroundColor Yellow
try {
    if ($supabaseCmd -eq "supabase") {
        $authCheck = supabase projects list 2>&1
    } else {
        $authCheck = npx supabase projects list 2>&1
    }
    
    if ($authCheck -match "not authenticated" -or $authCheck -match "not logged in") {
        Write-Host "⚠️ Não está autenticado no Supabase CLI." -ForegroundColor Yellow
        Write-Host "💡 Execute: $supabaseCmd login" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Ou execute manualmente no Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "   1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new" -ForegroundColor White
        Write-Host "   2. Cole o conteúdo de: database/migrations/004_admin_system.sql" -ForegroundColor White
        Write-Host "   3. Execute" -ForegroundColor White
        Write-Host "   4. Depois execute: SELECT make_user_admin('$UserEmail');" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "⚠️ Erro ao verificar autenticação. Continuando..." -ForegroundColor Yellow
}

Write-Host "📄 Lendo arquivo de migration..." -ForegroundColor Yellow
$migrationFile = "database/migrations/004_admin_system.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Arquivo de migration não encontrado: $migrationFile" -ForegroundColor Red
    exit 1
}

$migrationContent = Get-Content $migrationFile -Raw
Write-Host "✅ Arquivo lido com sucesso" -ForegroundColor Green
Write-Host ""

# Tentar executar via Supabase CLI
Write-Host "🔄 Tentando executar migration via Supabase CLI..." -ForegroundColor Yellow
Write-Host ""

# Método 1: Tentar usar db execute
try {
    Write-Host "📤 Executando migration..." -ForegroundColor Cyan
    
    # Criar arquivo temporário com a migration
    $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
    $migrationContent | Out-File -FilePath $tempFile -Encoding UTF8
    
    # Tentar executar via db execute
    if ($supabaseCmd -eq "supabase") {
        $result = supabase db execute --project-ref qeswqwhccqfbdtmywzkz --file $tempFile 2>&1
    } else {
        $result = npx supabase db execute --project-ref qeswqwhccqfbdtmywzkz --file $tempFile 2>&1
    }
    
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0 -or $result -match "Success") {
        Write-Host "✅ Migration executada com sucesso!" -ForegroundColor Green
        Write-Host ""
        
        # Tornar usuário admin
        Write-Host "👤 Tornando usuário admin: $UserEmail" -ForegroundColor Yellow
        
        $adminQuery = "SELECT make_user_admin('$UserEmail');"
        $adminTempFile = [System.IO.Path]::GetTempFileName() + ".sql"
        $adminQuery | Out-File -FilePath $adminTempFile -Encoding UTF8
        
        if ($supabaseCmd -eq "supabase") {
            $adminResult = supabase db execute --project-ref qeswqwhccqfbdtmywzkz --file $adminTempFile 2>&1
        } else {
            $adminResult = npx supabase db execute --project-ref qeswqwhccqfbdtmywzkz --file $adminTempFile 2>&1
        }
        
        Remove-Item $adminTempFile -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0 -or $adminResult -match "Success") {
            Write-Host "✅ Usuário '$UserEmail' agora é admin!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
            Write-Host "💡 Faça login com '$UserEmail' para acessar o dashboard admin." -ForegroundColor Cyan
        } else {
            Write-Host "⚠️ Erro ao tornar usuário admin via CLI." -ForegroundColor Yellow
            Write-Host "💡 Execute manualmente no Supabase Dashboard:" -ForegroundColor Yellow
            Write-Host "   SELECT make_user_admin('$UserEmail');" -ForegroundColor White
        }
    } else {
        Write-Host "⚠️ Erro ao executar migration via CLI." -ForegroundColor Yellow
        Write-Host "💡 Execute manualmente no Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "   1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new" -ForegroundColor White
        Write-Host "   2. Cole o conteúdo de: database/migrations/004_admin_system.sql" -ForegroundColor White
        Write-Host "   3. Execute" -ForegroundColor White
        Write-Host "   4. Depois execute: SELECT make_user_admin('$UserEmail');" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro ao executar via CLI: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Execute manualmente no Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new" -ForegroundColor White
    Write-Host "   2. Cole o conteúdo de: database/migrations/004_admin_system.sql" -ForegroundColor White
    Write-Host "   3. Execute" -ForegroundColor White
    Write-Host "   4. Depois execute: SELECT make_user_admin('$UserEmail');" -ForegroundColor White
}

Write-Host ""

