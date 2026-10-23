@echo off
REM ==========================================================================
REM  Babi Wedding - serveur local
REM  Le SDK Supabase ne se charge pas depuis un fichier ouvert en double-clic.
REM  Ce script sert le site en http, ce qui est indispensable des que la base
REM  de donnees est branchee.
REM ==========================================================================
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
  echo.
  echo   Babi Wedding tourne sur http://localhost:5173
  echo   Diagnostic : http://localhost:5173/outils/diagnostic.html
  echo   Fermez cette fenetre pour arreter.
  echo.
  start "" http://localhost:5173/outils/diagnostic.html
  python -m http.server 5173
  goto :eof
)

where npx >nul 2>nul
if %errorlevel%==0 (
  echo.
  echo   Babi Wedding demarre avec npx serve...
  echo.
  npx --yes serve . -l 5173
  goto :eof
)

echo.
echo   Ni Python ni Node ne sont installes sur cette machine.
echo   Installez l'un des deux, ou servez le dossier avec l'outil de votre choix.
echo.
pause
