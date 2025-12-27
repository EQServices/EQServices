# Script para build APK de preview
Write-Host "Iniciando build APK..." -ForegroundColor Green
eas build --platform android --profile preview

