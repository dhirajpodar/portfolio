import type { TocHeading } from "@/components/blog/toc-sidebar";

export const headings: TocHeading[] = [
  { id: "intro", text: "Introduction", level: 2 },
  { id: "infrastructure", text: "Infrastructure with Bicep", level: 2 },
  { id: "deployment", text: "Container Apps Deployment", level: 2 },
  { id: "autoscaling", text: "KEDA Autoscaling", level: 3 },
  { id: "evaluation", text: "Evaluation Pipelines", level: 2 },
  { id: "monitoring", text: "Monitoring & Observability", level: 2 },
];

export default function AzureMlOps() {
  return (
    <>
      <h2 id="intro">Introduction</h2>
      <p>
        Getting an ML model working in a notebook is the easy part. Deploying
        it reliably, scaling it to handle production traffic, and monitoring
        its performance over time — that&apos;s where MLOps comes in. This post
        covers the deployment stack I built on Azure for our AI platform.
      </p>

      <h2 id="infrastructure">Infrastructure with Bicep</h2>
      <p>
        All infrastructure is defined as code using Azure Bicep. This includes
        Container Apps environments, PostgreSQL Flexible Server, Redis Cache,
        Key Vault, VNet configuration, and private endpoints. Every
        environment (dev, staging, prod) is provisioned from the same
        templates with parameter files.
      </p>
      <pre>
        <code>{`// Bicep module for Container App
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
}`}</code>
      </pre>

      <h2 id="deployment">Container Apps Deployment</h2>
      <p>
        Azure Container Apps provides a serverless container platform that
        handles TLS, load balancing, and revision management. We use GitHub
        Actions to build Docker images, push to Azure Container Registry, and
        deploy new revisions with zero-downtime rolling updates.
      </p>

      <h3 id="autoscaling">KEDA Autoscaling</h3>
      <p>
        KEDA (Kubernetes Event-Driven Autoscaling) scales our worker
        containers based on Redis Stream length. When the document ingestion
        queue grows, KEDA automatically spins up more workers. When the queue
        drains, it scales back to the minimum.
      </p>
      <blockquote>
        The cost savings from event-driven scaling were significant — our
        worker fleet went from 4 always-on instances to an average of 1.2,
        with burst capacity to 10 during peak ingestion.
      </blockquote>

      <h2 id="evaluation">Evaluation Pipelines</h2>
      <p>
        We use LangSmith for continuous evaluation of our AI agents. Every
        production conversation is traced, and we maintain a curated dataset
        of representative queries with expected behaviors. A nightly CI job
        runs the evaluation suite and flags regressions.
      </p>

      <h2 id="monitoring">Monitoring & Observability</h2>
      <ul>
        <li>
          <strong>PostHog:</strong> Tracks user-facing metrics — conversation
          completion rates, feature adoption, and session analytics.
        </li>
        <li>
          <strong>Prometheus + Grafana:</strong> Infrastructure metrics — API
          latency, error rates, container resource utilization.
        </li>
        <li>
          <strong>LangSmith:</strong> LLM-specific observability — token usage,
          latency per model call, tool execution success rates.
        </li>
        <li>
          <strong>Structured logging:</strong> JSON logs shipped to Azure Log
          Analytics with correlation IDs for end-to-end request tracing.
        </li>
      </ul>
    </>
  );
}
