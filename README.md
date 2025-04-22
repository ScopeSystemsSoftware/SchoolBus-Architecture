# SchoolBus School Microservice

This repository contains the School Microservice for the SchoolBus Management Platform, designed to manage school data in a secure and scalable way.

## Deployment Status & Progress Tracking

We're implementing the deployment following a phased approach. Below is our current progress:

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

## Getting Started

For complete deployment instructions, please see the [DEPLOYMENT.md](DEPLOYMENT.md) document.

## Next Steps

Our immediate next steps are:
1. Complete Phase 1 setup (Prerequisites & Initial Setup)
2. Configure basic Terraform files
3. Start with infrastructure deployment

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Google Cloud Platform Documentation](https://cloud.google.com/docs)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [TypeORM Documentation](https://typeorm.io/) 