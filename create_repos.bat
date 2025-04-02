@echo off
REM Script pentru crearea repozitoriilor în GitHub pentru platforma SchoolBus

REM Verifică dacă Python este instalat
python --version 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo Python nu este instalat sau nu este în PATH. Te rog să instalezi Python pentru a continua.
    exit /b 1
)

REM Verifică dacă biblioteca requests este instalată
python -c "import requests" 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo Biblioteca Python 'requests' nu este instalată. Se instalează acum...
    pip install requests
    if %ERRORLEVEL% NEQ 0 (
        echo Nu s-a putut instala biblioteca 'requests'. Te rog să o instalezi manual: pip install requests
        exit /b 1
    )
)

REM Solicită token-ul GitHub dacă nu este furnizat ca argument
if "%~1"=="" (
    set /p GITHUB_TOKEN="Introdu token-ul de acces personal GitHub: "
) else (
    set GITHUB_TOKEN=%~1
)

REM Solicită organizația GitHub dacă nu este furnizată ca argument
if "%~2"=="" (
    set /p GITHUB_ORG="Introdu numele organizației GitHub [ScopeSystemsSoftware]: "
    if "!GITHUB_ORG!"=="" set GITHUB_ORG=ScopeSystemsSoftware
) else (
    set GITHUB_ORG=%~2
)

REM Solicită vizibilitatea repo-urilor dacă nu este furnizată ca argument
if "%~3"=="" (
    set /p VISIBILITY="Introdu vizibilitatea repo-urilor (private/public) [private]: "
    if "!VISIBILITY!"=="" set VISIBILITY=private
) else (
    set VISIBILITY=%~3
)

REM Verifică dacă vizibilitatea este validă
if not "%VISIBILITY%"=="private" (
    if not "%VISIBILITY%"=="public" (
        echo Vizibilitatea trebuie să fie 'private' sau 'public'. Folosim valoarea implicită 'private'.
        set VISIBILITY=private
    )
)

REM Execută scriptul Python
echo Se execută scriptul Python pentru crearea repozitoriilor...
python create_repositories.py --token "%GITHUB_TOKEN%" --org "%GITHUB_ORG%" --visibility "%VISIBILITY%"

REM Verifică dacă scriptul a rulat cu succes
if %ERRORLEVEL% EQU 0 (
    echo Scriptul a rulat cu succes!
) else (
    echo Scriptul a întâmpinat erori. Verifică mesajele de eroare de mai sus.
)

pause 