# Script de Deploy Rápido - Elastiquality (PowerShell)
# Uso: .\deploy.ps1 [test|prod]

param(
    [string]$DeployType = "test"
)

Write-Host "🚀 Elastiquality - Deploy Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar argumento
if ($DeployType -ne "test" -and $DeployType -ne "prod") {
    Write-Host "❌ Uso: .\deploy.ps1 [test|prod]" -ForegroundColor Red
    exit 1
}

# Verificar se Netlify CLI está instalado
Write-Host "🔍 Verificando Netlify CLI..." -ForegroundColor Yellow
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue

if (-not $netlifyInstalled) {
    Write-Host "❌ Netlify CLI não encontrado!" -ForegroundColor Red
    Write-Host "📦 Instalando Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# Verificar se está logado
Write-Host "🔐 Verificando autenticação..." -ForegroundColor Yellow
$statusOutput = netlify status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔑 Fazendo login no Netlify..." -ForegroundColor Yellow
    netlify login
}

# Limpar build anterior
Write-Host "🧹 Limpando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Build
Write-Host "🔨 Fazendo build..." -ForegroundColor Yellow
npm run build:web

# Verificar se build foi bem-sucedido
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build falhou! Pasta dist não foi criada." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído!" -ForegroundColor Green
Write-Host ""

# Deploy
if ($DeployType -eq "prod") {
    Write-Host "🚀 Fazendo deploy para PRODUÇÃO..." -ForegroundColor Magenta
    netlify deploy --prod --dir=dist
    Write-Host "✅ Deploy de PRODUÇÃO concluído!" -ForegroundColor Green
} else {
    Write-Host "🧪 Fazendo deploy de TESTE..." -ForegroundColor Yellow
    netlify deploy --dir=dist
    Write-Host "✅ Deploy de TESTE concluído!" -ForegroundColor Green
    Write-Host "📝 Use '.\deploy.ps1 prod' para deploy de produção" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Deploy finalizado com sucesso!" -ForegroundColor Green
Write-Host "📊 Veja o status: netlify status" -ForegroundColor Cyan
Write-Host "🌐 Abrir site: netlify open:site" -ForegroundColor Cyan

