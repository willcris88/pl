@echo off
echo.
echo ========================================
echo VERIFICANDO INSTALACAO WINDOWS
echo ========================================
echo.

echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale Node.js a partir de: https://nodejs.org/
    pause
    exit /b 1
)

echo Verificando npm...
npm --version
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)

echo Verificando dependencias...
if not exist node_modules (
    echo AVISO: node_modules nao encontrado. Execute install-windows.bat primeiro.
    pause
    exit /b 1
)

echo Verificando TypeScript...
npm run check
if %errorlevel% neq 0 (
    echo AVISO: Existem erros de TypeScript.
    echo Verifique os arquivos .ts antes de continuar.
)

echo Testando build do cliente...
npm run build:client
if %errorlevel% neq 0 (
    echo ERRO: Falha no build do cliente!
    pause
    exit /b 1
)

echo Testando build do servidor...
npm run build:server
if %errorlevel% neq 0 (
    echo ERRO: Falha no build do servidor!
    pause
    exit /b 1
)

echo.
echo ========================================
echo VERIFICACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo O projeto esta pronto para uso no Windows.
echo.
echo Para iniciar o desenvolvimento:
echo   npm run dev:windows
echo   ou execute: run-dev.bat
echo.
echo Para producao:
echo   npm start
echo.
pause