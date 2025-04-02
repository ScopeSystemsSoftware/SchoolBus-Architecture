#!/bin/bash
# Script pentru crearea repozitoriilor în GitHub pentru platforma SchoolBus

# Verifică dacă Python este instalat
if ! command -v python3 &> /dev/null; then
    echo "Python 3 nu este instalat. Te rog să instalezi Python 3 pentru a continua."
    exit 1
fi

# Verifică dacă biblioteca requests este instalată
python3 -c "import requests" 2>/dev/null || {
    echo "Biblioteca Python 'requests' nu este instalată. Se instalează acum..."
    pip3 install requests || {
        echo "Nu s-a putut instala biblioteca 'requests'. Te rog să o instalezi manual: pip3 install requests"
        exit 1
    }
}

# Solicită token-ul GitHub dacă nu este furnizat ca argument
if [ -z "$1" ]; then
    read -p "Introdu token-ul de acces personal GitHub: " GITHUB_TOKEN
else
    GITHUB_TOKEN="$1"
fi

# Solicită organizația GitHub dacă nu este furnizată ca argument
if [ -z "$2" ]; then
    read -p "Introdu numele organizației GitHub [ScopeSystemsSoftware]: " GITHUB_ORG
    GITHUB_ORG=${GITHUB_ORG:-ScopeSystemsSoftware}
else
    GITHUB_ORG="$2"
fi

# Solicită vizibilitatea repo-urilor dacă nu este furnizată ca argument
if [ -z "$3" ]; then
    read -p "Introdu vizibilitatea repo-urilor (private/public) [private]: " VISIBILITY
    VISIBILITY=${VISIBILITY:-private}
else
    VISIBILITY="$3"
fi

# Verifică dacă vizibilitatea este validă
if [ "$VISIBILITY" != "private" ] && [ "$VISIBILITY" != "public" ]; then
    echo "Vizibilitatea trebuie să fie 'private' sau 'public'. Folosim valoarea implicită 'private'."
    VISIBILITY="private"
fi

# Execută scriptul Python
echo "Se execută scriptul Python pentru crearea repozitoriilor..."
python3 create_repositories.py --token "$GITHUB_TOKEN" --org "$GITHUB_ORG" --visibility "$VISIBILITY"

# Verifică dacă scriptul a rulat cu succes
if [ $? -eq 0 ]; then
    echo "Scriptul a rulat cu succes!"
else
    echo "Scriptul a întâmpinat erori. Verifică mesajele de eroare de mai sus."
fi 