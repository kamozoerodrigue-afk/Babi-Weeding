@echo off
REM ============================================================
REM  Babi Wedding — reparation de l'installation
REM  A lancer depuis le dossier app-mobile : install.bat
REM
REM  Les versions du package.json sont deja correctes (SDK 54).
REM  Ce script se contente de reconstruire node_modules proprement,
REM  car le paquet @expo/cli y est arrive incomplet.
REM ============================================================

echo.
echo [1/4] Suppression de node_modules, du lock et du cache...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
if exist .expo rmdir /s /q .expo

echo.
echo [2/4] Nettoyage du cache npm...
call npm cache clean --force

echo.
echo [3/4] Installation des dependances...
call npm install
if errorlevel 1 goto :erreur

echo.
echo [4/5] Preset Babel (non hisse automatiquement par npm)...
call npx expo install babel-preset-expo

echo.
echo [5/5] Verification du CLI Expo...
if not exist "node_modules\@expo\cli\build\src\install\utils\autoAddConfigPlugins.js" (
  echo    Le CLI est encore incomplet, reinstallation ciblee...
  call npm install @expo/cli --force
)

echo.
echo ============================================================
echo  Termine. Lancez maintenant :  npx expo start -c
echo ============================================================
goto :fin

:erreur
echo.
echo Echec de l'installation. Copiez le message ci-dessus.

:fin
pause
