# SchoolBus Platform Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Completed Components](#completed-components)
3. [Microservice Details](#microservice-details)
   - [Auth Microservice](#auth-microservice)
   - [School Microservice](#school-microservice)
   - [API Gateway](#api-gateway)
   - [Frontend Application](#frontend-application)
4. [Development Setup](#development-setup)
   - [Prerequisites](#prerequisites)
   - [Local Setup](#local-setup)
   - [Database Configuration](#database-configuration)
5. [Running the Application](#running-the-application)
6. [Cloud Deployment](#cloud-deployment)
7. [Creating a Complete Demo](#creating-a-complete-demo)
8. [Next Steps for Developers](#next-steps-for-developers)

## Architecture Overview

The SchoolBus platform uses a microservice architecture to provide a scalable and maintainable solution for school transportation management:

- **Authentication & Authorization**: Centralized auth service with JWT tokens and role-based access
- **Domain-Specific Microservices**: Independent services for schools, students, buses, etc.
- **API Gateway**: Centralized entry point handling routing, security, and request transformation
- **Frontend**: React application communicating with backend services via the API gateway

This architecture enables independent scaling, deployment, and development of different components.

## Completed Components

1. **Auth Microservice** (`schoolbus-auth-service`):
   - Complete JWT authentication system with token generation/verification
   - User management with role-based access control (Admin, School Admin, Driver, Parent)
   - Firebase authentication integration
   - REST API for user operations

2. **School Microservice** (`schoolbus-school-service`):
   - School data management with CRUD operations
   - Client-side authentication integration with the Auth service
   - Protected endpoints with role-based authorization

3. **API Gateway** (`schoolbus-api-gateway`):
   - Apigee-based API gateway configuration
   - Centralized routing to microservices
   - Security policies (JWT verification, rate limiting)
   - Request/response transformation
   - Terraform deployment configuration

4. **Frontend Application** (`schoolbus-frontend`):
   - React/TypeScript application
   - Firebase authentication with backend integration
   - Service integration for auth and school operations
   - API client configured to work with the gateway

## Microservice Details

### Auth Microservice

**Repository**: https://github.com/stefantirlea/schoolbus-auth-service

**Core Components**:

- **User Entity** (`src/auth/entities/user.entity.ts`): 
  Defines the user model with fields for email, password, role, and Firebase UID.

- **Auth Module** (`src/auth/auth.module.ts`): 
  Configures the authentication module, importing JWT, Passport, and related services.

- **Auth Service** (`src/auth/services/auth.service.ts`): 
  Handles user registration, login, and token validation.

- **Token Service** (`src/auth/services/token.service.ts`): 
  Manages JWT token generation, validation, and refresh.

- **Firebase Auth Service** (`src/auth/services/firebase-auth.service.ts`): 
  Integrates with Firebase Authentication, verifying tokens and syncing users.

- **Users Service** (`src/auth/services/users.service.ts`): 
  CRUD operations for user management.

- **JWT Strategy** (`src/auth/strategies/jwt.strategy.ts`): 
  Implements Passport strategy for JWT token validation.

- **Auth Controller** (`src/auth/controllers/auth.controller.ts`): 
  Exposes endpoints for authentication operations (login, register, etc.).

- **Users Controller** (`src/auth/controllers/users.controller.ts`): 
  API endpoints for user management.

**Key Features**:
- Role-based access control
- Password hashing with bcrypt
- Integration with Firebase Auth
- JWT token-based authentication
- User profile management

### School Microservice

**Repository**: https://github.com/stefantirlea/schoolbus-school-service

**Core Components**:

- **School Entity** (`src/schools/entities/school.entity.ts`): 
  Defines the school model with fields for name, address, contact info, etc.

- **Schools Module** (`src/schools/schools.module.ts`): 
  Configures the schools module, importing TypeORM, Auth client module.

- **Schools Service** (`src/schools/schools.service.ts`): 
  Implements CRUD operations for school management.

- **Schools Controller** (`src/schools/schools.controller.ts`): 
  Exposes REST API endpoints for school operations, protected by auth guards.

- **Auth Client Module** (`src/auth/auth.module.ts`): 
  Client-side integration with Auth Service for token validation.

- **JWT Strategy** (`src/auth/strategies/jwt.strategy.ts`): 
  Client implementation of JWT validation.

- **Roles Guard** (`src/auth/guards/roles.guard.ts`): 
  Enforces role-based access control on endpoints.

**Key Features**:
- School data management
- Integration with Auth service for security
- Role-based endpoint protection
- PostgreSQL data persistence

### API Gateway

**Repository**: https://github.com/stefantirlea/schoolbus-api-gateway

**Core Components**:

- **Proxy Configuration** (`apiproxy/proxies/default.xml`):
  Defines the main proxy endpoint and routing rules.

- **Target Endpoints** (`apiproxy/targets/`):
  Configuration for target services (auth-service.xml, school-service.xml).

- **Policies** (`apiproxy/policies/`):
  - `Auth-JWT-Verify.xml`: Verifies JWT tokens
  - `Quota-Rate-Limit.xml`: Implements rate limiting
  - `Response-CORS.xml`: Handles CORS for web clients
  - `Error-Handling.xml`: Standard error responses
  - `Assign-Message-Request.xml`: Request transformation
  - `Assign-Message-Response.xml`: Response transformation

- **Terraform Configuration** (`deployment/terraform/`):
  Infrastructure as code for Apigee deployment.

**Key Features**:
- Centralized routing
- Security policy enforcement
- Request/response transformation
- Rate limiting
- Infrastructure as code deployment

### Frontend Application

**Repository**: https://github.com/stefantirlea/schoolbus-frontend

**Core Components**:

- **API Client** (`src/services/api.ts`):
  Configures Axios for API requests with auth token handling.

- **Auth Context** (`src/contexts/AuthContext.tsx`):
  React context for authentication state management.

- **Auth Service** (`src/services/authService.ts`):
  Integration with Auth microservice endpoints.

- **School Service** (`src/services/schoolService.ts`):
  Integration with School microservice endpoints.

- **Firebase Config** (`src/firebase.ts`):
  Firebase initialization and configuration.

**Key Features**:
- Firebase authentication
- JWT token management
- API Gateway integration
- Responsive UI components
- Type-safe API clients

## Development Setup

### Prerequisites

- **Node.js**: v16 or later
- **npm**: v7 or later
- **PostgreSQL**: v13 or later
- **Docker** (optional): For containerized development
- **Google Cloud SDK** (for cloud deployment)
- **Firebase CLI** (for Firebase setup)

### Local Setup

1. **Clone the repositories**:
   ```bash
   git clone https://github.com/stefantirlea/schoolbus-auth-service.git
   git clone https://github.com/stefantirlea/schoolbus-school-service.git
   git clone https://github.com/stefantirlea/schoolbus-api-gateway.git
   git clone https://github.com/stefantirlea/schoolbus-frontend.git
   ```

2. **Set up environment files**:

   For Auth Service (`.env`):
   ```
   PORT=3000
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=schoolbus_auth
   DATABASE_SYNC=true
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=1h
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRATION=7d
   FIREBASE_SERVICE_ACCOUNT=base64_encoded_service_account_json
   ```

   For School Service (`.env`):
   ```
   PORT=3001
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=schoolbus_schools
   DATABASE_SYNC=true
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=1h
   ```

   For Frontend (`.env.local`):
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_GATEWAY_URL=http://localhost:8080/schoolbus
   ```

3. **Install dependencies for each service**:
   ```bash
   cd schoolbus-auth-service && npm install
   cd schoolbus-school-service && npm install
   cd schoolbus-frontend && npm install
   ```

4. **Firebase Setup**:
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Generate a service account key
   - Base64 encode the service account key file for the `FIREBASE_SERVICE_ACCOUNT` env var

### Database Configuration

1. **Create PostgreSQL databases**:
   ```sql
   CREATE DATABASE schoolbus_auth;
   CREATE DATABASE schoolbus_schools;
   ```

2. **Database users and permissions**:
   ```sql
   CREATE USER schoolbus_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE schoolbus_auth TO schoolbus_user;
   GRANT ALL PRIVILEGES ON DATABASE schoolbus_schools TO schoolbus_user;
   ```

3. **Auto schema creation**:
   - Set `DATABASE_SYNC=true` in development (automatically creates tables)
   - For production, use TypeORM migrations

## Running the Application

1. **Start the Auth Service**:
   ```bash
   cd schoolbus-auth-service
   npm run start:dev
   ```

2. **Start the School Service**:
   ```bash
   cd schoolbus-school-service
   npm run start:dev
   ```

3. **Local API Gateway Setup**:
   ```bash
   # For development without Apigee, you can use a simple proxy
   # Install http-proxy-middleware
   npm install -g http-proxy
   
   # Start a simple proxy server that routes to the microservices
   http-proxy-cli -p 8080 --proxy "/schoolbus/api/v1/auth -> http://localhost:3000/auth" --proxy "/schoolbus/api/v1/users -> http://localhost:3000/users" --proxy "/schoolbus/api/v1/schools -> http://localhost:3001/schools"
   ```

4. **Start the Frontend**:
   ```bash
   cd schoolbus-frontend
   npm run dev
   ```

5. **Access the application**:
   Open `http://localhost:5173` in your browser

## Cloud Deployment

### Google Cloud Setup

1. **Create a Google Cloud project**:
   ```bash
   gcloud projects create schoolbus-platform --name="SchoolBus Platform"
   gcloud config set project schoolbus-platform
   ```

2. **Enable required APIs**:
   ```bash
   gcloud services enable container.googleapis.com cloudsql.googleapis.com secretmanager.googleapis.com apigee.googleapis.com
   ```

3. **Create service accounts**:
   ```bash
   gcloud iam service-accounts create schoolbus-deployer --display-name="SchoolBus Deployer"
   gcloud projects add-iam-policy-binding schoolbus-platform --member="serviceAccount:schoolbus-deployer@schoolbus-platform.iam.gserviceaccount.com" --role="roles/container.admin"
   gcloud projects add-iam-policy-binding schoolbus-platform --member="serviceAccount:schoolbus-deployer@schoolbus-platform.iam.gserviceaccount.com" --role="roles/cloudsql.admin"
   gcloud projects add-iam-policy-binding schoolbus-platform --member="serviceAccount:schoolbus-deployer@schoolbus-platform.iam.gserviceaccount.com" --role="roles/storage.admin"
   ```

### Cloud SQL Setup

1. **Create PostgreSQL instances**:
   ```bash
   gcloud sql instances create schoolbus-db --database-version=POSTGRES_13 --tier=db-g1-small --region=us-central1
   ```

2. **Create databases**:
   ```bash
   gcloud sql databases create schoolbus_auth --instance=schoolbus-db
   gcloud sql databases create schoolbus_schools --instance=schoolbus-db
   ```

3. **Create user**:
   ```bash
   gcloud sql users create schoolbus_app --instance=schoolbus-db --password="YOUR_SECURE_PASSWORD"
   ```

### GKE Cluster Setup

1. **Create GKE cluster**:
   ```bash
   gcloud container clusters create schoolbus-cluster --num-nodes=2 --zone=us-central1-a
   ```

2. **Configure kubectl**:
   ```bash
   gcloud container clusters get-credentials schoolbus-cluster --zone=us-central1-a
   ```

### Microservices Deployment

1. **Build and push Docker images**:
   ```bash
   # Auth Service
   cd schoolbus-auth-service
   docker build -t gcr.io/schoolbus-platform/auth-service:v1 .
   docker push gcr.io/schoolbus-platform/auth-service:v1
   
   # School Service
   cd schoolbus-school-service
   docker build -t gcr.io/schoolbus-platform/school-service:v1 .
   docker push gcr.io/schoolbus-platform/school-service:v1
   ```

2. **Deploy to Kubernetes**:
   ```bash
   # Create namespace
   kubectl create namespace schoolbus
   
   # Create secrets
   kubectl create secret generic db-credentials --namespace=schoolbus \
     --from-literal=username=schoolbus_app \
     --from-literal=password=YOUR_SECURE_PASSWORD
   
   kubectl create secret generic jwt-secrets --namespace=schoolbus \
     --from-literal=jwt-secret=YOUR_JWT_SECRET \
     --from-literal=jwt-refresh-secret=YOUR_JWT_REFRESH_SECRET
   
   # Apply deployment YAML files (these need to be created)
   kubectl apply -f kubernetes/auth-service.yaml
   kubectl apply -f kubernetes/school-service.yaml
   ```

### API Gateway Deployment

For the API gateway, use the Terraform configuration:

```bash
cd schoolbus-api-gateway/deployment/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project details

terraform init
terraform plan
terraform apply
```

### Frontend Deployment

For simple frontend deployment, you can use Firebase Hosting:

```bash
cd schoolbus-frontend
npm run build
firebase init hosting
firebase deploy --only hosting
```

## Creating a Complete Demo

To expand the POC into a complete demo:

1. **Add Sample Data**:
   - Create seed scripts for schools
   - Add sample users with different roles

2. **Implement Critical Missing Services**:
   - Student Management Service (following the same patterns as School Service)
   - Bus/Route Management Service
   - Parent Notification Service

3. **Enhance Frontend**:
   - Complete CRUD screens for all entities
   - Add dashboards for different user roles
   - Implement maps for bus routes
   - Add mobile responsiveness

4. **Testing**:
   - Add end-to-end test scenarios
   - Create realistic user journeys

## Next Steps for Developers

1. **Study the existing codebase**:
   - Understand the authentication flow
   - Review the microservice patterns
   - Examine the frontend-backend integration

2. **Focus on these key components**:
   - Adding the Student microservice (highest priority)
   - Implementing real-time notifications
   - Creating administrative dashboards
   - Adding geolocation features

3. **Follow the established patterns**:
   - Use the same project structure
   - Follow the authentication pattern
   - Maintain consistent API design
   - Use TypeORM for database access

4. **Integration points to be aware of**:
   - JWT token exchange between services
   - API Gateway routing configuration
   - Frontend service integration
   - Role-based access control

By following this guide, developers should have a clear path to expand the current POC into a full-featured SchoolBus management platform.