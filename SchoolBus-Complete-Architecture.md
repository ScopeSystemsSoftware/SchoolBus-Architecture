# ARHITECTURĂ COMPLETĂ SCHOOLBUS
### Plan de Implementare Multi-Tenant Multi-Cloud pentru Platforma SchoolBus
Versiune: 2.0
Data: Aprilie 2023

## CUPRINS
1. [EXECUTIVE SUMMARY](#1-executive-summary)
2. [ARHITECTURĂ TEHNICĂ](#2-arhitectură-tehnică)
3. [PLAN DE IMPLEMENTARE ÎN 3 FAZE](#3-plan-de-implementare-în-3-faze)
4. [SETUP CLOUD ȘI DEVOPS](#4-setup-cloud-și-devops)
5. [ANALIZA COSTURI](#5-analiza-costuri)
6. [PLAN DE RESURSE ȘI ECHIPĂ](#6-plan-de-resurse-și-echipă)
7. [RISCURI ȘI STRATEGII DE ATENUARE](#7-riscuri-și-strategii-de-atenuare)
8. [ANEXE TEHNICE](#8-anexe-tehnice)

## 1. EXECUTIVE SUMMARY

Platforma SchoolBus este concepută ca o soluție completă pentru gestionarea transportului școlar, inițial pentru școli individuale, cu o evoluție planificată către un model multi-tenant multi-cloud pentru primării și administrații locale. Planul de implementare este structurat în trei faze, încadrându-se în timeline-ul de 6-8 luni pentru lansarea inițială a platformei, urmat de transformarea completă în arhitectură multi-tenant.

**Obiective Strategice:**
- Dezvoltarea unei platforme funcționale în 6-8 luni pentru utilizare imediată
- Proiectarea arhitecturii "tenant-ready" de la început pentru migrare eficientă ulterioară
- Implementarea completă multi-tenant și multi-cloud în lunile 9-10
- Maximizarea eficienței echipei existente, cu rol extins pentru arhitect

**Beneficii Cheie:**
- Lansare rapidă pe piață cu funcționalități esențiale (6-8 luni)
- Reducerea costurilor operaționale cu 40-60% prin arhitectura multi-tenant
- Reziliență sporită prin distribuția multi-cloud
- Scalabilitate eficientă pentru onboarding rapid al primăriilor
- Izolare completă între tenanți pentru securitate și conformitate

## 2. ARHITECTURĂ TEHNICĂ

### 2.1 Prezentare Generală

Arhitectura SchoolBus este concepută ca o platformă cloud-native bazată pe microservicii, distribuită pe trei tipuri de infrastructuri Kubernetes (Google Kubernetes Engine, VPS Kubernetes și un cluster Kubernetes bare-metal), cu Istio ca service mesh pentru izolarea și rutarea traficului multi-tenant.

**Principii arhitecturale:**
- **Cloud-Native**: Utilizare completă a serviciilor cloud, fără infrastructură on-premises
- **Multi-Cloud**: Distribuție pe mai multe clustere pentru reziliență și disponibilitate
- **Microservicii**: Dezvoltare și scalare independentă a componentelor
- **API-First**: Toate funcționalitățile expuse prin API-uri REST documentate
- **Infrastructure-as-Code**: Întreaga infrastructură definită și versionată în Terraform
- **Tenant-Ready Design**: Modelul de date și componentele proiectate cu izolare între tenanți de la început
- **Security-by-Design**: Securitate integrată în toate etapele, nu adăugată ulterior

### 2.2 Arhitectura Cloud și Infrastructură

#### Multi-Cloud Kubernetes
- **Google Kubernetes Engine (GKE)**: Cluster principal pentru producție
  - Auto-scaling node pools (2-6 noduri)
  - Regional cluster pentru disponibilitate înaltă
  - Automatic node upgrades și auto-repair
- **VPS Kubernetes (DigitalOcean)**: Cluster secundar pentru staging și backup
  - Managed Kubernetes cost-eficient
  - Cross-region failover
  - Backup pentru disaster recovery
- **Bare-Metal Kubernetes (k3s)**: Cluster local pentru developeri și testare
  - Lightweight Kubernetes pe hardware dedicat
  - Deployment rapid pentru dezvoltare și testare
  - Mediu izolat pentru teste de securitate

**Arhitectura Multi-Cloud:**
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

#### Database & Storage
- **PostgreSQL**: Stocare primară de date
  - Cloud SQL în GCP pentru producție
  - Managed PostgreSQL în DigitalOcean pentru backup
  - High availability și automatic failover
  - Multi-tenant isolation prin schema per tenant
- **Cloud Storage / DigitalOcean Spaces**
  - Multi-regional pentru documente și fișiere
  - Hierarchical namespace cu folder per tenant
  - Cross-cloud replication pentru backup
  - Lifecycle policies pentru optimizare costuri

#### Networking & Security
- **Global Load Balancing**
  - Google Cloud Load Balancer pentru rutare globală
  - Traffic Director pentru distribuție între clustere
  - Health checks pentru redirecționare automată în caz de probleme
- **Security Edge**
  - Cloud Armor pentru protecție DDoS și WAF
  - Cloud IAM pentru autorizare la nivel de cloud
  - Kubernetes Network Policies pentru izolare trafic
  - Secret Manager pentru credentials și secrets

### 2.3 Arhitectura Aplicației

#### Backend Microservicii NestJS
- **API Gateway**
  - NestJS cu custom middleware
  - JWT validation și tenant context propagation
  - Rate limiting și circuit breakers
  - Rutare către servicii și versioning API
  - Integrare cu Istio pentru rutare avansată
- **Identity & Access Management**
  - NestJS cu JWT și Guards
  - Role-Based Access Control (RBAC)
  - Tenant-context în tokens
  - TypeORM pentru access la baza de date
- **School Management Service**
  - NestJS cu TypeORM
  - CRUD pentru școli
  - Multi-tenant isolation prin tenant ID
  - Events pentru integrare cu alte servicii
- **Student Management Service**
  - NestJS cu TypeORM
  - CRUD pentru elevi
  - Asociere cu școli
  - Filtrare automată după tenant ID
- **Bus Management Service**
  - NestJS cu TypeORM
  - CRUD pentru flota de autobuze
  - Management rute și șoferi
  - APIs pentru integrare cu sisteme externe
- **Route Planning Service**
  - NestJS cu TypeORM
  - Planificare și optimizare rute
  - Integrare cu mapping services
  - Calculare timpi de sosire estimați
- **Live Tracking Service**
  - NestJS cu Socket.IO pentru real-time
  - Tenant-based channels pentru securitate
  - Procesare date GPS în timp real
  - Algoritmi pentru tracking și ETA update
- **Notification Service**
  - NestJS microservice
  - Push notifications și email
  - Templating și personalizare
  - Tenant-specific notification preferences
- **Admin & Reporting**
  - NestJS cu GraphQL
  - Dashboard analytics
  - Rapoarte și export date
  - Configurare tenant-specific

#### Frontend Components
- **Web Application**
  - Next.js (React) cu SSR
  - Material UI pentru design consistent
  - Tenant context provider
  - Progressive Web App capabilities
  - Apollo Client pentru GraphQL
- **Mobile App**
  - React Native (iOS & Android)
  - Tenant selection și context
  - Offline mode cu sincronizare
  - Background tracking
  - Push notifications

### 2.4 Securitate și Conformitate

#### Tenant Isolation
- Istio service mesh pentru control trafic
- Kubernetes namespace per tenant
- Network Policies pentru izolare la nivel de pod
- mTLS pentru comunicare criptată între servicii
- Authorization Policies pentru control acces granular

#### Authentication & Authorization
- JWT pentru autentificare și propagare context
- Tenant ID în JWT pentru context multi-tenant
- Guards NestJS pentru verificare acces
- Tenant interceptor pentru verificare și setare context

#### Data Security
- Encryption in transit (TLS 1.3)
- Encryption at rest pentru toate datele
- Database column encryption pentru date sensibile
- Tenant isolation la nivel de rows
- Tenant middleware pentru filtrare automată date

### 2.5 Data Management

#### Strategie Multi-Tenant Database:
**Faza 1-2: Shared Database, Tenant ID Filtering**
- O singură instanță PostgreSQL
- Tenant ID în toate tabelele pentru izolare
- AsyncLocalStorage pentru propagare context tenant
- TypeORM pentru ORM și migrații
- Interceptor pentru setare automată tenant ID
- Middleware pentru filtrare automată date per tenant

**Faza 3: Multi-Cloud Database Strategy**
- Primary: Database per tenant mare în GCP
- Backup: Database per tenant în DigitalOcean
- Development: Local database în bare-metal cluster
- Automated provisioning pentru noi tenanți
- Migration tools pentru transferul între cloud-uri
- Synchronization mechanism pentru replicare

#### Entități Core în Modelul de Date:
- Tenant: Informații despre organizație, setări, branding
- School: Școli aparținând unui tenant
- Student: Elevi înregistrați în școli
- Bus: Autobuze în flota tenant-ului
- Route: Rute de transport predefinite
- VehiclePosition: Date real-time tracking
- User: Utilizatori sistem cu roluri

### 2.6 Integrări

1. **Mapping & Navigation**
   - Google Maps Platform
   - Alternative open-source pentru redundanță
   - Geocoding și reverse geocoding
   - Route optimization
   - Real-time traffic integration

2. **Notification Services**
   - Push notifications pentru mobile
   - Email notifications
   - SMS gateway integration
   - In-app notifications

3. **External Systems**
   - REST APIs pentru integrare cu sisteme existente primării
   - Webhook support pentru evenimente
   - Import/export bulk data
   - SSO integration cu sisteme existente

## 3. PLAN DE IMPLEMENTARE ÎN 3 FAZE

### 3.1 Faza 1: Fundația Tenant-Ready (Lunile 1-4)

**Obiectiv:** Construirea infrastructurii de bază și a microserviciilor core, cu design pregătit pentru multi-tenancy.

**Sprint 1-2: Infrastructure & DevOps Setup**
- Arhitect (5h/zi):
  - Definire arhitectură detaliată
  - Setup proiect GCP și IAM
  - Implementare Terraform modules de bază
  - Configurare CI/CD pipeline inițial
- Deliverables:
  - Terraform modules pentru infrastructură multi-cloud
  - GKE și VPS Kubernetes clusters operaționale
  - CI/CD pipeline funcțional
  - Environment separation (dev/staging/prod)

**Sprint 3-4: Core Services Foundation**
- Arhitect (4h/zi):
  - DB schema design cu considerente multi-tenant
  - API design și standardizare
  - Configurare Kubernetes base manifests
  - Istio service mesh setup inițial
- Echipa Dev:
  - Implementare NestJS monorepo structură
  - Implementare API Gateway
  - Setup Identity Management
  - Dezvoltare tenant middleware și interceptor
- Deliverables:
  - API Gateway funcțional
  - Authentication service cu suport tenant context
  - Database schema cu tenant isolation
  - Service-to-service communication framework

**Sprint 5-6: School & Student Management**
- Deliverables:
  - School Management Service complet
  - Student Management Service funcțional
  - Multi-tenant data filtering
  - Monitoring și logging operațional

**Sprint 7-8: Bus & Route Services**
- Deliverables:
  - Bus & Route Management Services
  - Integration tests comprehensive
  - End-to-end testing framework
  - Initial tenant administration

### 3.2 Faza 2: Funcționalități Core și MVP (Lunile 5-8)

**Obiectiv:** Dezvoltarea componentelor frontend, integrări avansate și lansarea MVP-ului aplicației.

**Sprint 9-10: Live Tracking & Notifications**
- Deliverables:
  - Live Tracking Service funcțional
  - Notification Service cu push și email
  - Real-time data synchronization
  - Tenant-isolated WebSocket channels

**Sprint 11-12: Web Application**
- Deliverables:
  - Web application completă
  - Responsive design pentru toate device-uri
  - Admin dashboard funcțional
  - Tenant-specific UI customization

**Sprint 13-14: Mobile Application**
- Deliverables:
  - Mobile app funcțională (iOS & Android)
  - Background tracking
  - Offline support cu sync
  - Multi-tenant support pe mobile

**Sprint 15-16: Testing & Deployment**
- Deliverables:
  - Aplicație completă testată
  - Production environment configurat
  - Multi-cloud deployment validat
  - Documentație tehnică și user

### 3.3 Faza 3: Transformare Multi-Tenant Multi-Cloud Completă (Lunile 9-10)

**Obiectiv:** Transformarea platformei într-o soluție multi-tenant completă cu distribuție multi-cloud pentru reziliență și scalabilitate.

**Sprint 17-18: Database Transformation**
- Deliverables:
  - Database architecture multi-tenant completă
  - Migration tools funcționale
  - Cross-cloud data replication
  - Data validation framework

**Sprint 19-20: Multi-Cloud Infrastructure**
- Deliverables:
  - Multi-cluster service mesh
  - Global load balancing
  - Cross-cloud deployment
  - Disaster recovery capability

**Sprint 21-22: Tenant Management & Go-Live**
- Deliverables:
  - Tenant management dashboard
  - Automated tenant provisioning
  - Multi-cloud, multi-tenant deployment
  - Full tenant isolation

## 4. SETUP CLOUD ȘI DEVOPS

### 4.1 Infrastructură Terraform

**Structura repository Terraform:**
```
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
```

### 4.2 Configurare Kubernetes și Istio

**Namespace Structure:**
- Faza 1-2 (Shared):
  - default
  - kube-system
  - tenant-system     # Tenant management services
  - istio-system      # Istio control plane
  - monitoring        # Prometheus, Grafana, Jaeger
  - cert-manager      # Certificate management
  - schoolbus         # Application microservices

- Faza 3 (Multi-Tenant):
  - default
  - kube-system
  - istio-system      # Istio control plane
  - monitoring        # Prometheus, Grafana, Jaeger
  - tenant-system     # Tenant management services
  - tenant-primaria-sector1   # Tenant-specific namespace
  - tenant-primaria-sector2   # Tenant-specific namespace
  - tenant-primaria-sector3   # Tenant-specific namespace

### 4.3 CI/CD Pipeline

**GitHub Actions Workflow pentru NestJS:**
- Test job: Rulează unit tests și linting
- Build job: Construiește aplicația și Docker image
- Deploy job: Deployment condiționat în funcție de branch

### 4.4 Monitoring și Observabilitate

**Stack de Monitoring:**
- Metrics: Prometheus + Grafana + Grafana Agent pentru Node.js metrics
- Logging: Google Cloud Logging + Elasticsearch + Winston
- Tracing: Jaeger/Cloud Trace + OpenTelemetry pentru Node.js
- Alerting: Grafana Alertmanager + PagerDuty

## 5. ANALIZA COSTURI

### 5.1 Costuri Dezvoltare Inițială (Faza 1-2)

**Costuri Lunare de Infrastructură (6-8 luni):**
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

**Costuri Total Faza 1-2 (8 luni):** $5,600

### 5.2 Costuri Transformare Multi-Tenant (Faza 3)

**Costuri Lunare de Infrastructură (Faza 3):**
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

**Costuri Total Faza 3 (2 luni):** $3,100

### 5.3 Costuri Operaționale Pe Tenant

**Cost Lunar per Tenant (post-implementare):**
| Număr Tenanți | Cost per Tenant (USD) | Note |
|---------------|------------------------|------|
| 1-3 | $500 | Cost ridicat datorită infrastructurii de bază |
| 4-10 | $200 | Distribuire costuri fixe |
| 11-20 | $150 | Economii de scală |
| 21+ | $100 | Economii semnificative |

### 5.4 TCO și ROI

**Total Cost of Ownership (3 ani):** $89,700

**ROI Estimativ în 3 ani:**
- Cu 15 tenanți (primării) în anul 2, costul pe tenant scade la aproximativ $200/lună
- Cu 25 tenanți în anul 3, costul pe tenant scade la aproximativ $100/lună
- Model multi-tenant permite onboarding rapid cu costuri marginale reduse
- Reziliența multi-cloud reduce riscurile de disponibilitate

## 6. PLAN DE RESURSE ȘI ECHIPĂ

### 6.1 Structura Echipei

**Echipa de Dezvoltare:**
| Rol | FTE | Responsabilități |
|-----|-----|------------------|
| Arhitect / DevOps / Scrum Master | 0.5-0.6 (4-5h/zi) | Arhitectură, DevOps, Coordonare |
| Full Stack Developer (Backend focus) | 2 | NestJS microservicii, APIs, Database |
| Frontend Developer | 1 | Next.js, React, Admin Dashboard |
| Mobile Developer | 1 | React Native pentru iOS/Android |
| QA Engineer | 1 | Testing, Automation |
| UI/UX Designer | 0.5 | Design și UX |

### 6.2 Roluri și Responsabilități

Descris în detaliu pentru fiecare rol, de la Arhitect la UI/UX Designer.

### 6.3 Alocarea Resurselor pe Faze

**Faza 1: Fundația Tenant-Ready (Lunile 1-4)**
- Arhitect: 4-5h/zi (focus pe arhitectură și DevOps)
- Full Stack Developers: 100%
- Frontend Developer: 50% (research și component design)
- Mobile Developer: 50% (research și planificare)
- QA Engineer: 75% (setup testing framework)
- UI/UX Designer: 100% (design system și core interfaces)

**Faza 2: Funcționalități Core și MVP (Lunile 5-8)**
- Arhitect: 4h/zi (focus pe optimizări și deployment)
- Full Stack Developers: 100% (dezvoltare microservicii și integrări)
- Frontend Developer: 100% (development complet web app)
- Mobile Developer: 100% (development complet mobile app)
- QA Engineer: 100% (testare comprehensivă)
- UI/UX Designer: 50% (iterații pe baza feedback)

**Faza 3: Transformare Multi-Tenant Multi-Cloud (Lunile 9-10)**
- Arhitect: 5h/zi (focus intensiv pe multi-tenancy și multi-cloud)
- Full Stack Developers: 100% (adaptare servicii pentru multi-tenant)
- Frontend Developer: 75% (tenant management UI și customization)
- Mobile Developer: 50% (adaptări pentru multi-tenant)
- QA Engineer: 100% (focus pe data integrity, security și performance)
- UI/UX Designer: 25% (tenant branding și customization)

## 7. RISCURI ȘI STRATEGII DE ATENUARE

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

## 8. ANEXE TEHNICE

### 8.1 Diagrama Detaliată a Arhitecturii

Diagramă completă a sistemului, incluzând toate componentele și interacțiunile între ele.

### 8.2 Schema Baza de Date (Simplificată)

**Faza 1-2 (Tenant ID în fiecare tabel):**
```
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
```

**Faza 3 (Database/Schema per Tenant):**
// Database sau schema separată pentru fiecare tenant
// Cu aceeași structură ca mai sus, dar fără tenant_id
// Izolare completă la nivel de database

### 8.3 API Endpoints (Exemple)

**Bus Management Service:**
- GET    /api/buses                - Get all buses for current tenant
- GET    /api/buses/{id}           - Get specific bus
- POST   /api/buses                - Create new bus
- PUT    /api/buses/{id}           - Update bus
- DELETE /api/buses/{id}           - Delete bus
- GET    /api/buses/{id}/position  - Get last known position
- GET    /api/buses/{id}/route     - Get current route
- GET    /api/buses/{id}/schedule  - Get bus schedule

**School & Student Management:**
- GET    /api/schools                    - Get all schools
- GET    /api/schools/{id}               - Get specific school
- POST   /api/schools                    - Create school
- ...și alte endpoint-uri

### 8.4 Multi-Tenant Implementation Details

**Request Flow (Faza 3):**
1. Client sends request with tenant identifier in header
2. Istio Ingress Gateway processes request
3. API Gateway processes and validates tenant context
4. Service handling with NestJS and TenantInterceptor
5. Data returned from tenant's database

### 8.5 CI/CD Deployment Strategy

**Multi-Branch Strategy:**
```
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
```

**Tenant-Specific Deployments (Faza 3):**
```
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
```

## CONCLUZII ȘI RECOMANDĂRI

Implementarea platformei SchoolBus urmează o strategie în trei faze care echilibrează nevoia de lansare rapidă în 6-8 luni cu pregătirea pentru un model multi-tenant robust și reziliență multi-cloud. Prin proiectarea "tenant-ready" de la început și alocarea suplimentară de timp arhitectului pentru a gestiona aspectele DevOps, acest plan permite:

- Lansare rapidă a platformei într-un model tradițional în primele 6-8 luni
- Transformare graduală către arhitectura multi-tenant în lunile 9-10
- Reziliență sporită prin distribuție multi-cloud
- Optimizare costuri prin partajarea infrastructurii între multiple primării
- Izolare completă între tenanți pentru securitate și conformitate
- Scalabilitate eficientă pentru onboarding rapid al noilor clienți

**Recomandări cheie pentru succes:**
- Implementarea Istio Service Mesh de la început pentru a facilita tranziția la multi-tenant
- Investiție în DevOps și automatizare pentru a reduce overhead-ul pe termen lung
- Dezvoltarea unui tenant onboarding process automatizat pentru scalare rapidă
- Strategia multi-cloud cu GKE ca principal, DigitalOcean ca backup și bare-metal pentru dezvoltare
- Monitoring granular per tenant pentru identificarea problemelor de performanță
- Security reviews regulate pe măsură ce platforma evoluează către multi-tenant
- Testare riguroasă a failover între clustere pentru a asigura reziliența

Această abordare permite SchoolBus să intre pe piață rapid, demonstrând valoarea produsului, în timp ce construiește fundația pentru o platformă multi-tenant, multi-cloud scalabilă și cost-eficientă pentru primăriile și administrațiile locale din România.

## COMANDURI UTILE PENTRU MANAGEMENTUL PLATFORMEI

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

## BACKUP ȘI RECUPERARE

Backup-urile sunt configurate pentru a rula zilnic la ora 2:00 AM și sunt păstrate pentru 30 de zile.

Pentru a recupera un backup:

```bash
# Listare backups
velero get backups

# Restaurare din backup
velero restore create --from-backup <backup-name>
```

## PLAN DE IMPLEMENTARE INFRASTRUCTURĂ GKE

### Timp Estimat de Implementare

Pe baza planului de arhitectură, setup-ul infrastructurii de bază pe Google Kubernetes Engine (GKE) poate fi realizat în **2-3 săptămâni**, aceasta fiind parte din **Sprint 1-2: Infrastructure & DevOps Setup** din Faza 1 a planului.

### Pașii Principali pentru Setup-ul GKE

#### 1. Configurare Proiect GCP (2-3 zile)
- Creare proiect GCP nou pentru SchoolBus
- Activare API-uri necesare (Compute, Kubernetes, Container Registry, Cloud SQL, etc)
- Configurare IAM pentru roluri și permisiuni
- Setare billing alerts și bugete
- Configurare Service Accounts pentru Terraform și CI/CD

#### 2. Implementare Infrastructură cu Terraform (3-5 zile)
- Dezvoltare modul Terraform pentru GKE (conform structurii din arhitectură)
- Configurare VPC și subnetwork-uri pentru GKE
- Definire cluster GKE regional cu auto-scaling:
  ```terraform
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
  ```
- Setare Cloud SQL pentru PostgreSQL
- Configurare Cloud Storage pentru documente și fișiere
- Implementare și testare cu `terraform apply`

#### 3. Instalare și Configurare Istio Service Mesh (2-3 zile)
- Instalare Istio cu IstioOperator Custom Resources
- Configurare Gateway Istio
- Implementare mesh-wide mTLS
- Setare default namespace injection
- Instalare add-ons: Kiali, Jaeger, Prometheus și Grafana

#### 4. Configurare Namespace și Network Policies (1-2 zile)
- Creare namespace-uri inițiale conform planului:
  ```bash
  kubectl create namespace tenant-system
  kubectl create namespace monitoring
  kubectl create namespace cert-manager
  kubectl create namespace schoolbus
  ```
- Implementare Network Policies pentru izolare
- Configurare RBAC pentru namespace-uri
- Configurare Resource Quotas și Limits

#### 5. Instalare și Configurare Infrastructură Suplimentară (2-3 zile)
- Instalare cert-manager pentru certificate TLS
- Configurare Prometheus și Grafana pentru monitoring
- Setare Cloud Armor pentru WAF și protecție DDoS
- Implementare Secret Manager pentru credentials

#### 6. Configurare CI/CD pentru Deployment (2-3 zile)
- Setare GitHub Actions pentru deployment automat
- Configurare workflow-uri pentru test, build și deploy
- Implementare GitOps cu ArgoCD sau Flux
- Testare pipeline end-to-end

#### 7. Documentare și Testing (1-2 zile)
- Documentare a infrastructurii implementate
- Dezvoltare playbook pentru operațiuni comune
- Teste de failover și resilience
- Testare security și performance

### Dependințe și Prerechizituri

Pentru a accelera procesul, este necesar să ai pregătite:

1. Cont GCP cu billing activat
2. Terraform instalat local sau Cloud Build configurat pentru Terraform
3. kubectl și gcloud CLI instalate
4. Strategie definită pentru management secrets (Cloud KMS, HashiCorp Vault)
5. Domenii DNS înregistrate pentru aplicație

### Riscuri și Reducerea Lor

- **Costuri peste așteptări**: Utilizați GKE Autopilot inițial pentru optimizare automată a costurilor
- **Complexitate Istio**: Începeți cu setup minimal și adăugați treptat features
- **Securitate**: Implementați de la început security scanning pentru images și CIS Benchmarks
- **Întârzieri de configurare**: Utilizați module Terraform predefinite pentru GKE și setup blueprint-uri

### Următorii Pași după Setup GKE

După configurarea infrastructurii GKE, veți continua cu:
1. Implementarea serviciilor de bază (API Gateway, Identity Management)
2. Setup baza de date cu scheme pentru multi-tenant
3. Configurarea CI/CD pentru microservicii NestJS
4. Implementarea tenant middleware și interceptors

Acest setup al infrastructurii GKE va oferi fundamentul solid pentru dezvoltarea ulterioară a platformei SchoolBus în modelul multi-tenant.

## PROOF OF CONCEPT: APIGEE + FIREBASE AUTH + NESTJS

### Arhitectură POC

Pentru implementarea rapidă a unui Proof of Concept care să demonstreze arhitectura multi-tenant, vom adopta o abordare modernă inspirată de Netflix OSS, folosind:

- **Apigee API Gateway** - înlocuind Zuul pentru gateway management
- **Firebase Auth** - pentru autentificare OAuth2 și gestionare JWT
- **NestJS** - pentru microservicii cu suport multi-tenant
- **PostgreSQL** - pentru stocarea datelor cu izolare multi-tenant

```
[Client Apps] → [Apigee API Gateway] ⟷ [Firebase Auth]
                      ↓
            [NestJS Microservicii] ↔ [PostgreSQL]
```

### Plan de Implementare POC (5-7 zile)

#### 1. Setup Inițial (1 zi)

**A. Creare Proiect GCP**
```bash
# Creare proiect GCP
gcloud projects create schoolbus-poc-123 --name="SchoolBus POC"

# Activare billing
gcloud billing projects link schoolbus-poc-123 --billing-account=BILLING_ACCOUNT_ID

# Activare APIs necesare
gcloud services enable apigee.googleapis.com firebase.googleapis.com \
  container.googleapis.com cloudbuild.googleapis.com \
  secretmanager.googleapis.com --project=schoolbus-poc-123
```

**B. Setup Firebase**
```bash
# Instalare Firebase CLI
npm install -g firebase-tools

# Login și inițializare Firebase
firebase login
firebase init --project=schoolbus-poc-123 authentication
```

**C. Setup GKE Minimal**
```bash
# Creare cluster GKE pentru microservicii
gcloud container clusters create schoolbus-poc-cluster \
  --project=schoolbus-poc-123 \
  --zone=us-central1-a \
  --num-nodes=1 \
  --machine-type=e2-standard-2
```

#### 2. Firebase Auth cu Multi-Tenant (1 zi)

**A. Configurare Firebase Auth**

Activăm autentificarea cu email/parolă și creăm utilizatori de test pentru fiecare tenant cu custom claims pentru `tenant_id`.

**B. Firebase Admin SDK pentru Custom Claims**
```javascript
// scripts/setup-tenant-claims.js
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setupTenantClaims() {
  // Creează utilizator pentru tenant1
  const user1 = await admin.auth().createUser({
    email: 'admin@tenant1.com',
    password: 'password123',
    displayName: 'Admin Tenant 1'
  });
  
  // Setează custom claim pentru tenant_id
  await admin.auth().setCustomUserClaims(user1.uid, { tenant_id: 'tenant1' });
  
  // Același lucru pentru tenant2
  const user2 = await admin.auth().createUser({
    email: 'admin@tenant2.com',
    password: 'password456',
    displayName: 'Admin Tenant 2'
  });
  
  await admin.auth().setCustomUserClaims(user2.uid, { tenant_id: 'tenant2' });
  
  console.log('Users created with tenant claims');
}

setupTenantClaims();
```

#### 3. Implementare Apigee (1-2 zile)

**A. Configurare Organizație și Environment Apigee**

Creăm organizația și environment-ul Apigee pentru POC.

**B. Crearea API Proxy pentru Auth și Demo API**

Implementăm două proxy-uri esențiale:
1. **Firebase Auth Proxy** - pentru managementul token-urilor
2. **Demo API Proxy** - pentru accesul la microserviciul NestJS demo

**C. Politici Apigee pentru Multi-Tenant**

Implementăm politici pentru:
1. Validarea token-urilor Firebase JWT
2. Extragerea tenant_id din token
3. Propagarea tenant_id către microservicii prin header-uri

```xml
<VerifyJWT name="VF-ValidateFirebaseToken">
  <DisplayName>Verify Firebase JWT</DisplayName>
  <JwksUri>https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com</JwksUri>
  <Audience>schoolbus-poc-123</Audience>
  <Issuer>https://securetoken.google.com/schoolbus-poc-123</Issuer>
  <Source>request.header.authorization</Source>
  <IgnoreUnresolvedVariables>false</IgnoreUnresolvedVariables>
</VerifyJWT>

<ExtractVariables name="EV-ExtractTenantID">
  <DisplayName>Extract Tenant ID</DisplayName>
  <Source>jwt.decoded.claim.tenant_id</Source>
  <VariablePrefix>jwt</VariablePrefix>
  <Variable name="tenant_id">tenant_id</Variable>
</ExtractVariables>

<AssignMessage name="AM-AddTenantHeader">
  <DisplayName>Add Tenant Header</DisplayName>
  <Add>
    <Headers>
      <Header name="x-tenant-id">{jwt.tenant_id}</Header>
    </Headers>
  </Add>
</AssignMessage>
```

#### 4. Microserviciu Demo NestJS (1-2 zile)

**A. Structură Proiect NestJS**

Cream un proiect NestJS cu suport multi-tenant de la început.

**B. Implementare TenantModule**

Module și servicii pentru gestionarea context-ului tenant:

```typescript
// src/tenant/tenant.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TenantService {
  private readonly als = new AsyncLocalStorage<string>();

  getCurrentTenant(): string {
    return this.als.getStore();
  }

  setCurrentTenant(tenantId: string, run: () => any) {
    return this.als.run(tenantId, run);
  }
}
```

**C. Implementare TenantInterceptor**

Interceptor pentru extragerea și propagarea tenant_id:

```typescript
// src/tenant/tenant.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private tenantService: TenantService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    return new Observable(subscriber => {
      this.tenantService.setCurrentTenant(tenantId, () => {
        next.handle().subscribe({
          next: value => subscriber.next(value),
          error: err => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
```

**D. Implementare Entități și Repository Multi-Tenant**

Creăm entități și repository-uri care filtrează automat după tenant_id:

```typescript
// src/common/base.entity.ts
import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class TenantEntity {
  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript
// src/common/tenant-repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { TenantEntity } from './base.entity';
import { TenantService } from '../tenant/tenant.service';

export class TenantRepository<T extends TenantEntity> {
  constructor(
    private repository: Repository<T>,
    private tenantService: TenantService,
  ) {}

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    const tenantId = this.tenantService.getCurrentTenant();
    
    return this.repository.find({
      ...options,
      where: {
        ...options?.where,
        tenantId,
      },
    });
  }

  async findOne(options: FindOneOptions<T>): Promise<T> {
    const tenantId = this.tenantService.getCurrentTenant();
    
    return this.repository.findOne({
      ...options,
      where: {
        ...options.where,
        tenantId,
      },
    });
  }

  async save(entity: Partial<T>): Promise<T> {
    const tenantId = this.tenantService.getCurrentTenant();
    entity.tenantId = tenantId;
    
    return this.repository.save(entity as any);
  }
}
```

**E. Implementare CRUD School Entity**

Exemplu complet pentru gestiunea școlilor într-un model multi-tenant:

```typescript
// src/schools/schools.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  findAll() {
    return this.schoolsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Post()
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolsService.create(createSchoolDto);
  }
}
```

```typescript
// src/schools/schools.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { TenantRepository } from '../common/tenant-repository';
import { TenantService } from '../tenant/tenant.service';
import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class SchoolsService {
  private tenantRepo: TenantRepository<School>;

  constructor(
    @InjectRepository(School)
    private repository: Repository<School>,
    private tenantService: TenantService,
  ) {
    this.tenantRepo = new TenantRepository(repository, tenantService);
  }

  findAll() {
    return this.tenantRepo.find();
  }

  findOne(id: string) {
    return this.tenantRepo.findOne({ where: { id } });
  }

  create(createSchoolDto: CreateSchoolDto) {
    return this.tenantRepo.save(createSchoolDto);
  }
}
```

#### 5. CI/CD & Deployment (0.5 zi)

**A. Dockerfile și Kubernetes Manifests**

Implementare Docker și manifest-uri Kubernetes pentru deployment-ul microserviciului:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "run", "start:prod"]
```

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demo-service
  template:
    metadata:
      labels:
        app: demo-service
    spec:
      containers:
      - name: demo-service
        image: gcr.io/schoolbus-poc-123/demo-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: demo-service-secrets
              key: database-url
        - name: NODE_ENV
          value: production
```

#### 6. Frontend Demo (1 zi)

**A. Componente Login cu Firebase**

Integrare Firebase Authentication în frontend:

```javascript
// Login.jsx
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "schoolbus-poc-123.firebaseapp.com",
  projectId: "schoolbus-poc-123",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem('idToken', idToken);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Error:", error);
      alert("Authentication failed");
    }
  };

  return (
    <div>
      <h1>Login - SchoolBus POC</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div>
        <p>Demo Accounts:</p>
        <ul>
          <li>admin@tenant1.com / password123</li>
          <li>admin@tenant2.com / password456</li>
        </ul>
      </div>
    </div>
  );
}
```

**B. API Client cu Tenant Context**

Implementare client API care transmite automat JWT:

```javascript
// api/client.js
const API_URL = 'https://api.example.com';

export async function fetchWithAuth(endpoint, options = {}) {
  const idToken = localStorage.getItem('idToken');
  
  if (!idToken) {
    window.location.href = '/login';
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      localStorage.removeItem('idToken');
      window.location.href = '/login';
      return;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Example usage
export const getSchools = () => fetchWithAuth('/api/v1/schools');
export const createSchool = (data) => fetchWithAuth('/api/v1/schools', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

#### 7. Testare End-to-End (0.5 zi)

**A. Script de Test E2E**

Script pentru testarea completă a flow-ului multi-tenant:

```bash
#!/bin/bash
# test-e2e.sh

# 1. Obținem token pentru tenant1
TOKEN=$(curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyXXXXXX" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tenant1.com","password":"password123","returnSecureToken":true}' \
  | jq -r '.idToken')

echo "Obtained token for tenant1"

# 2. Testare endpoint Schools pentru tenant1
echo "Testing tenant1 schools endpoint..."
SCHOOLS_TENANT1=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/api/v1/schools")

echo "Tenant1 Schools: $SCHOOLS_TENANT1"

# 3. Repetăm pentru tenant2
TOKEN=$(curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyXXXXXX" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tenant2.com","password":"password456","returnSecureToken":true}' \
  | jq -r '.idToken')

echo "Obtained token for tenant2"

echo "Testing tenant2 schools endpoint..."
SCHOOLS_TENANT2=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/api/v1/schools")

echo "Tenant2 Schools: $SCHOOLS_TENANT2"
```

### Avantajele Abordării POC

1. **Timp Redus de Implementare** - 5-7 zile pentru un POC funcțional
2. **Integrare cu Servicii Managed** - Firebase Auth și Apigee reduc complexitatea
3. **Focus pe Logica de Business** - NestJS permite concentrare pe modelul de date
4. **Demonstrație Multi-Tenant End-to-End** - Toate componentele suportă izolarea între tenanți
5. **Performanță Optimizată** - Filtrare automată după tenant_id la nivel de repository
6. **Securitate** - JWT validare în Apigee și propagare sigură către microservicii

### Integrare cu Arhitectura Finală

Acest POC validează principalele concepte ale arhitecturii multi-tenant și poate fi extins pentru implementarea completă:

1. **Extensie Microservicii** - Adăugare microservicii pentru restul entităților
2. **Integrare Istio** - Implementare service mesh pentru comunicare inter-service
3. **Multi-Cloud** - Extindere deployment pe DigitalOcean și bare-metal 
4. **Securitate Avansată** - Network policies și mTLS

POC-ul demonstrează validitatea arhitecturală a abordării multi-tenant pentru platforma SchoolBus, oferind un fundament solid pentru implementarea completă conform planului în 3 faze. 