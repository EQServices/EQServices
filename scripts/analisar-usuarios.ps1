# Script para analisar usuários no banco de dados
# Execute: .\scripts\analisar-usuarios.ps1

Write-Host "📊 Análise de Usuários - Elastiquality" -ForegroundColor Cyan
Write-Host ""

# Verificar se Supabase CLI está instalado
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI não encontrado." -ForegroundColor Red
    Write-Host "💡 Instale com: npm install -g supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Alternativa: Execute a query SQL diretamente no Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new" -ForegroundColor White
    Write-Host "   2. Cole a query abaixo:" -ForegroundColor White
    Write-Host ""
    Write-Host "-- Query para analisar usuários" -ForegroundColor Gray
    Write-Host "SELECT" -ForegroundColor Gray
    Write-Host "  user_type," -ForegroundColor Gray
    Write-Host "  COUNT(*) as total," -ForegroundColor Gray
    Write-Host "  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as ultimos_7_dias," -ForegroundColor Gray
    Write-Host "  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as ultimos_30_dias" -ForegroundColor Gray
    Write-Host "FROM users" -ForegroundColor Gray
    Write-Host "GROUP BY user_type" -ForegroundColor Gray
    Write-Host "ORDER BY total DESC;" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "🔍 Analisando usuários no banco de dados..." -ForegroundColor Yellow
Write-Host ""

# Query SQL para análise
$query = @"
-- Análise completa de usuários
SELECT 
  'Total de Usuários' as categoria,
  COUNT(*) as quantidade
FROM users

UNION ALL

SELECT 
  'Clientes' as categoria,
  COUNT(*) as quantidade
FROM users
WHERE user_type = 'client'

UNION ALL

SELECT 
  'Profissionais' as categoria,
  COUNT(*) as quantidade
FROM users
WHERE user_type = 'professional'

UNION ALL

SELECT 
  'Usuários últimos 7 dias' as categoria,
  COUNT(*) as quantidade
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'Usuários últimos 30 dias' as categoria,
  COUNT(*) as quantidade
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
  'Profissionais com créditos' as categoria,
  COUNT(*) as quantidade
FROM professionals
WHERE credits > 0

UNION ALL

SELECT 
  'Profissionais sem créditos' as categoria,
  COUNT(*) as quantidade
FROM professionals
WHERE credits = 0 OR credits IS NULL;
"@

Write-Host "📄 Query SQL criada. Para executar:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opção 1: Via Supabase Dashboard" -ForegroundColor Yellow
Write-Host "   1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new" -ForegroundColor White
Write-Host "   2. Cole a query abaixo e execute" -ForegroundColor White
Write-Host ""
Write-Host $query -ForegroundColor Gray
Write-Host ""
Write-Host "Opção 2: Via Supabase CLI (se autenticado)" -ForegroundColor Yellow
Write-Host "   Execute: supabase db query '$query' --project-ref qeswqwhccqfbdtmywzkz" -ForegroundColor White
Write-Host ""

# Tentar executar via CLI se possível
try {
    Write-Host "🔄 Tentando executar via Supabase CLI..." -ForegroundColor Yellow
    
    # Verificar se está autenticado
    $status = supabase status --project-ref qeswqwhccqfbdtmywzkz 2>&1
    
    if ($status -match "Project is linked") {
        Write-Host "✅ Projeto linkado. Executando query..." -ForegroundColor Green
        
        # Salvar query em arquivo temporário
        $tempFile = [System.IO.Path]::GetTempFileName()
        $query | Out-File -FilePath $tempFile -Encoding UTF8
        
        # Executar query
        $result = supabase db query --file $tempFile --project-ref qeswqwhccqfbdtmywzkz 2>&1
        
        Write-Host ""
        Write-Host "📊 Resultados:" -ForegroundColor Green
        Write-Host $result -ForegroundColor White
        
        # Remover arquivo temporário
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    } else {
        Write-Host "⚠️ Projeto não está linkado." -ForegroundColor Yellow
        Write-Host "💡 Execute: supabase login e depois supabase link --project-ref qeswqwhccqfbdtmywzkz" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️ Não foi possível executar via CLI. Use o Supabase Dashboard." -ForegroundColor Yellow
}

Write-Host ""

