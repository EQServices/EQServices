# Script para analisar o tamanho do bundle da aplicação web
# Execute: .\scripts\analisar-bundle-size.ps1

Write-Host "📦 Análise de Bundle Size" -ForegroundColor Cyan
Write-Host ""

# Verificar se source-map-explorer está instalado
$smeInstalled = npm list -g source-map-explorer 2>&1 | Select-String -Pattern "source-map-explorer"

if (-not $smeInstalled) {
    Write-Host "📥 Instalando source-map-explorer..." -ForegroundColor Yellow
    npm install -g source-map-explorer
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar source-map-explorer" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🔨 Construindo aplicação web..." -ForegroundColor Yellow
npm run build:web

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao construir aplicação" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📊 Analisando bundle size..." -ForegroundColor Yellow
Write-Host ""

# Procurar arquivos JS gerados
$jsFiles = Get-ChildItem -Path "dist" -Recurse -Filter "*.js" | Where-Object { $_.Name -match "web" }

if ($jsFiles.Count -eq 0) {
    Write-Host "⚠️ Nenhum arquivo JS encontrado em dist/" -ForegroundColor Yellow
    Write-Host "💡 Certifique-se de que executou: npm run build:web" -ForegroundColor Cyan
    exit 1
}

Write-Host "📄 Arquivos encontrados:" -ForegroundColor Cyan
foreach ($file in $jsFiles) {
    $size = (Get-Item $file.FullName).Length / 1KB
    Write-Host "   - $($file.Name): $([math]::Round($size, 2)) KB" -ForegroundColor White
}

Write-Host ""
Write-Host "💡 Para análise detalhada com source-map-explorer:" -ForegroundColor Cyan
Write-Host "   source-map-explorer 'dist/_expo/static/js/web/*.js'" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para verificar tamanho total:" -ForegroundColor Cyan
Write-Host "   Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum" -ForegroundColor White

# Calcular tamanho total
$totalSize = (Get-ChildItem -Path "dist" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ""
Write-Host "📊 Tamanho total do build: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Green

# Verificar se há arquivos grandes (>500KB)
Write-Host ""
Write-Host "🔍 Arquivos grandes (>500KB):" -ForegroundColor Yellow
$largeFiles = Get-ChildItem -Path "dist" -Recurse -File | Where-Object { $_.Length -gt 500KB }
if ($largeFiles.Count -eq 0) {
    Write-Host "   ✅ Nenhum arquivo muito grande encontrado" -ForegroundColor Green
} else {
    foreach ($file in $largeFiles) {
        $size = $file.Length / 1KB
        Write-Host "   ⚠️ $($file.Name): $([math]::Round($size, 2)) KB" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Análise concluída!" -ForegroundColor Green

