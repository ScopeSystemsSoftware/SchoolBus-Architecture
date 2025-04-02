#!/usr/bin/env python3
"""
Script pentru crearea repozitoriilor în organizația GitHub ScopeSystemsSoftware
pentru platforma SchoolBus cu noua arhitectură

Utilizare:
  python3 create_repositories.py --token GITHUB_TOKEN --org ScopeSystemsSoftware --visibility private

Dependințe:
  pip install requests
"""

import argparse
import json
import requests
import sys
import time

def create_repository(token, org, repo_name, description, visibility="private"):
    """Creează un repository în organizația specificată"""
    url = f"https://api.github.com/orgs/{org}/repos"
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
        print(f"⚠️ Repository-ul {repo_name} există deja în organizație.")
        return True
    else:
        print(f"❌ Eroare la crearea {repo_name}: {response.status_code} - {response.text}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Crează repository-uri pentru platforma SchoolBus în GitHub")
    parser.add_argument("--token", required=True, help="GitHub Personal Access Token")
    parser.add_argument("--org", default="ScopeSystemsSoftware", help="Numele organizației GitHub")
    parser.add_argument("--visibility", choices=["private", "public"], default="private", 
                        help="Vizibilitatea repo-urilor (private/public)")
    
    args = parser.parse_args()
    
    # Lista repozitoriilor de creat cu descrierile lor
    repositories = [
        # Repository principal
        ("schoolbus-platform", "Repository central pentru platforma School Bus - arhitectură, documentație și configurații globale"),
        
        # Microservicii (backend)
        ("schoolbus-svc-routing", "Serviciu pentru rutare și optimizare trasee"),
        ("schoolbus-svc-tracking", "Serviciu pentru tracking în timp real"),
        ("schoolbus-svc-auth", "Serviciu pentru autentificare și autorizare"),
        ("schoolbus-svc-notifications", "Serviciu pentru notificări"),
        ("schoolbus-svc-users", "Serviciu pentru management utilizatori"),
        ("schoolbus-svc-scheduling", "Serviciu pentru programare și planificare"),
        ("schoolbus-svc-analytics", "Serviciu pentru analiză și raportare"),
        ("schoolbus-svc-fleet", "Serviciu pentru managementul flotei"),
        ("schoolbus-svc-geo", "Serviciu pentru geolocalizare"),
        
        # Aplicații frontend
        ("schoolbus-app-admin-web", "Aplicație web pentru administratori"),
        ("schoolbus-app-dispatch-web", "Aplicație web pentru dispeceri"),
        ("schoolbus-app-fleet-web", "Aplicație web pentru managementul flotei"),
        ("schoolbus-app-parent-web", "Aplicație web pentru părinți"),
        ("schoolbus-app-driver-mobile", "Aplicație mobilă pentru șoferi"),
        ("schoolbus-app-parent-mobile", "Aplicație mobilă pentru părinți"),
        ("schoolbus-app-monitor-mobile", "Aplicație mobilă pentru monitorizare"),
        
        # Infrastructură și DevOps
        ("schoolbus-infra-gke", "Infrastructură Google Kubernetes Engine"),
        ("schoolbus-infra-terraform", "Configurații Terraform pentru toate componentele"),
        ("schoolbus-devops-ci", "Pipeline-uri CI/CD"),
        ("schoolbus-devops-monitoring", "Monitoring, alerting și observabilitate"),
        
        # Componente comune și biblioteci
        ("schoolbus-lib-common", "Biblioteci și componente reutilizabile"),
        ("schoolbus-lib-api-specs", "Specificații API (OpenAPI/Swagger)"),
        ("schoolbus-lib-ui-components", "Componente UI comune pentru aplicațiile web/mobile"),
        
        # Instrumente și utilități
        ("schoolbus-tools-data-migration", "Instrumente pentru migrarea datelor"),
        ("schoolbus-tools-dev-environment", "Configurații pentru medii de dezvoltare")
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