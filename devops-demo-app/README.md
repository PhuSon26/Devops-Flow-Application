# DevOps Demo App

A small Spring Boot REST API created for a personal DevOps project using VMware, kubeadm Kubernetes, Jenkins, Docker, Trivy, Argo CD, Prometheus and Grafana.

## API endpoints

- `GET /` — application welcome response
- `GET /health` — simple application health response
- `GET /api/info` — project/pipeline information
- `GET /actuator/health` — Spring Boot Actuator health
- `GET /actuator/prometheus` — metrics endpoint for Prometheus

## Requirements

- Java 21
- Maven 3.9+
- Docker (for container build)

## Run locally

```bash
mvn clean verify
mvn spring-boot:run
```

Then open `http://localhost:8080/health`.

## Build a container

```bash
docker build -t devops-demo-app:1.0.0 .
docker run --rm -p 8080:8080 devops-demo-app:1.0.0
```

## Kubernetes

1. Replace `YOUR_DOCKERHUB_USER` in `k8s/deployment.yaml` with your Docker Hub username and published image.
2. Apply the manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl -n devops-demo rollout status deployment/devops-demo-app
kubectl -n devops-demo port-forward svc/devops-demo-app 8080:80
```

3. Visit `http://localhost:8080/health`.

## Important Jenkins note

The included `Jenkinsfile` is a starter pipeline. Configure Jenkins tools named `jdk21` and `maven3`, install/configure Docker and Trivy on the agent, and provide Docker Hub credentials before adding image-push stages. Do not store credentials in this repository.

## Project roadmap

1. Create a new VMware kubeadm cluster.
2. Test the application and Docker image locally.
3. Configure Jenkins CI and code quality scanning.
4. Publish images to Docker Hub.
5. Configure a separate GitOps repository for Argo CD.
6. Add Prometheus/Grafana dashboards and load-test autoscaling.
