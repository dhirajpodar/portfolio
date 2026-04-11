---
title: "MLOps on Azure: From Experiment to Production"
excerpt: "A practical guide to deploying ML models on Azure Container Apps with Bicep IaC, KEDA autoscaling, and LangSmith evaluation pipelines."
tags:
  - "MLOps"
  - "System Design"
date: "2026-02-10"
readTime: "8 min read"
---

## Introduction

Getting an ML model working in a notebook is the easy part. Deploying it reliably, scaling it to handle production traffic, and monitoring its performance over time — that's where MLOps comes in. This post covers the deployment stack I built on Azure for our AI platform.

## Infrastructure with Bicep

All infrastructure is defined as code using Azure Bicep. This includes Container Apps environments, PostgreSQL Flexible Server, Redis Cache, Key Vault, VNet configuration, and private endpoints. Every environment (dev, staging, prod) is provisioned from the same templates with parameter files.

```bicep
// Bicep module for Container App
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      ingress: { external: true, targetPort: 8000 }
      secrets: [{ name: 'db-conn', keyVaultUrl: dbConnSecret }]
    }
    template: {
      containers: [{ name: 'api', image: image, resources: { cpu: 1, memory: '2Gi' } }]
      scale: { minReplicas: 1, maxReplicas: 10 }
    }
  }
}
```

## Container Apps Deployment

Azure Container Apps provides a serverless container platform that handles TLS, load balancing, and revision management. We use GitHub Actions to build Docker images, push to Azure Container Registry, and deploy new revisions with zero-downtime rolling updates.

### KEDA Autoscaling

KEDA (Kubernetes Event-Driven Autoscaling) scales our worker containers based on Redis Stream length. When the document ingestion queue grows, KEDA automatically spins up more workers. When the queue drains, it scales back to the minimum.

> The cost savings from event-driven scaling were significant — our worker fleet went from 4 always-on instances to an average of 1.2, with burst capacity to 10 during peak ingestion.

## Evaluation Pipelines

We use LangSmith for continuous evaluation of our AI agents. Every production conversation is traced, and we maintain a curated dataset of representative queries with expected behaviors. A nightly CI job runs the evaluation suite and flags regressions.

## Monitoring & Observability

- **PostHog:** Tracks user-facing metrics — conversation completion rates, feature adoption, and session analytics.
- **Prometheus + Grafana:** Infrastructure metrics — API latency, error rates, container resource utilization.
- **LangSmith:** LLM-specific observability — token usage, latency per model call, tool execution success rates.
- **Structured logging:** JSON logs shipped to Azure Log Analytics with correlation IDs for end-to-end request tracing.
