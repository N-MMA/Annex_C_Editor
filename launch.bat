@echo off
cd /d "%~dp0app"

:: ── Check for Node.js ─────────────────────────────────────────────────────────
where node >nul 2>&1
if not errorlevel 1 goto HAS_NODE

:: ── No Node.js — try Python fallback (serves pre-built app) ──────────────────
echo Node.js nao encontrado.
echo.
echo A tentar iniciar com Python (versao pre-compilada)...
where python >nul 2>&1
if not errorlevel 1 goto HAS_PYTHON
where python3 >nul 2>&1
if not errorlevel 1 goto HAS_PYTHON3

echo.
echo ERRO: Nem Node.js nem Python foram encontrados.
echo.
echo Para instalar Node.js (recomendado):
echo   https://nodejs.org   ^(escolha "LTS"^)
echo.
echo Para instalar Python:
echo   https://www.python.org/downloads
echo.
pause
exit /b 1

:HAS_PYTHON3
set PYTHON=python3
goto PYTHON_SERVE

:HAS_PYTHON
set PYTHON=python
goto PYTHON_SERVE

:PYTHON_SERVE
if not exist "dist\index.html" (
    echo.
    echo ERRO: Pasta dist\ nao encontrada.
    echo Instale o Node.js e execute este ficheiro novamente para compilar a aplicacao.
    echo   https://nodejs.org
    pause
    exit /b 1
)
echo.
echo A iniciar servidor Python na pasta dist\...
echo Abra http://localhost:8000 no seu browser.
echo Prima Ctrl+C para parar.
echo.
cd dist
%PYTHON% serve.py 8000
exit /b 0

:: ── Node.js present ───────────────────────────────────────────────────────────
:HAS_NODE
if not exist "node_modules" (
    echo A instalar dependencias...
    npm install
)

echo.
echo  Anexo C -- Relatorio Unico 2025
echo  ================================
echo  [1] Modo desenvolvimento  ^(inicia rapido, recomendado para uso diario^)
echo  [2] Modo producao         ^(compila primeiro, mais rapido a servir^)
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
