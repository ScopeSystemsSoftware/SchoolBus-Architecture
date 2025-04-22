# IRIS (Intelligent Reaction & Integration System)

## Arhitectură Securizată pentru Infrastructură Critică

IRIS este un sistem integrat de nouă generație, construit pe o arhitectură cloud-native enterprise-grade implementată integral pe Google Cloud Platform - infrastructură certificată pentru sisteme guvernamentale critice și utilizată de organizații de securitate din întreaga lume.

## Arhitectură tehnică de nivel național

### Securitate de grad guvernamental
IRIS implementează autentificare OAuth2 prin Firebase Authentication, cu verificare JWT multi-nivel și Role-Based Access Control. Toate comunicațiile, datele de transport public și metadatele camerelor video sunt criptate conform standardelor ENISA pentru sisteme critice. Apigee API Gateway validează fiecare cerere și asigură protecție împotriva atacurilor cibernetice, eliminând vulnerabilitățile prezente în sistemele vechi bazate pe CPanel.

### Integrare multi-vendor și scalabilitate
Microserviciile rulează în containere Docker orchestrate de Kubernetes, cu auto-scaling și self-healing. Arhitectura permite:
- Integrare nativă cu camerele inteligente Bosch (flux video și metadate)
- Conectare la sistemele de transport public pentru informații în timp real
- Integrare cu sistemele SWARCO pentru monitorizarea și controlul semafoarelor
- Arhitectura multi-tenant permite administrarea separată a datelor pentru fiecare partener/municipalitate

### Hub de date centralizat și API Management
IRIS funcționează ca un hub centralizat pentru toate datele de infrastructură urbană, expunând API-uri standardizate pentru parteneri. Acest model elimină vulnerabilitățile generate de conexiunile ad-hoc între sisteme legacy, permițând:
- Monitorizare centralizată a tuturor sistemelor interconectate
- Expunere controlată a datelor către terți prin API Gateway securizat
- Separare strictă între datele partenerilor prin izolare la nivel de tenant

### Conformitate și auditabilitate
Sistemul include monitoring în timp real prin Cloud Monitoring, cu dashboards pentru performanță și alertare automată. Fiecare tranzacție este înregistrată și auditabilă, asigurând conformitatea cu GDPR și cerințele de securitate pentru infrastructură critică, inclusiv trasabilitatea completă a accesului la datele din sistemele integrate (camere Bosch, SWARCO, date de transport).

## Detalii specifice privind integrarea cu SWARCO

Integrarea tehnică cu sistemele SWARCO pentru monitorizarea și controlul semafoarelor se realizează prin:

1. **API Gateway (Apigee)** - furnizează un punct securizat de intrare/ieșire pentru toate comunicațiile cu sistemele SWARCO
2. **Microservicii dedicate** - dezvoltate specific pentru a comunica cu API-urile SWARCO
3. **Transformare și normalizare date** - conversia formatelor de date între IRIS și sistemele SWARCO
4. **Monitorizare în timp real** - pentru starea semafoarelor și datele de trafic
5. **Dashboard centralizat** - vizualizarea integrată a datelor de la semafoare alături de alte sisteme

Comunicarea cu sistemele SWARCO se va realiza bidirecțional, permițând:
- Citirea stării semafoarelor în timp real
- Primirea datelor despre trafic de la senzori
- Transmiterea de comenzi pentru ajustarea timpilor de semaforizare
- Integrarea cu sistemele de prioritizare a transportului public

## Avantaje strategice

- Eliminarea riscurilor de securitate ale platformei actuale SmartTP, care nu mai beneficiază de suport și actualizări de securitate
- Platformă unificată de integrare - spre deosebire de soluția actuală care necesită conexiuni punctuale cu fiecare partener, IRIS oferă un model standardizat de integrare prin API Management
- Infrastructură replicabilă național - arhitectura IRIS poate fi implementată la nivel național, oferind un standard comun pentru integrarea sistemelor de transport, monitorizare video și control al traficului
- Reducerea costurilor operaționale cu până la 60% prin eliminarea infrastructurii fizice, automatizarea și centralizarea managementului

## Plan de Dezvoltare IRIS - Timeline și Echipă

### Timeline de Dezvoltare - Abordare Agile

Dezvoltarea platformei IRIS va urma metodologia Agile Scrum, cu sprinturi de 2 săptămâni, grupate în 3 faze distincte, cu o durată totală de aproximativ 6 luni până la lansarea în producție.

#### Faza 1: Proof of Concept (POC) - 6 săptămâni (3 sprinturi)

**Obiectiv:** Validarea arhitecturii tehnice și a conceptelor de integrare cu partenerii externi.

**Sprintul 1-2 (săptămânile 1-4):**
- Setup infrastructură cloud de bază pe GCP
- Implementare microservicii demo pentru autentificare (Firebase Auth)
- Configurare Apigee și validare JWT
- Integrare pilot cu un singur tip de cameră Bosch

**Sprintul 3 (săptămânile 5-6):**
- **Integrare pilot cu API-urile SWARCO pentru date semafoare**
- Demo interconectare cu datele de transport public
- Validare end-to-end a fluxurilor de date
- Prezentare stakeholderilor și colectare feedback

**Livrabile POC:**
- Demonstrație funcțională a integrării cu minim 2 sisteme externe
- Raport de securitate preliminar
- Arhitectură tehnică detaliată validată
- Plan detaliat pentru faza MVP

#### Faza 2: Minimum Viable Product (MVP) - 12 săptămâni (6 sprinturi)

**Obiectiv:** Dezvoltarea unei versiuni funcționale cu toate integrările esențiale.

**Sprintul 4-5 (săptămânile 7-10):**
- Implementare completă a autentificării și autorizării bazate pe roluri
- Dezvoltare APIs pentru integrarea cu toate tipurile de camere Bosch
- Setup CI/CD pipeline pentru dezvoltare continuă

**Sprintul 6-7 (săptămânile 11-14):**
- Implementare completă a microserviciilor pentru transport public
- **Integrare completă cu sistemele SWARCO**
- Dezvoltare backend pentru dashboard de monitorizare

**Sprintul 8-9 (săptămânile 15-18):**
- Dezvoltare interfață web administrativă
- Implementare notificări și alerte în timp real
- Testare de securitate și performanță
- Integrare multi-tenant pentru separarea datelor

**Livrabile MVP:**
- Platformă funcțională cu toate integrările esențiale
- Dashboard administrativ operațional
- Documentație API completă pentru parteneri
- Raport complet de securitate și conformitate GDPR

#### Faza 3: Production Ready - 8 săptămâni (4 sprinturi)

**Obiectiv:** Optimizarea performanței, scalabilității și pregătirea pentru lansarea în producție.

**Sprintul 10-11 (săptămânile 19-22):**
- Optimizare performanță și scalabilitate
- Setup monitoring și logging complet
- Implementare disaster recovery
- Testare de încărcare și stres

**Sprintul 12-13 (săptămânile 23-26):**
- User acceptance testing (UAT)
- Remedierea bugurilor identificate
- Finalizare documentație tehnică și de utilizare
- Pregătire pentru lansare în producție

**Livrabile PROD:**
- Sistem complet funcțional, optimizat și testat
- Documentație completă pentru administratori și utilizatori
- Plan de mentenanță și suport post-implementare
- Raport final de securitate și conformitate

### Echipa Minimă Necesară

#### Echipa Core (necesară pe toată durata proiectului):

| Rol | Cantitate | Responsabilități principale |
|-----|-----------|----------------------------|
| Product Owner | 1 | Prioritizarea backlogului, definirea cerințelor, interfața cu stakeholderii |
| Technical Lead/Architect | 1 | Arhitectură tehnică, decizii tehnologice, supervizare dezvoltare |
| Backend Developer (GCP) | 2 | Dezvoltare microservicii, integrări cloud, API-uri |
| Frontend Developer | 1 | Dezvoltare interfață administrativă și dashboard-uri |
| DevOps Engineer | 1 | Infrastructură cloud, CI/CD, containerizare, automatizare |
| QA Engineer | 1 | Testare funcțională, de securitate și performanță |

#### Specialiști Temporari (implicați în faze specifice):

| Rol | Cantitate | Faze | Responsabilități principale |
|-----|-----------|------|----------------------------|
| Security Specialist | 1 | POC + MVP | Configurare Firebase Auth, Apigee, securitate API, audit |
| Integration Specialist | 1 | MVP | Integrări cu sistemele externe (Bosch, SWARCO, transport) |
| UX/UI Designer | 1 | MVP | Design interfață utilizator, experiență utilizator |
| Technical Writer | 1 | PROD | Documentație tehnică și de utilizare |

#### Dimensionare pe faze:

- **Faza POC:** 6-7 persoane (echipa core + Security Specialist)
- **Faza MVP:** 8-9 persoane (echipa core + toți specialiștii temporari)
- **Faza PROD:** 7-8 persoane (echipa core + Technical Writer)

Această structură de echipă reprezintă minimul necesar pentru a livra proiectul în intervalul de timp specificat. Pentru o dezvoltare accelerată sau pentru a adresa complexitate suplimentară, echipa ar putea fi extinsă cu dezvoltatori backend și frontend suplimentari.

## Timeline Vizual (Gantt Simplificat)

```
Lună:      1       2       3       4       5       6       7
         --------------------------------------------------
POC      [======]
MVP               [==============]
PROD                             [========]
Launch                                     [*]
```

Această planificare permite lansarea unei platforme IRIS complet funcționale în aproximativ 6 luni de la start, cu posibilitatea de a demonstra progresul tangibil (POC) încă din prima lună și jumătate de dezvoltare. 