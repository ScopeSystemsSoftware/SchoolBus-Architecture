# ARHITECTURĂ COMPLETĂ SCHOOLBUS
Plan de Implementare Multi-Tenant Multi-Cloud pentru Platforma SchoolBus
Versiune: 2.0
Data: Aprilie 2023
CUPRINS
EXECUTIVE SUMMARY
ARHITECTURĂ TEHNICĂ
2.1 Prezentare Generală
2.2 Arhitectura Cloud și Infrastructură
2.3 Arhitectura Aplicației
2.4 Securitate și Conformitate
2.5 Data Management
2.6 Integrări
PLAN DE IMPLEMENTARE ÎN 3 FAZE
3.1 Faza 1: Fundația Tenant-Ready (Lunile 1-4)
3.2 Faza 2: Funcționalități Core și MVP (Lunile 5-8)
3.3 Faza 3: Transformare Multi-Tenant Completă (Lunile 9-10)
SETUP CLOUD ȘI DEVOPS
4.1 Infrastructură Terraform
4.2 Configurare Kubernetes și Istio
4.3 CI/CD Pipeline
4.4 Monitoring și Observabilitate
ANALIZA COSTURI
5.1 Costuri Dezvoltare Inițială (Faza 1-2)
5.2 Costuri Transformare Multi-Tenant (Faza 3)
5.3 Costuri Operaționale Pe Tenant
5.4 TCO și ROI
PLAN DE RESURSE ȘI ECHIPĂ
6.1 Structura Echipei
6.2 Roluri și Responsabilități
6.3 Alocarea Resurselor pe Faze
RISCURI ȘI STRATEGII DE ATENUARE
ANEXE TEHNICE
1. EXECUTIVE SUMMARY
Platforma SchoolBus este concepută ca o soluție completă pentru gestionarea transportului școlar, inițial pentru școli individuale, cu o evoluție planificată către un model multi-tenant multi-cloud pentru primării și administrații locale. Planul de implementare este structurat în trei faze, încadrându-se în timeline-ul de 6-8 luni pentru lansarea inițială a platformei, urmat de transformarea completă în arhitectură multi-tenant.
Obiective Strategice:
Dezvoltarea unei platforme funcționale în 6-8 luni pentru utilizare imediată
Proiectarea arhitecturii "tenant-ready" de la început pentru migrare eficientă ulterioară
Implementarea completă multi-tenant și multi-cloud în lunile 9-10
Maximizarea eficienței echipei existente, cu rol extins pentru arhitect
Beneficii Cheie:
Lansare rapidă pe piață cu funcționalități esențiale (6-8 luni)
Reducerea costurilor operaționale cu 40-60% prin arhitectura multi-tenant
Reziliență sporită prin distribuția multi-cloud
Scalabilitate eficientă pentru onboarding rapid al primăriilor
Izolare completă între tenanți pentru securitate și conformitate
2. ARHITECTURĂ TEHNICĂ
2.1 Prezentare Generală
Arhitectura SchoolBus este concepută ca o platformă cloud-native bazată pe microservicii, distribuită pe trei tipuri de infrastructuri Kubernetes (Google Kubernetes Engine, VPS Kubernetes și un cluster Kubernetes bare-metal), cu Istio ca service mesh pentru izolarea și rutarea traficului multi-tenant.
Principii arhitecturale:
Cloud-Native: Utilizare completă a serviciilor cloud, fără infrastructură on-premises
Multi-Cloud: Distribuție pe mai multe clustere pentru reziliență și disponibilitate
Microservicii: Dezvoltare și scalare independentă a componentelor
API-First: Toate funcționalitățile expuse prin API-uri REST documentate
Infrastructure-as-Code: Întreaga infrastructură definită și versionată în Terraform
Tenant-Ready Design: Modelul de date și componentele proiectate cu izolare între tenanți de la început
Security-by-Design: Securitate integrată în toate etapele, nu adăugată ulterior
2.2 Arhitectura Cloud și Infrastructură
Arhitectura Multi-Cloud
                      ┌─────────────────────┐
                         │ Google Cloud Load   │
                         │ Balancer (Global)   │
                         └──────────┬──────────┘
                                   │
                         ┌─────────▼──────────┐
                         │   Traffic Director  │
                         └──────────┬─────────┘
                        ┌───────────┼───────────┐
              ┌─────────▼─────┐ ┌───▼────────┐ ┌▼────────────┐
              │  GKE Cluster  │ │VPS Cluster │ │Bare-metal   │
              │  (Production) │ │ (Staging)  │ │  (Dev)      │
              └──────┬────────┘ └─────┬──────┘ └──────┬──────┘
                     │                │               │
              ┌──────▼────────┐ ┌─────▼──────┐ ┌──────▼──────┐
              │ Istio Service │ │Istio Svc   │ │Istio Svc    │
              │    Mesh       │ │  Mesh      │ │  Mesh       │
              └──────┬────────┘ └─────┬──────┘ └──────┬──────┘
          ┌──────────┼─────────┬──────┼──────┬────────┼────────┐
          │          │         │      │      │        │        │
┌─────────▼──┐ ┌─────▼────┐ ┌─▼──────┐ ┌────▼───┐ ┌──▼─────┐ ┌▼────────┐
│ Tenant A   │ │ Tenant B │ │Tenant C│ │Tenant A│ │Tenant B│ │Tenant C │
│ Namespace  │ │ Namespace│ │Namespc.│ │Namespc.│ │Namespc.│ │Namespace│
└────────────┘ └──────────┘ └────────┘ └────────┘ └────────┘ └─────────┘

1. Multi-Cloud Kubernetes
Google Kubernetes Engine (GKE): Cluster principal pentru producție
Auto-scaling node pools (2-6 noduri)
Regional cluster pentru disponibilitate înaltă
Automatic node upgrades și auto-repair
VPS Kubernetes (DigitalOcean): Cluster secundar pentru staging și backup
Managed Kubernetes cost-eficient
Cross-region failover
Backup pentru disaster recovery
Bare-Metal Kubernetes (k3s): Cluster local pentru developeri și testare
Lightweight Kubernetes pe hardware dedicat
Deployment rapid pentru dezvoltare și testare
Mediu izolat pentru teste de securitate
2. Database & Storage
PostgreSQL: Stocare primară de date
Cloud SQL în GCP pentru producție
Managed PostgreSQL în DigitalOcean pentru backup
High availability și automatic failover
Multi-tenant isolation prin schema per tenant
Google Cloud Storage / DigitalOcean Spaces
Multi-regional pentru documente și fișiere
Hierarchical namespace cu folder per tenant
Cross-cloud replication pentru backup
Lifecycle policies pentru optimizare costuri
3. Networking & Security
Global Load Balancing
Google Cloud Load Balancer pentru rutare globală
Traffic Director pentru distribuție între clustere
Health checks pentru redirecționare automată în caz de probleme
Security Edge
Cloud Armor pentru protecție DDoS și WAF
Cloud IAM pentru autorizare la nivel de cloud
Kubernetes Network Policies pentru izolare trafic
Secret Manager pentru credentials și secrets
4. Additional Services
Redis: Memorystore în GCP pentru caching
Pub/Sub: Pentru comunicare asincronă între servicii
Cloud CDN / DigitalOcean CDN: Pentru conținut static
Cloud KMS: Management chei criptare
2.3 Arhitectura Aplicației
Arhitectura Microservicii NestJS
Backend Microservicii
API Gateway
NestJS cu custom middleware
JWT validation și tenant context propagation
Rate limiting și circuit breakers
Rutare către servicii și versioning API
Integrare cu Istio pentru rutare avansată
Identity & Access Management
NestJS cu JWT și Guards
Role-Based Access Control (RBAC)
Tenant-context în tokens
TypeORM pentru access la baza de date
School Management Service
NestJS cu TypeORM
CRUD pentru școli
Multi-tenant isolation prin tenant ID
Events pentru integrare cu alte servicii
Student Management Service
NestJS cu TypeORM
CRUD pentru elevi
Asociere cu școli
Filtrare automată după tenant ID
Bus Management Service
NestJS cu TypeORM
CRUD pentru flota de autobuze
Management rute și șoferi
APIs pentru integrare cu sisteme externe
Route Planning Service
NestJS cu TypeORM
Planificare și optimizare rute
Integrare cu mapping services
Calculare timpi de sosire estimați
Live Tracking Service
NestJS cu Socket.IO pentru real-time
Tenant-based channels pentru securitate
Procesare date GPS în timp real
Algoritmi pentru tracking și ETA update
Notification Service
NestJS microservice
Push notifications și email
Templating și personalizare
Tenant-specific notification preferences
Admin & Reporting
NestJS cu GraphQL
Dashboard analytics
Rapoarte și export date
Configurare tenant-specific
Frontend Components
Web Application
Next.js (React) cu SSR
Material UI pentru design consistent
Tenant context provider
Progressive Web App capabilities
Apollo Client pentru GraphQL
Mobile App
React Native (iOS & Android)
Tenant selection și context
Offline mode cu sincronizare
Background tracking
Push notifications
2.4 Securitate și Conformitate
1. Tenant Isolation
Istio service mesh pentru control trafic
Kubernetes namespace per tenant
Network Policies pentru izolare la nivel de pod
mTLS pentru comunicare criptată între servicii
Authorization Policies pentru control acces granular
2. Authentication & Authorization
JWT pentru autentificare și propagare context
Tenant ID în JWT pentru context multi-tenant
Guards NestJS pentru verificare acces
Tenant interceptor pentru verificare și setare context
3. Data Security
Encryption in transit (TLS 1.3)
Encryption at rest pentru toate datele
Database column encryption pentru date sensibile
Tenant isolation la nivel de rows
Tenant middleware pentru filtrare automată date
4. Network Security
Network Policies în Kubernetes
Istio AuthorizationPolicies
Private Google Access pentru servicii GCP
DDoS protection
Helmet.js pentru header security
5. Compliance & Auditing
Audit logging comprehensiv
GDPR compliance prin design
Data retention policies configurabile
User consent management
Audit trails pentru toate modificările
2.5 Data Management
Strategie Multi-Tenant Database:
Faza 1-2: Shared Database, Tenant ID Filtering
O singură instanță PostgreSQL
Tenant ID în toate tabelele pentru izolare
AsyncLocalStorage pentru propagare context tenant
TypeORM pentru ORM și migrații
Interceptor pentru setare automată tenant ID
Middleware pentru filtrare automată date per tenant
Faza 3: Multi-Cloud Database Strategy
Primary: Database per tenant mare în GCP
Backup: Database per tenant în DigitalOcean
Development: Local database în bare-metal cluster
Automated provisioning pentru noi tenanți
Migration tools pentru transferul între cloud-uri
Synchronization mechanism pentru replicare
Entități Core în Modelul de Date:
Tenant: Informații despre organizație, setări, branding
School: Școli aparținând unui tenant
Student: Elevi înregistrați în școli
Bus: Autobuze în flota tenant-ului
Route: Rute de transport predefinite
VehiclePosition: Date real-time tracking
User: Utilizatori sistem cu roluri
Strategia de Migrare Date (Faza 2 -> Faza 3):
Dezvoltare tools pentru migrare automată
Blue/green deployment pentru zero downtime
Verificare integritate date post-migrare
Cross-cloud synchronization testing
Rollback capability pentru situații neprevăzute
2.6 Integrări
1. Mapping & Navigation
Google Maps Platform
Alternative open-source pentru redundanță
Geocoding și reverse geocoding
Route optimization
Real-time traffic integration
2. Notification Services
Push notifications pentru mobile
Email notifications
SMS gateway integration
In-app notifications
3. External Systems
REST APIs pentru integrare cu sisteme existente primării
Webhook support pentru evenimente
Import/export bulk data
SSO integration cu sisteme existente
3. PLAN DE IMPLEMENTARE ÎN 3 FAZE
3.1 Faza 1: Fundația Tenant-Ready (Lunile 1-4)
Obiectiv: Construirea infrastructurii de bază și a microserviciilor core, cu design pregătit pentru multi-tenancy.
Sprint 1-2: Infrastructure & DevOps Setup
Arhitect (5h/zi):
Definire arhitectură detaliată
Setup proiect GCP și IAM
Implementare Terraform modules de bază
Configurare CI/CD pipeline inițial
Deliverables:
Terraform modules pentru infrastructură multi-cloud
GKE și VPS Kubernetes clusters operaționale
CI/CD pipeline funcțional
Environment separation (dev/staging/prod)
Sprint 3-4: Core Services Foundation
Arhitect (4h/zi):
DB schema design cu considerente multi-tenant
API design și standardizare
Configurare Kubernetes base manifests
Istio service mesh setup inițial
Echipa Dev:
Implementare NestJS monorepo structură
Implementare API Gateway
Setup Identity Management
Dezvoltare tenant middleware și interceptor
Deliverables:
API Gateway funcțional
Authentication service cu suport tenant context
Database schema cu tenant isolation
Service-to-service communication framework
Sprint 5-6: School & Student Management
Arhitect (4h/zi):
Review arhitectură și optimizări
Implementare monitoring și logging
Configurare security baselines
Echipa Dev:
Implementare School Management Service
Dezvoltare Student Management Service
Integrare tenant filtering
Import/export system pentru date
Deliverables:
School Management Service complet
Student Management Service funcțional
Multi-tenant data filtering
Monitoring și logging operațional
Sprint 7-8: Bus & Route Services
Arhitect (4h/zi):
Audit securitate inițial
Optimizare performance
Planificare detalii multi-tenant
Echipa Dev:
Implementare Bus Management
Dezvoltare Route Planning
Relații între entități și validare
Testing framework
Deliverables:
Bus & Route Management Services
Integration tests comprehensive
End-to-end testing framework
Initial tenant administration
3.2 Faza 2: Funcționalități Core și MVP (Lunile 5-8)
Obiectiv: Dezvoltarea componentelor frontend, integrări avansate și lansarea MVP-ului aplicației.
Sprint 9-10: Live Tracking & Notifications
Arhitect (4h/zi):
Arhitectură real-time data flow
Socket.IO tenant channels design
Multi-cloud data replication strategy
Echipa Dev:
Implementare Live Tracking Service cu Socket.IO
Dezvoltare Notification Service
Tenant-based channels pentru tracking
Real-time updates framework
Deliverables:
Live Tracking Service funcțional
Notification Service cu push și email
Real-time data synchronization
Tenant-isolated WebSocket channels
Sprint 11-12: Web Application
Arhitect (4h/zi):
Frontend architecture review
Multi-tenant UI strategy
Security assessment pentru UI
Echipa Frontend:
Dezvoltare Next.js application
Implementare UI components
Admin dashboard
Tenant selector și context provider
Deliverables:
Web application completă
Responsive design pentru toate device-uri
Admin dashboard funcțional
Tenant-specific UI customization
Sprint 13-14: Mobile Application
Arhitect (4h/zi):
Mobile app architecture review
Offline strategy design
Multi-tenant mobile considerations
Echipa Mobile:
Dezvoltare React Native app
Implementare tracking în background
Offline capabilities
Tenant selection și context
Deliverables:
Mobile app funcțională (iOS & Android)
Background tracking
Offline support cu sync
Multi-tenant support pe mobile
Sprint 15-16: Testing & Deployment
Arhitect (5h/zi):
Multi-cloud deployment strategy
Scalability testing
Production readiness review
Documentation
Echipa Dev & QA:
End-to-end testing cu Cypress/Playwright
Performance testing
Security testing
User acceptance testing
Deliverables:
Aplicație completă testată
Production environment configurat
Multi-cloud deployment validat
Documentație tehnică și user
3.3 Faza 3: Transformare Multi-Tenant Multi-Cloud Completă (Lunile 9-10)
Obiectiv: Transformarea platformei într-o soluție multi-tenant completă cu distribuție multi-cloud pentru reziliență și scalabilitate.
Sprint 17-18: Database Transformation
Arhitect (5h/zi):
Database per tenant strategy
Cross-cloud replication design
Zero-downtime migration plan
Echipa Dev:
Implementare database per tenant
Dezvoltare migration tools
Cross-cloud database synchronization
Testing comprehensive pentru data integrity
Deliverables:
Database architecture multi-tenant completă
Migration tools funcționale
Cross-cloud data replication
Data validation framework
Sprint 19-20: Multi-Cloud Infrastructure
Arhitect (5h/zi):
Istio mesh multi-cluster setup
Traffic Director configuration
Disaster recovery strategy
Network policies pentru security
Echipa DevOps:
Implementare Istio multi-cluster
Configurare Traffic Director
Deployment automation cross-cloud
Istio configuration completă
Deliverables:
Multi-cluster service mesh
Global load balancing
Cross-cloud deployment
Disaster recovery capability
Sprint 21-22: Tenant Management & Go-Live
Arhitect (5h/zi):
Final architecture review
Tenant onboarding automation
Production deployment strategy
Echipa Completă:
Dezvoltare tenant management console
Implementare tenant isolation completă
Onboarding workflow automation
Migration of existing data
Deliverables:
Tenant management dashboard
Automated tenant provisioning
Multi-cloud, multi-tenant deployment
Full tenant isolation
4. SETUP CLOUD ȘI DEVOPS
4.1 Infrastructură Terraform
Structura repository Terraform:
/
├── modules/
│   ├── gke/                 # Google Kubernetes Engine module
│   ├── digitalocean/        # DigitalOcean Kubernetes module
│   ├── baremetal/           # Kubernetes Bare-Metal module
│   ├── istio/               # Istio service mesh configuration
│   ├── traffic_director/    # Traffic Director setup
│   ├── tenant/              # Tenant provisioning module
│   ├── monitoring/          # Prometheus, Grafana, Jaeger
│   └── database/            # Database provisioning
├── environments/
│   ├── dev/                 # Development environment
│   ├── staging/             # Staging environment
│   └── prod/                # Production environment
├── multi-tenant-multicloud.tf # Main configuration
├── variables.tf              # Variable definitions
└── terraform.tfvars          # Variable values (not in Git)

Example GKE Module Configuration:
module "gke" {
  source           = "./modules/gke"
  project_id       = var.project_id
  cluster_name     = "schoolbus-cluster"
  region           = "us-central1"
  network          = "vpc-01"
  subnetwork       = "us-central1-01"
  ip_range_pods    = "ip-range-pods"
  ip_range_services = "ip-range-services"
  node_pools = [
    {
      name            = "default-node-pool"
      machine_type    = "e2-standard-2"
      min_count       = 2
      max_count       = 6
      disk_size_gb    = 100
      disk_type       = "pd-standard"
      image_type      = "COS_CONTAINERD"
      auto_repair     = true
      auto_upgrade    = true
    }
  ]
}

Example Tenant Module (Faza 3):
module "tenant" {
  source           = "./modules/tenant"
  tenant_id        = "primaria-sector1"
  tenant_name      = "Primaria Sector 1"
  gke_cluster_name = module.gke.cluster_name
  do_cluster_name  = module.digitalocean.cluster_name
  create_namespace = true
  resource_limits = {
    cpu      = "4"
    memory   = "8Gi"
    storage  = "100Gi"
  }
  istio_enabled = true
  db_provision  = true
  db_type       = "dedicated" # or "shared"
}

4.2 Configurare Kubernetes și Istio
Namespace Structure:
Faza 1-2 (Shared):
- default
- kube-system
- tenant-system     # Tenant management services
- istio-system      # Istio control plane
- monitoring        # Prometheus, Grafana, Jaeger
- cert-manager      # Certificate management
- schoolbus         # Application microservices

Faza 3 (Multi-Tenant):
- default
- kube-system
- istio-system      # Istio control plane
- monitoring        # Prometheus, Grafana, Jaeger
- tenant-system     # Tenant management services
- tenant-primaria-sector1   # Tenant-specific namespace
- tenant-primaria-sector2   # Tenant-specific namespace
- tenant-primaria-sector3   # Tenant-specific namespace

Istio Multi-Tenant Configuration:
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: tenant-routing
  namespace: istio-system
spec:
  hosts:
  - "*.schoolbus-mtn.example.com"
  gateways:
  - schoolbus-gateway
  http:
  - match:
    - uri:
        prefix: "/api"
      headers:
        x-tenant-id:
          exact: "primaria-sector1"
    route:
    - destination:
        host: api-gateway.tenant-primaria-sector1.svc.cluster.local
        port:
          number: 80
  - match:
    - uri:
        prefix: "/api"
      headers:
        x-tenant-id:
          exact: "primaria-sector2"
    route:
    - destination:
        host: api-gateway.tenant-primaria-sector2.svc.cluster.local
        port:
          number: 80

Network Policy for Tenant Isolation:
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: tenant-isolation
  namespace: tenant-primaria-sector1
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          tenant: primaria-sector1
    - namespaceSelector:
        matchLabels:
          name: istio-system
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          tenant: primaria-sector1
    - namespaceSelector:
        matchLabels:
          name: istio-system
    - namespaceSelector:
        matchLabels:
          name: monitoring


4.3 CI/CD Pipeline
GitHub Actions Workflow pentru NestJS:
name: SchoolBus NestJS CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Lint
      run: npm run lint
    - name: Test
      run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build
    - name: Build Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: false
        tags: schoolbus/api:${{ github.sha }}
        
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Google Cloud
      uses: google-github-actions/setup-gcloud@v1
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
    - name: Configure Docker for GCR
      run: gcloud auth configure-docker gcr.io
    - name: Build and Push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: gcr.io/${{ secrets.GCP_PROJECT_ID }}/schoolbus-api:${{ github.sha }}
    - name: Deploy to GKE
      run: |
        gcloud container clusters get-credentials schoolbus-cluster --region us-central1
        kubectl set image deployment/api-gateway api-gateway=gcr.io/${{ secrets.GCP_PROJECT_ID }}/schoolbus-api:${{ github.sha }} -n schoolbus


4.4 Monitoring și Observabilitate
Stack de Monitoring:
Metrics: Prometheus + Grafana + Grafana Agent pentru Node.js metrics
Logging: Google Cloud Logging + Elasticsearch + Winston
Tracing: Jaeger/Cloud Trace + OpenTelemetry pentru Node.js
Alerting: Grafana Alertmanager + PagerDuty
Prometheus Configuration (helm values):
prometheus:
  prometheusSpec:
    podMonitorSelectorNilUsesHelmValues: false
    serviceMonitorSelectorNilUsesHelmValues: false
    replicas: 2
    retention: 15d
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: 1000m
        memory: 2Gi
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: standard
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 50Gi

grafana:
  adminPassword: "${GRAFANA_PASSWORD}"
  persistence:
    enabled: true
    size: 10Gi
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
      - name: 'default'
        orgId: 1
        folder: 'SchoolBus'
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /var/lib/grafana/dashboards/default
  dashboards:
    default:
      tenant-overview:
        json: |
          {
            "title": "Tenant Overview",
            "uid": "tenant-overview"
            // Dashboard JSON contents
          }

jaeger:
  storage:
    type: elasticsearch
  ingress:
    enabled: true
    hosts:
      - jaeger.istio-monitoring

5. ANALIZA COSTURI
5.1 Costuri Dezvoltare Inițială (Faza 1-2)
Costuri Lunare de Infrastructură (6-8 luni):
| Componentă | Cost Lunar (USD) | Note |
|------------|------------------|------|
| GKE Autopilot | $200 | Optimizat pentru dezvoltare |
| DigitalOcean Kubernetes | $100 | Cluster de backup/staging |
| Cloud SQL | $100 | 1 instanță small |
| Cloud Storage | $50 | Storage documente și assets |
| Networking | $50 | Load Balancer, egress |
| Redis | $50 | Cache de bază |
| Monitoring | $50 | Logs, metrics, traces |
| Total | $600 | |
Costuri Total Faza 1-2 (8 luni):
Infrastructură: $4,800
Costuri adiționale (CI/CD, tools): $800
Total infrastructură Faza 1-2: $5,600
5.2 Costuri Transformare Multi-Tenant (Faza 3)
Costuri Lunare de Infrastructură (Faza 3):
| Componentă | Cost Lunar (USD) | Note |
|------------|------------------|------|
| GKE Standard | $300 | Control mai granular, node pools |
| DigitalOcean Kubernetes | $200 | Cluster redundant |
| Bare-Metal Kubernetes | $100 | Hardware dedicat |
| Cloud SQL | $200 | Multiple instanțe pentru tenant-uri |
| Cloud Storage | $100 | Creștere volum date |
| Networking | $150 | Istio, multiple ingress, Traffic Director |
| Redis | $100 | Cache distribuit |
| Monitoring | $100 | Monitoring per tenant |
| Total | $1,250 | |
Costuri Total Faza 3 (2 luni):
Infrastructură: $2,500
Costuri adiționale (migration tools, testing): $600
Total infrastructură Faza 3: $3,100
5.3 Costuri Operaționale Pe Tenant
Cost Lunar per Tenant (post-implementare):
| Număr Tenanți | Cost per Tenant (USD) | Note |
|---------------|------------------------|------|
| 1-3 | $500 | Cost ridicat datorită infrastructurii de bază |
| 4-10 | $200 | Distribuire costuri fixe |
| 11-20 | $150 | Economii de scală |
| 21+ | $100 | Economii semnificative |
Costuri Operaționale Estimative (monthly):
| Categoria | Cost Lunar (USD) | Note |
|-----------|------------------|------|
| Infrastructură | $1,250 | Infrastructură de bază |
| DevOps & Support | $500 | 0.25 FTE |
| Bugfixing & Updates | $500 | 0.25 FTE |
| Total | $2,250 | Plus costuri variabile per tenant |
5.4 TCO și ROI
Total Cost of Ownership (3 ani):
| Fază | Cost (USD) |
|------|------------|
| Dezvoltare Inițială (Faza 1-2) | $5,600 |
| Transformare Multi-Tenant (Faza 3) | $3,100 |
| Operațional Anul 1 (post-lansare) | $27,000 |
| Operațional Anul 2 | $27,000 |
| Operațional Anul 3 | $27,000 |
| Total 3 Ani | $89,700 |
ROI Estimativ în 3 ani:
Cu 15 tenanți (primării) în anul 2, costul pe tenant scade la aproximativ $200/lună
Cu 25 tenanți în anul 3, costul pe tenant scade la aproximativ $100/lună
Model multi-tenant permite onboarding rapid cu costuri marginale reduse
Reziliența multi-cloud reduce riscurile de disponibilitate
6. PLAN DE RESURSE ȘI ECHIPĂ
6.1 Structura Echipei
Echipa de Dezvoltare:
| Rol | FTE | Responsabilități |
|-----|-----|------------------|
| Arhitect / DevOps / Scrum Master | 0.5-0.6 (4-5h/zi) | Arhitectură, DevOps, Coordonare |
| Full Stack Developer (Backend focus) | 2 | NestJS microservicii, APIs, Database |
| Frontend Developer | 1 | Next.js, React, Admin Dashboard |
| Mobile Developer | 1 | React Native pentru iOS/Android |
| QA Engineer | 1 | Testing, Automation |
| UI/UX Designer | 0.5 | Design și UX |
6.2 Roluri și Responsabilități
Arhitect / DevOps / Scrum Master:
Design arhitectură tehnică multi-cloud
Terraform și Kubernetes setup
Istio service mesh configuration
CI/CD pipeline configuration
Sprint planning și management
Code reviews pentru arhitectură
DevOps tooling și automation
Monitoring setup
Full Stack Developers:
Dezvoltare NestJS microservicii
Implementare APIs
Multi-tenant middleware și interceptors
Integrări cu servicii externe
Performance optimization
Security implementation
Frontend Developer:
Next.js web application
Multi-tenant UI components
Admin dashboard
Tenant context provider
Progressive Web App features
Mobile Developer:
React Native application
Mobile-specific features
Background tracking
Push notifications
Offline support pentru multi-tenant
QA Engineer:
Test plans și strategy
Automated testing cu Jest/Cypress
Performance testing
Security testing
Multi-tenant testing
UI/UX Designer:
Design system creation
Multi-tenant UI/UX strategy
User flows și journeys
Design validation testing
Design implementation support
6.3 Alocarea Resurselor pe Faze
Faza 1: Fundația Tenant-Ready (Lunile 1-4)
Arhitect: 4-5h/zi (focus pe arhitectură și DevOps)
Full Stack Developers: 100%
Frontend Developer: 50% (research și component design)
Mobile Developer: 50% (research și planificare)
QA Engineer: 75% (setup testing framework)
UI/UX Designer: 100% (design system și core interfaces)
Faza 2: Funcționalități Core și MVP (Lunile 5-8) (continuare)
Arhitect: 4h/zi (focus pe optimizări și deployment)
Full Stack Developers: 100% (dezvoltare microservicii și integrări)
Frontend Developer: 100% (development complet web app)
Mobile Developer: 100% (development complet mobile app)
QA Engineer: 100% (testare comprehensivă)
UI/UX Designer: 50% (iterații pe baza feedback)
Faza 3: Transformare Multi-Tenant Multi-Cloud (Lunile 9-10)
Arhitect: 5h/zi (focus intensiv pe multi-tenancy și multi-cloud)
Full Stack Developers: 100% (adaptare servicii pentru multi-tenant)
Frontend Developer: 75% (tenant management UI și customization)
Mobile Developer: 50% (adaptări pentru multi-tenant)
QA Engineer: 100% (focus pe data integrity, security și performance)
UI/UX Designer: 25% (tenant branding și customization)
7. RISCURI ȘI STRATEGII DE ATENUARE
| Risc | Impact | Probabilitate | Strategie de Atenuare |
|------|--------|---------------|------------------------|
| Deadline 8 luni nerespectabil | Ridicat | Medie | Focus pe MVP, feature prioritization, potențial de reducere a scopului inițial cu păstrarea funcționalităților core |
| Complexitate multi-tenant mai mare decât anticipat | Ridicat | Medie | Design "tenant-ready" de la început, arhitectură modulară pentru refactoring ușor, sprijin extern pentru Faza 3 dacă e necesar |
| Sincronizare între clustere multi-cloud problematică | Ridicat | Medie | Testare riguroasă între medii, strategie de failover cu verificări de integritate, circuit breakers |
| Cost infrastructură peste buget | Mediu | Scăzută | Monitoring riguros costuri, optimizare continuă, backup plan pentru reducere resources în dev/staging |
| Securitate insuficientă pentru izolare tenant | Foarte ridicat | Medie | Istio authorization policies, network policy per namespace, audits regulate, penetration testing înainte de migrarea la multi-tenant |
| Performanță degradată în model multi-tenant | Ridicat | Medie | Benchmarking riguros, database indexing, caching strategy, monitoring granular per tenant |
| Dificultăți în distribuția multi-cloud | Ridicat | Ridicată | Testare cross-cloud extensivă, implementare graduală, mecanisme de failback, focus inițial pe un cluster principal |
| Scalabilitate insuficientă pentru creștere rapidă | Mediu | Scăzută | Stress testing periodic, proiectare pentru scalare de la început, identificarea potențialelor bottlenecks |
| Integrare dificilă cu sisteme existente primării | Mediu | Ridicată | API-first design, adaptoare flexibile, documentație extensivă, pilotare cu un client real |
| Overhead pentru Arhitect în roluri multiple | Ridicat | Ridicată | Automatizare extinsă DevOps, template-uri predefinite, potențial contractor part-time pentru peak-uri de muncă |
8. ANEXE TEHNICE
8.1 Diagrama Detaliată a Arhitecturii
                                 ┌───────────────────┐
                                 │    Client Apps    │
                                 │  Web    Mobile    │
                                 └─────────┬─────────┘
                                           │
                                           ▼
                        ┌──────────────────────────────────┐
                        │     Google Cloud Load Balancer   │
                        └──────────────────┬───────────────┘
                                           │
                                           ▼
                        ┌──────────────────────────────────┐
                        │        Traffic Director          │
                        └─┬─────────────┬──────────────┬───┘
          ┌───────────────┘             │              └───────────────┐
          │                             │                              │
┌─────────▼───────────┐      ┌──────────▼────────┐       ┌─────────────▼────────┐
│   GKE Cluster       │      │  DigitalOcean     │       │  Bare-Metal          │
│   (Production)      │      │  Kubernetes       │       │  Kubernetes          │
└─────────┬───────────┘      │  (Staging/Backup) │       │  (Development)       │
          │                  └─────────┬─────────┘       └─────────────┬────────┘
          ▼                            ▼                               ▼
┌─────────────────────┐      ┌─────────────────────┐     ┌───────────────────────┐
│  Istio Ingress      │      │  Istio Ingress      │     │  Istio Ingress        │
│  Gateway            │      │  Gateway            │     │  Gateway              │
└─────────┬───────────┘      └─────────┬───────────┘     └───────────┬───────────┘
          │                            │                             │
          ▼                            ▼                             ▼
┌─────────────────────┐      ┌─────────────────────┐     ┌───────────────────────┐
│   API Gateway       │      │   API Gateway       │     │   API Gateway         │
│   (NestJS)          │      │   (NestJS)          │     │   (NestJS)            │
└─────────┬───────────┘      └─────────┬───────────┘     └───────────┬───────────┘
          │                            │                             │
          ▼                            ▼                             ▼
┌─────────────────────┐      ┌─────────────────────┐     ┌───────────────────────┐
│  Microservicii      │      │  Microservicii      │     │  Microservicii        │
│                     │      │                     │     │                       │
│ ┌─────────────────┐ │      │ ┌─────────────────┐ │     │ ┌─────────────────┐   │
│ │ Identity        │ │      │ │ Identity        │ │     │ │ Identity        │   │
│ └─────────────────┘ │      │ └─────────────────┘ │     │ └─────────────────┘   │
│ ┌─────────────────┐ │      │ ┌─────────────────┐ │     │ ┌─────────────────┐   │
│ │ School Mgmt     │ │      │ │ School Mgmt     │ │     │ │ School Mgmt     │   │
│ └─────────────────┘ │      │ └─────────────────┘ │     │ └─────────────────┘   │
│ ┌─────────────────┐ │      │ ┌─────────────────┐ │     │ ┌─────────────────┐   │
│ │ Student Mgmt    │ │      │ │ Student Mgmt    │ │     │ │ Student Mgmt    │   │
│ └─────────────────┘ │      │ └─────────────────┘ │     │ └─────────────────┘   │
│ ┌─────────────────┐ │      │ ┌─────────────────┐ │     │ ┌─────────────────┐   │
│ │ Bus Management  │ │      │ │ Bus Management  │ │     │ │ Bus Management  │   │
│ └─────────────────┘ │      │ └─────────────────┘ │     │ └─────────────────┘   │
│ ┌─────────────────┐ │      │ ┌─────────────────┐ │     │ ┌─────────────────┐   │
│ │ Route Planning  │ │      │ │ Route Planning  │ │     │ │ Route Planning  │   │
│ └─────────────────┘ │      │ └─────────────────┘ │     │ └─────────────────┘   │
│ ┌─────────────────┐ │      │ ┌─────────────────┐ │     │ ┌─────────────────┐   │
│ │ Live Tracking   │ │      │ │ Live Tracking   │ │     │ │ Live Tracking   │   │
│ └─────────────────┘ │      │ └─────────────────┘ │     │ └─────────────────┘   │
│ ┌─────────────────┐ │      │ ┌─────────────────┐ │     │ ┌─────────────────┐   │
│ │ Notifications   │ │      │ │ Notifications   │ │     │ │ Notifications   │   │
│ └─────────────────┘ │      │ └─────────────────┘ │     │ └─────────────────┘   │
│ ┌─────────────────┐ │      │ ┌─────────────────┐ │     │ ┌─────────────────┐   │
│ │ Admin/Reporting │ │      │ │ Admin/Reporting │ │     │ │ Admin/Reporting │   │
│ └─────────────────┘ │      │ └─────────────────┘ │     │ └─────────────────┘   │
└─────────┬───────────┘      └─────────┬───────────┘     └───────────┬───────────┘
          │                            │                             │
          ▼                            ▼                             ▼
┌─────────────────────┐      ┌─────────────────────┐     ┌───────────────────────┐
│  Cloud SQL          │      │  DigitalOcean DB    │     │  Local PostgreSQL     │
│  (PostgreSQL)       │      │  (PostgreSQL)       │     │  (PostgreSQL)         │
└─────────────────────┘      └─────────────────────┘     └───────────────────────┘


8.2 Schema Baza de Date (Simplificată)
Faza 1-2 (Tenant ID în fiecare tabel):
+---------------+     +---------------+     +---------------+
| Tenant        |     | School        |     | Student       |
+---------------+     +---------------+     +---------------+
| id            |     | id            |     | id            |
| code          |     | tenant_id     |◄────| tenant_id     |
| name          |     | name          |     | school_id     |◄──┐
| contact_email |     | address       |     | first_name    |   │
| contact_phone |     | city          |     | last_name     |   │
| db_schema     |     | state         |     | grade         |   │
| active        |     | postal_code   |     | guardian_name |   │
| settings      |     | country       |     | guardian_phone|   │
| created_at    |     | phone         |     | created_at    |   │
| updated_at    |     | email         |     | updated_at    |   │
+---------------+     | type          |     +---------------+   │
                      | geo_lat       |                         │
                      | geo_lng       |                         │
                      | active        |◄────┐                   │
                      | created_at    |     │                   │
                      | updated_at    |     │                   │
                      +---------------+     │                   │
                                           │                   │
+---------------+     +---------------+     │                   │
| Bus           |     | Route         |     │                   │
+---------------+     +---------------+     │                   │
| id            |     | id            |     │                   │
| tenant_id     |     | tenant_id     |     │                   │
| name          |     | name          |     │                   │
| license_plate |     | description   |     │                   │
| make          |     | school_id     |◄────┘                   │
| model         |     | start_time    |                         │
| capacity      |     | end_time      |                         │
| driver_name   |     | active        |                         │
| driver_phone  |     | created_at    |                         │
| active        |     | updated_at    |                         │
| created_at    |     +---------------+                         │
| updated_at    |           ▲                                   │
+---------------+           │                                   │
        ▲                   │                                   │
        │                   │                                   │
        │                   │                                   │
+---------------+     +---------------+     +---------------+   │
| VehiclePosition|     | RouteStop     |     | StudentRoute  |   │
+---------------+     +---------------+     +---------------+   │
| id            |     | id            |     | id            |   │
| tenant_id     |     | tenant_id     |     | tenant_id     |   │
| bus_id        |◄────| route_id      |◄────| route_id      |   │
| latitude      |     | stop_number   |     | student_id    |◄──┘
| longitude     |     | address       |     | pickup        |
| heading       |     | latitude      |     | dropoff       |
| speed         |     | longitude     |     | active        |
| timestamp     |     | arrival_time  |     | created_at    |
| created_at    |     | created_at    |     | updated_at    |
| updated_at    |     | updated_at    |     +---------------+
+---------------+     +---------------+

Faza 3 (Database/Schema per Tenant):
// Database sau schema separată pentru fiecare tenant
// Cu aceeași structură ca mai sus, dar fără tenant_id
// Izolare completă la nivel de database

8.3 API Endpoints (Exemple)
Bus Management Service:
GET    /api/buses                - Get all buses for current tenant
GET    /api/buses/{id}           - Get specific bus
POST   /api/buses                - Create new bus
PUT    /api/buses/{id}           - Update bus
DELETE /api/buses/{id}           - Delete bus
GET    /api/buses/{id}/position  - Get last known position
GET    /api/buses/{id}/route     - Get current route
GET    /api/buses/{id}/schedule  - Get bus schedule

School & Student Management:
GET    /api/schools                    - Get all schools
GET    /api/schools/{id}               - Get specific school
POST   /api/schools                    - Create school
PUT    /api/schools/{id}               - Update school
DELETE /api/schools/{id}               - Delete school
GET    /api/schools/{id}/students      - Get students for school
GET    /api/students                   - Get all students
GET    /api/students/{id}              - Get specific student
POST   /api/students                   - Create student
PUT    /api/students/{id}              - Update student
DELETE /api/students/{id}              - Delete student
GET    /api/students/{id}/route        - Get route for student

8.4 Multi-Tenant Implementation Details
Request Flow (Faza 3):
Client sends request with tenant identifier in header:
.
Istio Ingress Gateway processes:
Routes based on tenant ID to appropriate namespace
Enforces mTLS communication
Applies rate limiting and security policies
API Gateway processes:
Validates JWT token
Extracts tenant ID from header
Sets tenant context in AsyncLocalStorage
Adds tenant context to internal headers
Routes to appropriate service
Service handling with NestJS:
TenantInterceptor validates tenant context
TenantService sets database connection for tenant
Applies tenant-specific configurations
Returns data from tenant's database
Istio VirtualService for Tenant Routing:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: tenant-routing
  namespace: istio-system
spec:
  hosts:
  - "api.schoolbus-mtn.example.com"
  gateways:
  - schoolbus-gateway
  http:
  - match:
    - headers:
        x-tenant-id:
          exact: "primaria-sector1"
    route:
    - destination:
        host: api-gateway.tenant-primaria-sector1.svc.cluster.local
        port:
          number: 80
  - match:
    - headers:
        x-tenant-id:
          exact: "primaria-sector2"
    route:
    - destination:
        host: api-gateway.tenant-primaria-sector2.svc.cluster.local
        port:
          number: 80
  - route:
    - destination:
        host: tenant-selector.tenant-system.svc.cluster.local
        port:
          number: 80


Implementarea Tenant ID în NestJS (Tenant Interceptor):
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantInterceptor.name);

  constructor(private readonly tenantService: TenantService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenantId = this.extractTenantId(request);

    if (!tenantId) {
      this.logger.warn('No tenant ID found in request');
      return next.handle();
    }

    // Validate tenant exists and is active
    const isValid = await this.tenantService.isTenantValid(tenantId);
    if (!isValid) {
      this.logger.warn(`Invalid or inactive tenant: ${tenantId}`);
      throw new BadRequestException(`Invalid or inactive tenant: ${tenantId}`);
    }

    // Set current tenant in AsyncLocalStorage context
    this.tenantService.setCurrentTenant(tenantId);
    
    // Add tenant to response header for debugging
    const response = context.switchToHttp().getResponse();
    response.setHeader('x-tenant-id', tenantId);

    // Process request and log afterward
    return next.handle().pipe(
      tap(() => {
        this.logger.debug(`Request processed for tenant: ${tenantId}`);
      }),
    );
  }

  private extractTenantId(request: any): string | null {
    // Extract from header
    const headerTenantId = request.headers['x-tenant-id'];
    if (headerTenantId) {
      return headerTenantId;
    }

    // Extract from path param
    if (request.params && request.params.tenantId) {
      return request.params.tenantId;
    }

    // Extract from query param
    if (request.query && request.query.tenantId) {
      return request.query.tenantId;
    }

    // Extract from JWT token
    if (request.user && request.user.tenantId) {
      return request.user.tenantId;
    }

    return null;
  }
}

8.5 CI/CD Deployment Strategy
Multi-Branch Strategy:
# Arhitectura Multi-Tenant Multi-Cloud pentru SchoolBus

Acest repository conține configurația Terraform pentru implementarea unei arhitecturi multi-tenant și multi-cloud pentru aplicația SchoolBus. Arhitectura folosește Google Kubernetes Engine (GKE), un VPS extern (DigitalOcean Kubernetes), și un cluster Kubernetes bare-metal, toate integrate cu Istio pentru a furniza funcționalități multi-tenant complete.

## Arhitectura

Arhitectura este concepută pentru a oferi:

1. **Izolare completă între tenanți**: Fiecare tenant (organizație școlară) are propriul namespace și resurse izolate.
2. **Scalabilitate distribuită**: Aplicația poate rula pe mai multe clustere pentru reziliență și distribuție geografică.
3. **Securitate prin design**: Implementare cu Istio pentru mTLS și politici de autorizare pentru fiecare tenant.
4. **Monitorizare centralizată**: Stack Prometheus-Grafana-Jaeger pentru observabilitate completă.

### Diagrama Arhitecturală

```
                         ┌─────────────────────┐
                         │ Google Cloud Load   │
                         │ Balancer (Global)   │
                         └──────────┬──────────┘
                                   │
                         ┌─────────▼──────────┐
                         │   Traffic Director  │
                         └──────────┬─────────┘
                        ┌───────────┼───────────┐
              ┌─────────▼─────┐ ┌───▼────────┐ ┌▼────────────┐
              │  GKE Cluster  │ │VPS Cluster │ │Bare-metal   │
              │  (Production) │ │ (Staging)  │ │  (Dev)      │
              └──────┬────────┘ └─────┬──────┘ └──────┬──────┘
                     │                │               │
              ┌──────▼────────┐ ┌─────▼──────┐ ┌──────▼──────┐
              │ Istio Service │ │Istio Svc   │ │Istio Svc    │
              │    Mesh       │ │  Mesh      │ │  Mesh       │
              └──────┬────────┘ └─────┬──────┘ └──────┬──────┘
          ┌──────────┼─────────┬──────┼──────┬────────┼────────┐
          │          │         │      │      │        │        │
┌─────────▼──┐ ┌─────▼────┐ ┌─▼──────┐ ┌────▼───┐ ┌──▼─────┐ ┌▼────────┐
│ Tenant A   │ │ Tenant B │ │Tenant C│ │Tenant A│ │Tenant B│ │Tenant C │
│ Namespace  │ │ Namespace│ │Namespc.│ │Namespc.│ │Namespc.│ │Namespace│
└────────────┘ └──────────┘ └────────┘ └────────┘ └────────┘ └─────────┘
```

## Componente principale

### 1. Multi-Cloud Kubernetes

- **Google Kubernetes Engine (GKE)**: Cluster principal pentru productie.
- **VPS Kubernetes (DigitalOcean)**: Cluster secundar pentru staging și backup.
- **Bare-Metal Kubernetes (k3s)**: Cluster local pentru developeri și testare.

### 2. Multi-Tenant cu Istio

- **Namespace per tenant**: Fiecare tenant are propriul namespace izolat.
- **Network Policies**: Politici de izolare între namespace-uri.
- **Authorization Policies**: Politici Istio pentru a controla accesul între servicii.
- **Gateway și VirtualServices**: Rutare pe bază de subdomenii pentru fiecare tenant.

### 3. Rutare Globală cu Traffic Director

- **Load Balancing Global**: Redirecționare trafic între clustere.
- **Health Checks**: Monitorizare stare pentru fiecare cluster.
- **Rutare pe bază de tenant**: Rutare header-based și domain-based.

### 4. Scalare Automată

- **Horizontal Pod Autoscaler**: Configurare HPA pentru toate serviciile.
- **Resource Quotas**: Limite de resurse configurate pentru fiecare tenant.

### 5. Observabilitate

- **Prometheus & Grafana**: Metrici și dashboards.
- **Jaeger**: Distributed tracing.
- **Kiali**: Vizualizare Service Mesh.

## Infrastructură ca și Cod

Întreaga infrastructură este definită ca și cod folosind Terraform, cu structura următoare:

- `multi-tenant-multicloud.tf`: Configurația principală.
- `variables.tf`: Definițiile variabilelor.
- `terraform.tfvars`: Valorile variabilelor (nu sunt stocate în Git).
- `modules/`: Module specializate pentru fiecare componentă.
  - `gke/`: Modul pentru Google Kubernetes Engine.
  - `digitalocean/`: Modul pentru DigitalOcean Kubernetes.
  - `baremetal/`: Modul pentru Kubernetes Bare-Metal.
  - `istio/`: Modul pentru instalarea și configurarea Istio.
  - `traffic_director/`: Modul pentru configurarea Traffic Director.

## Setup și Instalare

### Cerințe preliminare

- Terraform >= 1.0.0
- Google Cloud SDK
- DigitalOcean CLI
- kubectl
- Acces SSH la serverul bare-metal

### Pași de instalare

1. **Clonare repository**

```bash
git clone https://github.com/stefantirlea/schoolbus-mtn-infra-terraform.git
cd schoolbus-mtn-infra-terraform
```

2. **Inițializare Terraform**

```bash
terraform init
```

3. **Configurare variabile**

```bash
cp terraform.tfvars.example terraform.tfvars
# Editați terraform.tfvars cu valorile corespunzătoare
```

4. **Planificare Terraform**

```bash
terraform plan -out=plan.out
```

5. **Aplicare configurație**

```bash
terraform apply plan.out
```

## Gestionarea Tenanților

### Adăugare tenant nou

1. Adăugați tenant-ul în variabila `tenants` din `variables.tf`.
2. Rulați `terraform apply` pentru a crea namespace-ul și configurațiile Istio.
3. Creați DNS records pentru noul tenant (tenantX.schoolbus-mtn.example.com).

### Ștergere tenant

1. Îndepărtați tenant-ul din variabila `tenants`.
2. Executați `terraform apply` pentru a șterge resursele tenant-ului.

## Monitorizare și Debugging

### Dashboard-uri

- **Kiali**: http://kiali.istio-monitoring/
- **Grafana**: http://grafana.istio-monitoring/
- **Jaeger**: http://jaeger.istio-monitoring/

### Comenzi utile

```bash
# Verificare namespace-uri
kubectl get ns --context=gke
kubectl get ns --context=vps
kubectl get ns --context=baremetal

# Verificare pod-uri pentru un tenant
kubectl get pods -n tenant-tenanta --context=gke

# Verificare politici de autorizare Istio
kubectl get authorizationpolicy -A --context=gke

# Verificare VirtualServices
kubectl get virtualservices -A --context=gke
```

## Backup și Recuperare

Backup-urile sunt configurate pentru a rula zilnic la ora 2:00 AM și sunt păstrate pentru 30 de zile.

Pentru a recupera un backup:

```bash
# Listare backups
velero get backups

# Restaurare din backup
velero restore create --from-backup <backup-name>
```

## Concluzii

Această arhitectură multi-tenant și multi-cloud oferă:

- **Izolare**: Date și aplicații separate pentru fiecare școală (tenant).
- **Scalabilitate**: Răspândire pe mai multe clustere și regiuni.
- **Reziliență**: Toleranță la defecțiuni pentru regiuni/clustere.
- **Securitate**: Politici stricte de acces între tenanți.
- **Flexibilitate**: Posibilitatea de a rula diferite versiuni per tenant.
- **Cost optimizat**: Alocare eficientă a resurselor.

Pentru mai multe detalii, consultați documentația fiecărui modul. 

┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Feature   │──────►   Develop   │──────►    Main     │
│  Branches   │      │   Branch    │      │   Branch    │
└─────────────┘      └─────────────┘      └─────────────┘
                            │                    │
                            ▼                    ▼
                     ┌─────────────┐      ┌─────────────┐
                     │    Dev      │      │  Staging    │
                     │ Environment │      │ Environment │
                     └─────────────┘      └─────────────┘
                                                │
                                                ▼
                                          ┌─────────────┐
                                          │ Production  │
                                          │ Environment │
                                          └─────────────┘

Tenant-Specific Deployments (Faza 3):
                                ┌─────────────┐
                                │    Main     │
                                │   Branch    │
                                └──────┬──────┘
                                       │
                                       ▼
                               ┌───────────────┐
                               │   Base Image  │
                               │   Building    │
                               └───────┬───────┘
                                       │
                                       ▼
         ┌─────────────────────┬──────┴──────┬─────────────────────┐
         │                     │             │                     │
         ▼                     ▼             ▼                     ▼
┌─────────────────┐    ┌──────────────┐    ┌──────────────┐     ┌───────────────┐
│ Tenant Primaria │    │Tenant Primaria│    │Tenant Primaria│     │Tenant Primaria│
│    Sector 1     │    │   Sector 2    │    │   Sector 3    │     │    Sector 4   │
└────────┬────────┘    └───────┬──────┘    └───────┬──────┘     └───────┬───────┘
         │                     │                    │                    │
         ▼                     ▼                    ▼                    ▼
┌─────────────────┐    ┌──────────────┐    ┌──────────────┐     ┌───────────────┐
│  GKE Namespace  │    │ GKE Namespace │    │  DO Namespace │     │  DO Namespace │
│    Tenant-1     │    │   Tenant-2    │    │    Tenant-3   │     │    Tenant-4   │
└─────────────────┘    └──────────────┘    └──────────────┘     └───────────────┘

CONCLUZII ȘI RECOMANDĂRI
Implementarea platformei SchoolBus urmează o strategie în trei faze care echilibrează nevoia de lansare rapidă în 6-8 luni cu pregătirea pentru un model multi-tenant robust și reziliență multi-cloud. Prin proiectarea "tenant-ready" de la început și alocarea suplimentară de timp arhitectului pentru a gestiona aspectele DevOps, acest plan permite:
Lansare rapidă a platformei într-un model tradițional în primele 6-8 luni
Transformare graduală către arhitectura multi-tenant în lunile 9-10
Reziliență sporită prin distribuție multi-cloud
Optimizare costuri prin partajarea infrastructurii între multiple primării
Izolare completă între tenanți pentru securitate și conformitate
Scalabilitate eficientă pentru onboarding rapid al noilor clienți
Recomandări cheie pentru succes:
Implementarea Istio Service Mesh de la început pentru a facilita tranziția la multi-tenant
Investiție în DevOps și automatizare pentru a reduce overhead-ul pe termen lung
Dezvoltarea unui tenant onboarding process automatizat pentru scalare rapidă
Strategia multi-cloud cu GKE ca principal, DigitalOcean ca backup și bare-metal pentru dezvoltare
Monitoring granular per tenant pentru identificarea problemelor de performanță
Security reviews regulate pe măsură ce platforma evoluează către multi-tenant
Testare riguroasă a failover între clustere pentru a asigura reziliența
Această abordare permite SchoolBus să intre pe piață rapid, demonstrând valoarea produsului, în timp ce construiește fundația pentru o platformă multi-tenant, multi-cloud scalabilă și cost-eficientă pentru primăriile și administrațiile locale din România.
