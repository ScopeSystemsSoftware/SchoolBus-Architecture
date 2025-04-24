# SchoolBus Authentication Service

Microserviciu pentru autentificare și autorizare al platformei SchoolBus Management System, utilizând Firebase Authentication și JWT.

## Descriere

Acest serviciu gestionează autentificarea utilizatorilor cu Firebase, generarea și validarea token-urilor JWT, precum și gestionarea utilizatorilor și permisiunilor în sistemul SchoolBus.

## Caracteristici principale

- Integrare cu Firebase Authentication
- Generare și validare JWT pentru autorizare
- Management de utilizatori (CRUD)
- Sistem de roluri și permisiuni (admin, school_admin, teacher, driver, parent)
- API documentat cu Swagger

## Tehnologii

- NestJS - framework backend
- TypeORM - ORM pentru baza de date
- PostgreSQL - baza de date
- Firebase Admin SDK - pentru autentificare
- Passport.js - pentru strategii de autentificare
- JWT - pentru token-uri de autorizare
- Swagger - pentru documentarea API

## Structura proiectului

### Fișiere de configurare

- **package.json** - Definește dependențele și scripturile pentru proiect
- **tsconfig.json** - Configurare TypeScript
- **nest-cli.json** - Configurare NestJS CLI
- **.env.example** - Template pentru variabilele de mediu necesare
- **.gitignore** - Fișiere și directoare excluse din versionare

### Modulul principal

- **src/main.ts** - Punctul de intrare al aplicației, configurează serverul NestJS, Swagger și validarea
- **src/app.module.ts** - Modulul principal care importă și configurează toate submodulele și conexiunea la bază de date

### Modulul de autentificare (auth)

- **src/auth/auth.module.ts** - Configurează modulul de autentificare, importă dependențele necesare și exportă serviciile
- **src/auth/controllers/auth.controller.ts** - Controllerul pentru rutele de autentificare (login, profil)
- **src/auth/services/auth.service.ts** - Serviciul principal pentru logica de autentificare și generare JWT
- **src/auth/services/firebase-auth.service.ts** - Serviciul pentru integrarea cu Firebase Authentication
- **src/auth/strategies/firebase-auth.strategy.ts** - Strategia Passport pentru validarea token-urilor Firebase
- **src/auth/strategies/jwt.strategy.ts** - Strategia Passport pentru validarea JWT-urilor
- **src/auth/guards/auth.guard.ts** - Guard pentru protejarea rutelor care necesită autentificare
- **src/auth/guards/roles.guard.ts** - Guard pentru verificarea rolurilor utilizatorilor
- **src/auth/decorators/public.decorator.ts** - Decorator pentru marcarea rutelor publice (fără autentificare)
- **src/auth/decorators/roles.decorator.ts** - Decorator pentru specificarea rolurilor necesare pentru acces

### Modulul de utilizatori (users)

- **src/users/users.module.ts** - Configurarea modulului de utilizatori
- **src/users/entities/user.entity.ts** - Entitatea pentru utilizatori și definirea rolurilor
- **src/users/dto/create-user.dto.ts** - DTO pentru crearea utilizatorilor, cu validare
- **src/users/dto/update-user.dto.ts** - DTO pentru actualizarea utilizatorilor
- **src/users/services/users.service.ts** - Serviciul pentru operațiunile CRUD cu utilizatori
- **src/users/controllers/users.controller.ts** - Controllerul pentru gestionarea utilizatorilor (API cu autorizare)

### Modulul de configurare (config)

- **src/config/database.config.ts** - Configurarea conexiunii la baza de date PostgreSQL

## Instalare și utilizare

### Cerințe preliminare

- Node.js (>= 14.x)
- PostgreSQL (>= 13.x)
- Proiect Firebase configurat cu Authentication activat

### Pași de instalare

1. Clonează repository-ul
2. Navighează în directorul `schoolbus-auth-service`
3. Instalează dependențele:
```bash
npm install
```
4. Creează un fișier `.env` bazat pe `.env.example`:
```bash
cp .env.example .env
```
5. Editează fișierul `.env` cu datele tale de configurare, în special:
   - Configurarea bazei de date (DB_HOST, DB_PORT, etc.)
   - Secretul JWT (JWT_SECRET)
   - Configurarea Firebase

6. Obține un fișier de credențiale Firebase pentru aplicația ta:
   - Mergi la [Firebase Console](https://console.firebase.google.com/)
   - Selectează proiectul tău
   - Navighează la Project Settings > Service Accounts
   - Generează o cheie nouă și descarcă fișierul JSON
   - Salvează-l ca `firebase-key.json` în rădăcina proiectului

7. Creează baza de date PostgreSQL:
```bash
createdb schoolbus_auth
```

### Rulare

Pentru dezvoltare:
```bash
npm run start:dev
```

Pentru producție:
```bash
npm run build
npm run start:prod
```

### Accesarea API-ului

- API-ul va rula pe `http://localhost:3001` (sau portul configurat în `.env`)
- Documentația Swagger este disponibilă la `http://localhost:3001/api/docs`

## Utilizare în producție

Pentru utilizarea în producție, asigură-te că:
1. Setezi `NODE_ENV=production` în variabilele de mediu
2. Folosești un secret JWT puternic și unic
3. Configurezi corect Firebase Admin SDK
4. Dezactivezi `synchronize: true` din configurarea TypeORM pentru a evita modificările automate ale schemei

## Testare

```bash
# rulează toate testele
npm test

# rulează testele cu watch
npm run test:watch

# verifică acoperirea cu teste
npm run test:cov
```

## Funcționalități API

1. **Autentificare**:
   - `/auth/login` - Autentificare cu token Firebase
   - `/auth/profile` - Obținerea profilului utilizatorului autentificat

2. **Managementul utilizatorilor** (necesită rol de admin):
   - `/users` (GET) - Listarea tuturor utilizatorilor
   - `/users/:id` (GET) - Obținerea unui utilizator specific
   - `/users` (POST) - Crearea unui utilizator nou
   - `/users/:id` (PATCH) - Actualizarea unui utilizator
   - `/users/:id` (DELETE) - Ștergerea unui utilizator 