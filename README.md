# XeHay --- Car Marketplace DevOps Flow

A personal DevOps project that deploys **XeHay**, a car-marketplace web
application, to a self-managed Kubernetes cluster running on VMware. The
project practices containerization, CI/CD, GitOps, application
observability, and recovery workflows.

> **Project scope:** VMware + kubeadm Kubernetes (not Amazon EKS).

## Table of contents

-   [Overview](#overview)
-   [Architecture](#architecture)
-   [Technology stack](#technology-stack)
-   [Repositories](#repositories)
-   [Application](#application)
-   [Kubernetes environment](#kubernetes-environment)
-   [CI/CD and GitOps workflow](#cicd-and-gitops-workflow)
-   [Monitoring](#monitoring)
-   [Access points](#access-points)
-   [Useful commands](#useful-commands)
-   [Recovery and rollback](#recovery-and-rollback)
-   [Current status](#current-status)
-   [Next steps](#next-steps)

## Overview

XeHay is a car-marketplace starter application with a React frontend and
a Java Spring Boot backend. The DevOps workflow is designed to automate
building, validating, publishing, and deploying application images, then
observe the workload in Kubernetes.

The application currently uses in-memory demo data; data can reset when
the backend restarts. It is a learning/demo project, not a production
marketplace.

## Architecture

``` mermaid
flowchart LR
    Dev[Developer] --> GH[GitHub: Application Repository]
    GH --> J[Jenkins CI]
    J --> Test[Build and Quality Checks]
    Test --> Image[Build and Push Docker Images]
    Image --> DH[Docker Hub]
    J --> GM[Update GitOps Manifests]
    GM --> GHR[GitHub: GitOps Repository]
    GHR --> Argo[Argo CD]
    Argo --> K8s[VMware kubeadm Kubernetes]
    DH -. Images pulled by nodes .-> K8s
    K8s --> FE[React Frontend]
    K8s --> BE[Spring Boot API]
    K8s --> Prom[Prometheus]
    Prom --> Graf[Grafana Dashboard]
    J --> Slack[Slack Notifications]
```

### Deployment flow

1.  A developer pushes application code to GitHub.
2.  Jenkins runs the CI pipeline, including build/test and configured
    code/security checks.
3.  Docker images are built and pushed to Docker Hub when the pipeline
    succeeds.
4.  The deployment workflow updates Kubernetes manifests in the GitOps
    repository.
5.  Argo CD reconciles the desired manifests with the Kubernetes
    cluster.
6.  Kubernetes runs the frontend and backend Pods and exposes the
    application.
7.  Prometheus collects monitoring metrics; Grafana visualizes them.
    Jenkins reports pipeline status through Slack.

The exact pipeline stages depend on the Jenkinsfile and the
credentials/plugins configured in Jenkins.

## Technology stack

  -----------------------------------------------------------------------
  Area                                Technologies
  ----------------------------------- -----------------------------------
  Frontend                            React, TypeScript, Vite

  Backend                             Java 21, Spring Boot, Maven

  Containers                          Docker

  Orchestration                       Kubernetes (kubeadm on VMware)

  CI                                  Jenkins

  GitOps / CD                         Argo CD

  Image registry                      Docker Hub

  Quality / security checks           SonarQube and Trivy, where
                                      configured in Jenkins

  Monitoring                          Prometheus, Grafana

  Notifications                       Slack

  Persistent monitoring storage       NFS-backed Kubernetes
                                      PersistentVolume and
                                      PersistentVolumeClaim
  -----------------------------------------------------------------------

## Repositories

-   **Application and DevOps repository:** `Devops-Flow-Application`
    -   Application source, Docker configuration, Kubernetes manifests
        used for development, and project documentation.
-   **GitOps repository:** `GitOps-Flow-Application`
    -   Desired Kubernetes deployment state that Argo CD watches and
        synchronizes.

Update these links with your actual GitHub repository URLs if you want
this README to be directly navigable.

## Application

### Frontend

-   React + TypeScript, built with Vite.
-   Local development command:

``` bash
npm install
npm run dev
```

### Backend

-   Java 21 + Spring Boot + Maven.
-   Local development command:

``` bash
mvn spring-boot:run
```

### API endpoints

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  GET                     `/api/cars`             List/search cars;
                                                  supports query
                                                  parameters such as `q`,
                                                  `brand`, and `maxPrice`

  GET                     `/api/cars/{id}`        Get a car by ID

  POST                    `/api/cars`             Create a car

  DELETE                  `/api/cars/{id}`        Delete a car

  GET                     `/actuator/health`      Spring Boot health
                                                  check
  -----------------------------------------------------------------------

The API uses in-memory demo data, so changes are not durable across
backend restarts.

## Kubernetes environment

The Kubernetes cluster is hosted on VMware Workstation and was
initialized with kubeadm.

  Role            Hostname              IP address
  --------------- --------------------- -------------------
  Control plane   `k8s-ControllPlane`   `192.168.212.101`
  Worker 1        `k8s-Worker1`         `192.168.212.102`
  Worker 2        `k8s-Worker2`         `192.168.212.103`

The application namespace is `car-marketplace`. The cluster uses an
NGINX Ingress setup and NodePort access for services used during
development. Keep the actual service and Ingress configuration in the
Kubernetes manifests as the source of truth.

Check cluster health:

``` bash
kubectl get nodes -o wide
kubectl get pods -n car-marketplace -o wide
kubectl get services -n car-marketplace
kubectl get ingress -A
```

## CI/CD and GitOps workflow

### Jenkins

Jenkins coordinates the CI workflow. Depending on the current pipeline
configuration, the stages include:

-   Checkout source code.
-   Build and test the frontend/backend.
-   Run configured quality and security checks.
-   Build and push container images.
-   Publish build status notifications to Slack.
-   Update the GitOps repository after a successful build.

### Argo CD

Argo CD watches the GitOps repository and synchronizes Kubernetes
resources to match the desired state stored in Git.

Useful checks:

``` bash
kubectl get pods -A
kubectl get applications -A
```

If the Argo CD CLI is installed and authenticated, inspect the
application with:

``` bash
argocd app list
argocd app get car-marketplace
```

Use the actual Argo CD namespace and application name if they differ in
your installation.

## Monitoring

Prometheus and Grafana are deployed in the `monitoring` namespace using
the Prometheus Community `kube-prometheus-stack` chart.

### Access points

-   Grafana: `http://192.168.212.101:30300`
-   Prometheus: `http://192.168.212.101:30090`

Grafana dashboard: **Car MarketPlace Kubernetes Monitoring**. The
dashboard contains panels for Kubernetes/node resource usage, Pod
counts/restarts, network activity, and node availability.

Check monitoring resources:

``` bash
kubectl get pods -n monitoring -o wide
kubectl get services -n monitoring
kubectl get pvc -n monitoring
kubectl get pv
```

### Grafana persistence

Grafana data is configured to use an NFS-backed PersistentVolumeClaim:

-   NFS server: `192.168.212.101`
-   Export path: `/data/monitoring`
-   PersistentVolume: `monitoring-pv` (10 GiB)
-   PersistentVolumeClaim: `monitoring/grafana-data` (5 GiB request)
-   StorageClass: `nfs-storage`

Check binding and mount configuration:

``` bash
kubectl get pv monitoring-pv
kubectl get pvc grafana-data -n monitoring
kubectl get deployment monitoring-grafana -n monitoring \
  -o jsonpath='{.spec.template.spec.volumes[2].persistentVolumeClaim.claimName}{"\n"}'
```

**Important:** the persistence change was being validated on 21 October
2026. Confirm that the new Grafana Pod is healthy and the dashboard/data
survive a Pod recreation before treating persistence as fully verified.

Do not delete the PV or PVC during routine troubleshooting; the PV uses
a `Retain` reclaim policy.

## Access points

  -----------------------------------------------------------------------
  Component                           URL / address
  ----------------------------------- -----------------------------------
  Kubernetes control plane            `192.168.212.101`

  Grafana                             `http://192.168.212.101:30300`

  Prometheus                          `http://192.168.212.101:30090`

  Application                         Use the NodePort or Ingress address
                                      configured in the current manifests
  -----------------------------------------------------------------------

NodePort and Ingress addresses may vary if the manifests or cluster
configuration change. Verify with
`kubectl get svc,ingress -n car-marketplace` before sharing an endpoint.

## Useful commands

### Application workloads

``` bash
kubectl get all -n car-marketplace
kubectl rollout status deployment/<deployment-name> -n car-marketplace
kubectl describe deployment <deployment-name> -n car-marketplace
kubectl logs deployment/<deployment-name> -n car-marketplace --tail=100
```

### Inspect CI/CD-related resources

``` bash
kubectl get pods -A
kubectl get applications -A
```

### Monitor rollout and recent events

``` bash
kubectl get pods -n monitoring -o wide
kubectl get events -n monitoring --sort-by='.lastTimestamp' | tail -20
```

### Validate Grafana rollout and storage

``` bash
kubectl rollout status deployment/monitoring-grafana \
  -n monitoring --timeout=300s

kubectl get pods -n monitoring \
  -l app.kubernetes.io/name=grafana -o wide

kubectl get pvc grafana-data -n monitoring
```

## Recovery and rollback

Kubernetes can recreate failed Pods according to the workload
controller's desired state. A rollout can be checked and, if necessary,
rolled back at the Deployment level.

``` bash
# Inspect rollout history
kubectl rollout history deployment/<deployment-name> -n car-marketplace

# Roll back to the previous Deployment revision
kubectl rollout undo deployment/<deployment-name> -n car-marketplace

# Wait for the rollback
kubectl rollout status deployment/<deployment-name> -n car-marketplace

# Verify the application Pods and Services
kubectl get pods,svc -n car-marketplace -o wide
```

For a GitOps-managed workload, a manual cluster change may be
overwritten by Argo CD. Prefer reverting the bad manifest/image tag in
the GitOps repository and allowing Argo CD to synchronize the corrected
desired state. Test rollback and recovery deliberately and record the
result; do not claim the test passed until it has been run.

## Current status

As of **21 October 2026**:

-   Kubernetes cluster: existing three-node VMware kubeadm cluster.
-   Application deployment and GitOps workflow: project components are
    in place; verify live status before a demo.
-   Slack notifications: implemented in the project workflow.
-   Prometheus/Grafana: deployed; dashboard created.
-   Grafana NFS persistence: PV/PVC are bound and the new Pod is being
    validated. The rollout has experienced readiness/liveness probe
    failures while Grafana starts and runs migrations.
-   Failure/recovery and rollback demonstration: still needs to be
    executed and documented.
-   Final demo evidence: capture successful pipeline output, Argo CD
    sync/health, application access, dashboard metrics, and a
    recovery/rollback test.

## Week 6 completion checklist

-   [x] Slack pipeline notifications configured.
-   [x] Prometheus and Grafana deployed.
-   [x] Car Marketplace Kubernetes dashboard created.
-   [ ] Confirm Grafana Deployment is healthy after attaching persistent
    storage.
-   [ ] Verify Grafana data/dashboard persists through Pod recreation.
-   [ ] Execute and record an application failure/recovery test.
-   [ ] Execute and record a rollback test.
-   [ ] Capture final screenshots/logs and update project evidence.

## Security notes

-   Never commit Jenkins credentials, Docker Hub tokens, Slack webhook
    URLs, Grafana admin passwords, or Kubernetes secrets.
-   Use environment variables or the appropriate secret store for
    sensitive configuration.
-   Rotate any credential that has accidentally been committed or
    exposed.
-   Replace example or local-only addresses with the correct values for
    your own environment before publishing the repository.
