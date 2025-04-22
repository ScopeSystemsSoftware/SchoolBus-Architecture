# SchoolBus School Microservice Deployment Guide

This document outlines the step-by-step process to deploy the School Microservice to Google Cloud Platform using Terraform.

## Deployment Checklist

### Phase 1: Prerequisites & Initial Setup

- [ ] 1.1. Install required tools (Terraform, Google Cloud SDK)
- [ ] 1.2. Configure Google Cloud project
- [ ] 1.3. Enable required GCP APIs
- [ ] 1.4. Set up Firebase project and authentication
- [ ] 1.5. Create GCP service account for deployment

### Phase 2: Infrastructure Deployment

- [ ] 2.1. Configure Terraform variables
- [ ] 2.2. Initialize Terraform
- [ ] 2.3. Run Terraform plan
- [ ] 2.4. Apply Terraform configuration
- [ ] 2.5. Verify infrastructure deployment

### Phase 3: Application Deployment

- [ ] 3.1. Build Docker image
- [ ] 3.2. Push image to Google Container Registry
- [ ] 3.3. Deploy application to GKE
- [ ] 3.4. Configure Firebase authentication for the application
- [ ] 3.5. Verify application deployment

### Phase 4: Testing & Validation

- [ ] 4.1. Test health endpoint
- [ ] 4.2. Test authentication
- [ ] 4.3. Test CRUD operations
- [ ] 4.4. Load testing (optional)

### Phase 5: CI/CD Setup

- [ ] 5.1. Configure GitHub Actions secrets
- [ ] 5.2. Test CI pipeline
- [ ] 5.3. Test CD pipeline
- [ ] 5.4. Verify automatic deployment

## Detailed Deployment Instructions

### Phase 1: Prerequisites & Initial Setup

#### 1.1. Install Required Tools

**Terraform:**
```bash
# macOS with Homebrew
brew install terraform

# Linux
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
```

**Google Cloud SDK:**
```bash
# macOS with Homebrew
brew install --cask google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

#### 1.2. Configure Google Cloud Project

```bash
# Create a new project (skip if using existing project)
gcloud projects create schoolbus-platform --name="SchoolBus Platform"

# Set active project
gcloud config set project YOUR_PROJECT_ID

# Enable billing (required for using GCP services)
# This step must be done through the GCP Console: https://console.cloud.google.com/billing/linkedaccount
```

#### 1.3. Enable Required GCP APIs

```bash
# Enable required APIs
gcloud services enable container.googleapis.com \
                       sqladmin.googleapis.com \
                       secretmanager.googleapis.com \
                       cloudresourcemanager.googleapis.com \
                       iam.googleapis.com \
                       compute.googleapis.com
```

#### 1.4. Set Up Firebase Project and Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Add a project (select your GCP project)
3. Enable Authentication service
4. Add Email/Password as a sign-in method
5. Create test users:
   - Go to Authentication → Users → Add User
   - Create an admin user and a regular user

#### 1.5. Create GCP Service Account for Deployment

```bash
# Create service account
gcloud iam service-accounts create schoolbus-deployer \
  --display-name="SchoolBus Deployer"

# Assign necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:schoolbus-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/container.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:schoolbus-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:schoolbus-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:schoolbus-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

# Generate service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=schoolbus-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Phase 2: Infrastructure Deployment

#### 2.1. Configure Terraform Variables

Create a `terraform.tfvars` file in the terraform directory:

```bash
cd terraform

cat > terraform.tfvars << EOL
project_id          = "YOUR_GCP_PROJECT_ID"
region              = "us-central1"
zone                = "us-central1-a"
node_count          = 2
db_password         = "YOUR_SECURE_PASSWORD"
firebase_project_id = "YOUR_FIREBASE_PROJECT_ID"
EOL
```

#### 2.2. Initialize Terraform

```bash
terraform init
```

#### 2.3. Run Terraform Plan

```bash
terraform plan -out=tfplan
```

Review the plan to ensure it will create the expected resources.

#### 2.4. Apply Terraform Configuration

```bash
terraform apply tfplan
```

This process will take approximately 10-15 minutes to complete.

#### 2.5. Verify Infrastructure Deployment

```bash
# View Terraform outputs
terraform output

# Configure kubectl to use the new cluster
gcloud container clusters get-credentials $(terraform output -raw kubernetes_cluster_name) \
  --zone $(terraform output -raw zone)

# Verify GKE cluster
kubectl get nodes

# Verify Cloud SQL instance (should be listed)
gcloud sql instances list
```

### Phase 3: Application Deployment

#### 3.1. Build Docker Image

```bash
# Navigate to project root directory
cd ..

# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/schoolbus-school-service:latest .
```

#### 3.2. Push Image to Google Container Registry

```bash
# Configure Docker to use gcloud credentials
gcloud auth configure-docker

# Push the image
docker push gcr.io/YOUR_PROJECT_ID/schoolbus-school-service:latest
```

#### 3.3. Deploy Application to GKE

```bash
# Update the deployment image
kubectl set image deployment/schoolbus-school-service \
  schoolbus-school-service=gcr.io/YOUR_PROJECT_ID/schoolbus-school-service:latest \
  -n schoolbus

# Check deployment status
kubectl rollout status deployment/schoolbus-school-service -n schoolbus
```

#### 3.4. Configure Firebase Authentication for the Application

1. Generate a Firebase Admin SDK service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file

2. Create a Kubernetes secret with the key:
```bash
kubectl create secret generic firebase-admin-key \
  --from-file=firebase-key.json=/path/to/your/downloaded/key.json \
  -n schoolbus
```

3. Update the deployment to use the Firebase key:
```bash
kubectl patch deployment schoolbus-school-service -n schoolbus -p '{"spec":{"template":{"spec":{"containers":[{"name":"schoolbus-school-service","env":[{"name":"GOOGLE_APPLICATION_CREDENTIALS","value":"/etc/firebase/firebase-key.json"}],"volumeMounts":[{"name":"firebase-key","mountPath":"/etc/firebase","readOnly":true}]}],"volumes":[{"name":"firebase-key","secret":{"secretName":"firebase-admin-key"}}]}}}}'
```

#### 3.5. Verify Application Deployment

```bash
# Get the external IP
kubectl get service schoolbus-school-service -n schoolbus

# Save the IP for later use
export SERVICE_IP=$(kubectl get service schoolbus-school-service -n schoolbus -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
```

### Phase 4: Testing & Validation

#### 4.1. Test Health Endpoint

```bash
curl http://$SERVICE_IP/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2023-xx-xxTxx:xx:xxZ",
  "service": "schoolbus-school-service"
}
```

#### 4.2. Test Authentication

1. Get a Firebase authentication token:
   - Use the Firebase Authentication REST API
   - Or create a simple script to get a token:

```javascript
// get-token.js
const firebase = require('firebase/app');
require('firebase/auth');

firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY"
});

firebase.auth().signInWithEmailAndPassword('admin@example.com', 'password')
  .then((userCredential) => {
    return userCredential.user.getIdToken();
  })
  .then((token) => {
    console.log(token);
  })
  .catch((error) => {
    console.error(error);
  });
```

2. Test API with authentication:
```bash
# Save your token
export AUTH_TOKEN="your-firebase-token"

# Test authenticated endpoint
curl -H "Authorization: Bearer $AUTH_TOKEN" http://$SERVICE_IP/api/schools
```

#### 4.3. Test CRUD Operations

```bash
# Create a school
curl -X POST \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test School","address":"123 Test St","city":"Testville"}' \
  http://$SERVICE_IP/api/schools

# Get all schools
curl -H "Authorization: Bearer $AUTH_TOKEN" http://$SERVICE_IP/api/schools

# Get a specific school (replace SCHOOL_ID with actual ID)
curl -H "Authorization: Bearer $AUTH_TOKEN" http://$SERVICE_IP/api/schools/SCHOOL_ID

# Update a school
curl -X PUT \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated School Name"}' \
  http://$SERVICE_IP/api/schools/SCHOOL_ID

# Delete a school
curl -X DELETE \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  http://$SERVICE_IP/api/schools/SCHOOL_ID
```

#### 4.4. Load Testing (optional)

Use a tool like Apache Benchmark (ab) or k6 to perform load testing:

```bash
# Example with ab - 100 requests with 10 concurrent users
ab -n 100 -c 10 -H "Authorization: Bearer $AUTH_TOKEN" http://$SERVICE_IP/api/schools
```

### Phase 5: CI/CD Setup

#### 5.1. Configure GitHub Actions Secrets

Add the following secrets to your GitHub repository:
- `GCP_PROJECT_ID` - Your Google Cloud project ID
- `GCP_SA_KEY` - Base64-encoded service account key

```bash
# Encode the service account key
cat key.json | base64
```

#### 5.2. Test CI Pipeline

1. Make a small change to the codebase
2. Push to a feature branch
3. Create a pull request
4. Verify that tests run successfully

#### 5.3. Test CD Pipeline

1. Merge the pull request to main
2. Verify that the image is built and pushed
3. Verify that the deployment is updated

#### 5.4. Verify Automatic Deployment

1. Check the GitHub Actions logs for successful deployment
2. Verify in GKE that the deployment has been updated
3. Test the updated application functionality

## Cleanup Instructions (When Needed)

When you need to tear down the infrastructure:

```bash
cd terraform
terraform destroy
```

When prompted, type `yes` to confirm.

**Important**: This will delete all resources including the database. Ensure you have backups if needed.
