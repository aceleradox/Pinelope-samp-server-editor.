@echo off
SETLOCAL EnableDelayedExpansion
title Pinelope.js - Gerenciador de Servidor

echo ==========================================================
echo 🔍 VERIFICANDO AMBIENTE DO SISTEMA (NPM / NODE.JS)
echo ==========================================================

:: Verifica se o NPM está instalado no Windows
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERRO: O Node.js/NPM nao foi encontrado no seu Windows!
    echo 请 baixe e instale o Node.js em: https://nodejs.org
    pause
    exit
)

echo ✅ NPM detectado com sucesso.

:: Verifica se a pasta node_modules ou o package.json existem na pasta do SA-MP
if not exist "package.json" (
    echo 📦 Criando arquivo de inicializacao package.json...
    call npm init -y >nul
)

if not exist "node_modules\@xenova\transformers" (
    echo 📥 Instalando a Inteligencia Artificial Local (@xenova/transformers)...
    echo Isso pode levar alguns minutos na primeira vez...
    call npm install @xenova/transformers express --silent
    echo ✅ Instalacao concluida!
) else (
    echo ✅ Dependencias da IA ja estao instaladas.
)

echo.
echo ==========================================================
echo 🚀 INICIANDO PINELLOPE.JS NO SERVIDOR SA-MP
echo ==========================================================
echo.

:: Executa o script principal da Pinelope
node pinelope.js

pause
