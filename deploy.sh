#!/bin/bash

# Script de Deploy Rápido - Elastiquality
# Uso: ./deploy.sh [test|prod]

set -e

echo "🚀 Elastiquality - Deploy Script"
echo "================================"

# Verificar argumento
DEPLOY_TYPE=${1:-test}

if [ "$DEPLOY_TYPE" != "test" ] && [ "$DEPLOY_TYPE" != "prod" ]; then
    echo "❌ Uso: ./deploy.sh [test|prod]"
    exit 1
fi

# Verificar se Netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI não encontrado!"
    echo "📦 Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

# Verificar se está logado
echo "🔐 Verificando autenticação..."
if ! netlify status &> /dev/null; then
    echo "🔑 Fazendo login no Netlify..."
    netlify login
fi

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf dist

# Build
echo "🔨 Fazendo build..."
npm run build:web

# Verificar se build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo "❌ Build falhou! Pasta dist não foi criada."
    exit 1
fi

echo "✅ Build concluído!"

# Deploy
if [ "$DEPLOY_TYPE" = "prod" ]; then
    echo "🚀 Fazendo deploy para PRODUÇÃO..."
    netlify deploy --prod --dir=dist
    echo "✅ Deploy de PRODUÇÃO concluído!"
else
    echo "🧪 Fazendo deploy de TESTE..."
    netlify deploy --dir=dist
    echo "✅ Deploy de TESTE concluído!"
    echo "📝 Use 'netlify deploy --prod' para deploy de produção"
fi

echo ""
echo "🎉 Deploy finalizado com sucesso!"
echo "📊 Veja o status: netlify status"
echo "🌐 Abrir site: netlify open:site"

