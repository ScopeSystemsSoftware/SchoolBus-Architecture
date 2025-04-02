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