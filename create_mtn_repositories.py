#!/usr/bin/env python3
"""
Script pentru crearea repozitoriilor multi-tenant în GitHub
pentru platforma SchoolBus POC (Proof of Concept)

Utilizare:
  python3 create_mtn_repositories.py --token GITHUB_TOKEN --org stefantirlea --visibility private

Dependințe:
  pip install requests
"""

import argparse
import json
import requests
import sys
import time

def create_repository(token, org, repo_name, description, visibility="private"):
    """Creează un repository în organizația sau contul specificat"""
    # Verificăm dacă org conține slash, ceea ce înseamnă că este un utilizator, nu o organizație
    if "/" in org:
        url = f"https://api.github.com/user/repos"
    else:
        url = f"https://api.github.com/user/repos"  # Pentru a crea în contul personal
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    data = {
        "name": repo_name,
        "description": description,
        "private": visibility == "private",
        "auto_init": True,
        "has_issues": True,
        "has_projects": True,
        "has_wiki": True
    }
    
    print(f"Creez repository-ul: {repo_name}")
    response = requests.post(url, headers=headers, data=json.dumps(data))
    
    if response.status_code == 201:
        print(f"✅ Repository {repo_name} creat cu succes!")
        return True
    elif response.status_code == 422 and "name already exists" in response.text:
        print(f"⚠️ Repository-ul {repo_name} există deja.")
        return True
    else:
        print(f"❌ Eroare la crearea {repo_name}: {response.status_code} - {response.text}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Crează repository-uri multi-tenant pentru platforma SchoolBus POC")
    parser.add_argument("--token", required=True, help="GitHub Personal Access Token")
    parser.add_argument("--org", default="stefantirlea", help="Numele organizației sau utilizatorului GitHub")
    parser.add_argument("--visibility", choices=["private", "public"], default="private", 
                        help="Vizibilitatea repo-urilor (private/public)")
    
    args = parser.parse_args()
    
    # Lista repozitoriilor de creat cu descrierile lor (doar cele necesare pentru POC multi-tenant)
    repositories = [
        # Repository principal pentru multi-tenant
        ("schoolbus-mtn-platform", "Repository central pentru platforma School Bus multi-tenant - POC"),
        
        # Microservicii minime pentru POC
        ("schoolbus-mtn-svc-demo", "Microserviciu demo pentru demonstrarea funcționalității multi-tenant"),
        
        # Aplicație frontend minimă pentru POC
        ("schoolbus-mtn-app-demo", "Aplicație web demo pentru demonstrarea funcționalității multi-tenant"),
        
        # Infrastructură și DevOps pentru multi-tenant
        ("schoolbus-mtn-infra-terraform", "Configurații Terraform pentru infrastructura multi-tenant"),
        ("schoolbus-mtn-devops-ci", "Pipeline-uri CI/CD pentru implementarea multi-tenant"),
        
        # Componente comune
        ("schoolbus-mtn-lib-common", "Biblioteci și componente comune pentru versiunea multi-tenant"),
    ]
    
    successful = 0
    failed = 0
    
    # Verifică validitatea token-ului
    test_url = "https://api.github.com/user"
    test_headers = {
        "Authorization": f"token {args.token}",
        "Accept": "application/vnd.github.v3+json"
    }
    test_response = requests.get(test_url, headers=test_headers)
    if test_response.status_code != 200:
        print(f"❌ Token invalid sau expirat: {test_response.status_code} - {test_response.text}")
        sys.exit(1)
    
    user_data = test_response.json()
    print(f"Autentificat ca: {user_data.get('login')}")
    
    # Crează fiecare repository
    for repo_name, description in repositories:
        # Adaugă o mică pauză pentru a evita limitarea rate
        time.sleep(1)
        if create_repository(args.token, args.org, repo_name, description, args.visibility):
            successful += 1
        else:
            failed += 1
    
    print("\nRezumat:")
    print(f"✅ Repository-uri create cu succes: {successful}")
    print(f"❌ Repository-uri care au eșuat: {failed}")
    print(f"Total: {successful + failed}")

if __name__ == "__main__":
    main() 