# SchoolBus Multi-Tenant POC (Proof of Concept)

Acest repository conține implementarea unui proof of concept pentru funcționalitatea multi-tenant în platforma SchoolBus.

## Structura repozitoriilor

- **[schoolbus-mtn-platform](https://github.com/stefantirlea/schoolbus-mtn-platform)**: Repository central pentru documentația și arhitectura multi-tenant
- **[schoolbus-mtn-infra-terraform](https://github.com/stefantirlea/schoolbus-mtn-infra-terraform)**: Configurație Terraform pentru infrastructura multi-tenant
- **[schoolbus-mtn-svc-demo](https://github.com/stefantirlea/schoolbus-mtn-svc-demo)**: Microserviciu de demonstrație cu funcționalități multi-tenant
- **[schoolbus-mtn-app-demo](https://github.com/stefantirlea/schoolbus-mtn-app-demo)**: Aplicație frontend pentru demonstrarea funcționalității multi-tenant
- **[schoolbus-mtn-devops-ci](https://github.com/stefantirlea/schoolbus-mtn-devops-ci)**: Pipeline-uri CI/CD pentru deployment
- **[schoolbus-mtn-lib-common](https://github.com/stefantirlea/schoolbus-mtn-lib-common)**: Biblioteci comune pentru implementarea multi-tenant

## Tehnologii utilizate

- **Kubernetes**: Orchestrare containere
- **Istio**: Service mesh pentru multi-tenancy
- **Google Kubernetes Engine (GKE)**: Serviciu de hosting Kubernetes
- **Terraform**: Infrastructure as Code
- **Node.js/Express**: Microservicii backend
- **MongoDB**: Bază de date NoSQL
- **React/Material-UI**: Frontend
- **GitHub Actions**: CI/CD

## Arhitectura multi-tenant

POC-ul demonstrează o arhitectură multi-tenant completă, cu următoarele caracteristici cheie:

1. **Middleware pentru context tenant** - Middleware pentru extragerea și gestionarea contextului tenant din headers HTTP
2. **Filtrare date pe nivel tenant** - Filtrare automată a datelor în backend pe baza tenant-ului
3. **Izolarea în Kubernetes** - Namespace-uri separate și Network Policies pentru izolarea resurselor
4. **Configurare Istio** - Rutare bazată pe tenant cu Istio și AuthorizationPolicies
5. **Interfață utilizator multi-tenant** - Selector de tenant pentru a permite testarea și comutarea între tenanți

## Cum să implementați POC-ul

### 1. Configurare Kubernetes

```bash
# Clonare repository cu configurații Terraform
git clone https://github.com/stefantirlea/schoolbus-mtn-infra-terraform.git
cd schoolbus-mtn-infra-terraform

# Configurare variabile Terraform
cp terraform.tfvars.example terraform.tfvars
# Editare terraform.tfvars cu valorile proprii

# Inițializare și aplicare Terraform
terraform init
terraform plan
terraform apply
```

### 2. Construire și push imagini Docker

```bash
# Microserviciu demo
git clone https://github.com/stefantirlea/schoolbus-mtn-svc-demo.git
cd schoolbus-mtn-svc-demo
docker build -t gcr.io/[PROJECT_ID]/schoolbus-mtn-svc-demo:latest .
docker push gcr.io/[PROJECT_ID]/schoolbus-mtn-svc-demo:latest

# Aplicație frontend
git clone https://github.com/stefantirlea/schoolbus-mtn-app-demo.git
cd schoolbus-mtn-app-demo
docker build -t gcr.io/[PROJECT_ID]/schoolbus-mtn-app-demo:latest --build-arg REACT_APP_API_URL=https://api.schoolbus-mtn.example.com .
docker push gcr.io/[PROJECT_ID]/schoolbus-mtn-app-demo:latest
```

### 3. Deployment în Kubernetes

```bash
# De obicei, acest pas va fi automatizat prin CI/CD
cd schoolbus-mtn-infra-terraform
terraform apply
```

### 4. Verificare deployment

```bash
# Listare poduri
kubectl get pods -n tenant-tenanta
kubectl get pods -n tenant-tenantb
kubectl get pods -n tenant-tenantc

# Verificare servicii
kubectl get svc -A

# Verificare Istio gateway și virtual services
kubectl get gateway -A
kubectl get virtualservices -A
```

## Accesare aplicație

După implementare, aplicația va fi disponibilă la următoarele URL-uri:

- Tenant A: https://tenanta.schoolbus-mtn.example.com
- Tenant B: https://tenantb.schoolbus-mtn.example.com
- Tenant C: https://tenantc.schoolbus-mtn.example.com

Pentru testare locală, puteți adăuga următoarele intrări în fișierul `/etc/hosts`:
```
127.0.0.1 tenanta.schoolbus-mtn.example.com
127.0.0.1 tenantb.schoolbus-mtn.example.com
127.0.0.1 tenantc.schoolbus-mtn.example.com
```

## API Endpoints

Microserviciul demo expune următoarele endpoints:

- `GET /api/schools`: Listare școli pentru tenant-ul curent
- `GET /api/schools/:id`: Obținere școală după ID pentru tenant-ul curent
- `POST /api/schools`: Creare școală nouă pentru tenant-ul curent
- `PUT /api/schools/:id`: Actualizare școală pentru tenant-ul curent
- `DELETE /api/schools/:id`: Ștergere școală pentru tenant-ul curent
- `GET /health`: Verificare stare serviciu

## Folosirea contextului tenant

### Backend (Express.js)

```javascript
// Exemplu de middleware pentru extragerea tenant-ului
const tenantMiddleware = (req, res, next) => {
  let tenantId = req.headers['x-tenant-id'];
  // Procesare și setare tenant
  req.tenantId = tenantId;
  tenantStorage.run(tenantId, next);
};

// Exemplu de model pentru MongoDB cu suport multi-tenant
const schoolSchema = new mongoose.Schema({
  name: String,
  // ... alte câmpuri
  tenantId: {
    type: String,
    required: true,
    index: true
  }
});

// Adăugare filtru pre-find pentru a asigura izolarea tenant
schoolSchema.pre(/^find/, function(next) {
  const tenantId = getCurrentTenant();
  this.where({ tenantId });
  next();
});
```

### Frontend (React)

```jsx
// Exemplu de context tenant
const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(DEFAULT_TENANT);
  
  // Funcție pentru schimbarea tenant-ului
  const changeTenant = (tenantId) => {
    // Logică pentru schimbarea tenant-ului
  };
  
  return (
    <TenantContext.Provider value={{ currentTenant, changeTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

// Folosire în component
const { currentTenant } = useContext(TenantContext);
// API call cu tenant în header
axios.get('/api/schools', { 
  headers: { 'X-Tenant-ID': currentTenant.id }
});
```

## Monitorizare și debugging

POC-ul include funcționalități pentru monitorizare și debugging:

- **Kiali**: Vizualizare service mesh
- **Jaeger**: Distributed tracing
- **Prometheus și Grafana**: Colectare și vizualizare metrici
- **Logging structurat**: Toate log-urile includ contextul tenant pentru debugging

## Contribuții

Vă rugăm să consultați [CONTRIBUTING.md](CONTRIBUTING.md) pentru detalii despre cum să contribuiți la acest proiect. 