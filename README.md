# SchoolBus Management System

This repository contains the architecture documentation and reference implementation for the SchoolBus Management System platform.

## Important Notice

> **Architectural Change**: We've moved to a simplified Google Cloud Platform (GCP) implementation instead of the initial multi-tenant multi-cloud approach. The current architecture is detailed in the [GCP Architecture Document](SchoolBus-GCP-Architecture.md).

## Repository Contents

- [SchoolBus-GCP-Architecture.md](SchoolBus-GCP-Architecture.md): Comprehensive GCP-focused architecture document
- [SchoolBus-Developer-Guide.md](SchoolBus-Developer-Guide.md): Guide for developers implementing microservices
- [SchoolBus-Complete-Architecture.md](SchoolBus-Complete-Architecture.md): Original multi-tenant multi-cloud architecture (for reference only)

## Reference Implementation

The `src` directory contains a **reference implementation** of the School Management microservice using:
- **Backend**: NestJS with Firebase Auth integration
- **Frontend**: React implementation

This serves as a reference implementation and starting point for building the complete microservice architecture.

## Microservice Architecture

Our architecture follows a true microservice approach:

- Each microservice will have its own dedicated repository
- Frontend applications will also have separate repositories
- This repository serves as the architectural reference and contains a sample implementation

## Documentation

For the complete implementation details, please refer to:

- [Google Cloud Architecture](SchoolBus-GCP-Architecture.md): Full architecture specification for GCP implementation
- [Developer Guide](SchoolBus-Developer-Guide.md): Guidelines for implementing consistent microservices

## Getting Started

To implement a new microservice, follow these steps:

1. Review the [GCP Architecture Document](SchoolBus-GCP-Architecture.md)
2. Follow the implementation patterns in the [Developer Guide](SchoolBus-Developer-Guide.md)
3. Reference the sample implementation in the `src` directory

## Sample Implementation Features

The reference implementation in `src` demonstrates:

- Firebase Authentication integration
- Role-based authorization (admin, user roles)
- School entity management with REST API
- TypeORM with PostgreSQL database integration
- Frontend React application with authentication

## Next Steps

1. Create separate repositories for each planned microservice
2. Follow the architecture pattern demonstrated in the reference implementation
3. Implement the frontend applications in separate repositories 