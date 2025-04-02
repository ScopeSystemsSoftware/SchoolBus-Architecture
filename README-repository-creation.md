# Instrucțiuni pentru crearea repozitoriilor pentru SchoolBus Platform

Acest document explică cum să utilizezi GitHub Actions pentru a crea automat toate repozitoriile necesare pentru noua arhitectură a platformei SchoolBus în organizația ScopeSystemsSoftware.

## Pașii de urmat

### 1. Configurează un token de acces GitHub

Pentru a putea crea repozitorii într-o organizație, ai nevoie de un token de acces personal (PAT) cu permisiunile corecte:

1. Accesează [Settings > Developer Settings > Personal Access Tokens > Tokens (classic)](https://github.com/settings/tokens) în contul tău GitHub
2. Creează un nou token cu următoarele permisiuni:
   - `repo` (toate permisiunile legate de repo)
   - `workflow` (pentru a putea executa GitHub Actions)
   - `admin:org` (pentru a putea crea repo-uri în organizație)
   - `delete_repo` (opțional, dacă vrei să poți șterge repo-uri în caz de eroare)

3. Copiază token-ul generat pentru utilizare ulterioară

### 2. Adaugă token-ul ca secret în repozitoriul curent

1. Mergi la Settings în repozitoriul tău
2. Selectează "Secrets and variables" > "Actions"
3. Adaugă un nou secret cu numele `REPOSITORY_CREATION_TOKEN` și valoarea token-ului generat anterior

### 3. Adaugă fișierul workflow în repozitoriu

1. Creează directorul `.github/workflows/` în repozitoriul tău (dacă nu există deja)
2. Adaugă fișierul `create-repositories.yml` în acest director (conținutul este furnizat mai jos)

### 4. Execută workflow-ul

1. Mergi la tabul "Actions" din repozitoriul tău
2. Selectează workflow-ul "Create SchoolBus Platform Repositories" din lista din stânga
3. Apasă butonul "Run workflow"
4. Completează câmpurile de input:
   - Organization: "ScopeSystemsSoftware" (sau numele organizației tale)
   - Visibility: "private" (sau "public" dacă dorești repo-uri publice)
5. Apasă butonul "Run workflow" pentru a începe procesul

### 5. Verifică rezultatele

1. Urmărește progresul execuției în tabul Actions
2. După finalizare, verifică dacă toate repozitoriile au fost create în organizație
3. Dacă există erori, verifică log-urile pentru a identifica problema

## Structura repozitoriilor care vor fi create

Workflow-ul va crea următoarele categorii de repozitorii:

1. **Repository principal**
   - schoolbus-platform

2. **Microservicii (backend)**
   - schoolbus-svc-routing
   - schoolbus-svc-tracking
   - schoolbus-svc-auth
   - schoolbus-svc-notifications
   - schoolbus-svc-users
   - schoolbus-svc-scheduling
   - schoolbus-svc-analytics
   - schoolbus-svc-fleet
   - schoolbus-svc-geo

3. **Aplicații frontend**
   - schoolbus-app-admin-web
   - schoolbus-app-dispatch-web
   - schoolbus-app-fleet-web
   - schoolbus-app-parent-web
   - schoolbus-app-driver-mobile
   - schoolbus-app-parent-mobile
   - schoolbus-app-monitor-mobile

4. **Infrastructură și DevOps**
   - schoolbus-infra-gke
   - schoolbus-infra-terraform
   - schoolbus-devops-ci
   - schoolbus-devops-monitoring

5. **Componente comune și biblioteci**
   - schoolbus-lib-common
   - schoolbus-lib-api-specs
   - schoolbus-lib-ui-components

6. **Instrumente și utilități**
   - schoolbus-tools-data-migration
   - schoolbus-tools-dev-environment

## Editarea workflow-ului

Dacă dorești să adaugi, să modifici sau să elimini repo-uri, poți edita fișierul `.github/workflows/create-repositories.yml` și să modifici secțiunea care invocă funcția `create_repo`.

## Tabelul cu repozitorii și scopul lor

| Nume Repository | Descriere/Scop |
|-----------------|----------------|
| schoolbus-platform | Repository central pentru platforma School Bus - arhitectură, documentație și configurații globale |
| schoolbus-svc-routing | Serviciu pentru rutare și optimizare trasee |
| schoolbus-svc-tracking | Serviciu pentru tracking în timp real |
| schoolbus-svc-auth | Serviciu pentru autentificare și autorizare |
| schoolbus-svc-notifications | Serviciu pentru notificări |
| schoolbus-svc-users | Serviciu pentru management utilizatori |
| schoolbus-svc-scheduling | Serviciu pentru programare și planificare |
| schoolbus-svc-analytics | Serviciu pentru analiză și raportare |
| schoolbus-svc-fleet | Serviciu pentru managementul flotei |
| schoolbus-svc-geo | Serviciu pentru geolocalizare |
| schoolbus-app-admin-web | Aplicație web pentru administratori |
| schoolbus-app-dispatch-web | Aplicație web pentru dispeceri |
| schoolbus-app-fleet-web | Aplicație web pentru managementul flotei |
| schoolbus-app-parent-web | Aplicație web pentru părinți |
| schoolbus-app-driver-mobile | Aplicație mobilă pentru șoferi |
| schoolbus-app-parent-mobile | Aplicație mobilă pentru părinți |
| schoolbus-app-monitor-mobile | Aplicație mobilă pentru monitorizare |
| schoolbus-infra-gke | Infrastructură Google Kubernetes Engine |
| schoolbus-infra-terraform | Configurații Terraform pentru toate componentele |
| schoolbus-devops-ci | Pipeline-uri CI/CD |
| schoolbus-devops-monitoring | Monitoring, alerting și observabilitate |
| schoolbus-lib-common | Biblioteci și componente reutilizabile |
| schoolbus-lib-api-specs | Specificații API (OpenAPI/Swagger) |
| schoolbus-lib-ui-components | Componente UI comune pentru aplicațiile web/mobile |
| schoolbus-tools-data-migration | Instrumente pentru migrarea datelor |
| schoolbus-tools-dev-environment | Configurații pentru medii de dezvoltare | 