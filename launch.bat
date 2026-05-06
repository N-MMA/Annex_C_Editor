@echo off
cd /d "%~dp0app"

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js not found. Please install it from https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo  Anexo C -- Relatorio Unico 2025
echo  ================================
echo  [1] Modo desenvolvimento  (inicia rapido, recomendado para uso diario)
echo  [2] Modo producao         (compila primeiro, mais rapido a servir)
echo.
set /p MODO="Escolha (1 ou 2, Enter = 1): "

if "%MODO%"=="2" goto PROD

:DEV
echo.
echo A iniciar em modo desenvolvimento...
echo Abra http://localhost:5173 no seu browser.
echo Prima Ctrl+C para parar.
npm run dev
goto END

:PROD
echo.
echo A compilar para producao...
npm run build
if errorlevel 1 (
    echo Erro durante a compilacao. Verifique os erros acima.
    pause
    exit /b 1
)
echo.
echo A iniciar servidor de producao...
echo Abra http://localhost:4173 no seu browser.
echo Prima Ctrl+C para parar.
npm run preview

:END
