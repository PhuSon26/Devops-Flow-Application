# XeHay — Car Marketplace Starter

A starter used-car marketplace application intended for full-stack and DevOps practice.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Java 21 + Spring Boot + Maven
- Current data: in-memory demo data (resets when backend restarts)

## Run locally

### Backend
Requirements: JDK 21 and Maven.
```bash
cd backend
mvn spring-boot:run
```
API base: `http://localhost:8080/api/cars`

### Frontend
Requirements: Node.js 20+.
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL, usually `http://localhost:5173`.

## API endpoints
- `GET /api/cars` — list cars; optional query params `q`, `brand`, `maxPrice`
- `GET /api/cars/{id}` — car details
- `POST /api/cars` — create a listing
- `DELETE /api/cars/{id}` — delete a listing
- `GET /actuator/health` — health check

## Deliberately left for your DevOps practice
This starter does NOT include Dockerfile, Docker Compose, Kubernetes manifests, Jenkinsfile, Argo CD configuration, or monitoring manifests. Build those yourself as part of the project.

## Suggested next features
1. Replace in-memory storage with PostgreSQL.
2. Add account registration/login and seller profiles.
3. Add image upload or image URLs for listings.
4. Add favorites and listing moderation.
5. Write Dockerfiles and Docker Compose.
6. Deploy to Kubernetes, then create a Jenkins CI pipeline.
