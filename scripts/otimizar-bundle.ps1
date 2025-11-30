# Script para otimizar o bundle size
# Execute: .\scripts\otimizar-bundle.ps1

Write-Host "🚀 Otimização de Bundle Size" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Checklist de Otimização:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. ✅ Code Splitting" -ForegroundColor Green
Write-Host "   - Usar React.lazy() para componentes grandes" -ForegroundColor White
Write-Host "   - Dividir rotas em chunks separados" -ForegroundColor White
Write-Host ""

Write-Host "2. ✅ Tree Shaking" -ForegroundColor Green
Write-Host "   - Importar apenas o que é necessário" -ForegroundColor White
Write-Host "   - Evitar importar bibliotecas inteiras" -ForegroundColor White
Write-Host ""

Write-Host "3. ✅ Compressão" -ForegroundColor Green
Write-Host "   - Habilitar gzip/brotli no servidor" -ForegroundColor White
Write-Host "   - Minificar código em produção" -ForegroundColor White
Write-Host ""

Write-Host "4. ✅ Imagens" -ForegroundColor Green
Write-Host "   - Usar formatos modernos (WebP, AVIF)" -ForegroundColor White
Write-Host "   - Comprimir imagens antes do upload" -ForegroundColor White
Write-Host "   - Usar lazy loading para imagens" -ForegroundColor White
Write-Host ""

Write-Host "5. ✅ Bibliotecas" -ForegroundColor Green
Write-Host "   - Verificar se há alternativas mais leves" -ForegroundColor White
Write-Host "   - Remover dependências não utilizadas" -ForegroundColor White
Write-Host ""

Write-Host "💡 Para análise detalhada:" -ForegroundColor Cyan
Write-Host "   .\scripts\analisar-bundle-size.ps1" -ForegroundColor White
Write-Host ""

Write-Host "💡 Para verificar dependências não utilizadas:" -ForegroundColor Cyan
Write-Host "   npx depcheck" -ForegroundColor White
Write-Host ""

Write-Host "💡 Para analisar imports:" -ForegroundColor Cyan
Write-Host "   npx import-cost" -ForegroundColor White
Write-Host ""

