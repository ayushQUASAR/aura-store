# AuraStore

Full-stack microservices eCommerce platform on Kubernetes with GitOps, canary deployments, and observability.

## Services

| Service | Port | Tech | DB |
|---------|------|------|----|
| storefront | 3000 | React 19 + Vite | - |
| api-gateway | 8080 | Spring Cloud Gateway | - |
| auth-service | 8081 | Spring Boot + Security | PostgreSQL |
| catalog-service | 8082 | Spring Boot + Redis Cache | PostgreSQL |
| order-service | 8083 | Spring Boot + Kafka | PostgreSQL |
| history-service | 8084 | Spring Boot + Kafka Consumer | PostgreSQL |

## Quick Start

```bash
docker compose up --build -d
# Open http://localhost:3000
```

## Architecture

```
Browser (localhost:3000 or ecommerce.cris-atoms.local)
  │
  ├── /api/auth/**  ──► auth-service ──► PostgreSQL
  ├── /api/catalog/** ──► catalog-service ──► PostgreSQL + Redis + Kafka
  ├── /api/orders/** ──► order-service ──► PostgreSQL + Kafka
  └── /api/admin/history/** ──► history-service ──► PostgreSQL
```

## CI/CD Pipeline (GitHub Actions)

Two-repo GitOps pattern:

```
Push to main (source repo)
  → detect-changes (per-service diff)
  → build & test changed services
  → push images to ghcr.io
  → update kustomize in deploy repo
  → ArgoCD syncs from deploy repo
```

Pipeline steps:
- `detect-changes`: git diff with `fetch-depth:0`
- `build-java-services`: Maven test + package + docker per changed service
- `build-storefront`: npm ci + test + docker
- `qodana`: static code analysis (JetBrains Qodana)
- `update-deploy-repo`: kustomize edit image + commit + push

## Canary Deployments

Catalog service uses GAMMA HTTPRoute (gateway.networking.k8s.io/v1) for weighted traffic split:
- `catalog-stable`: weight 90
- `catalog-canary`: weight 10

Define in `aura-store-deployments/istio/http-routes.yaml`.

## Testing

Storefront: `npm test` (vitest + testing-library)
Java services: `mvn test -B` (JUnit 5 + Spring Boot Test)

Test files live alongside source:
- `src/App.test.tsx`
- `src/components/Navbar.test.tsx`
- `microservices/*/src/test/java/`

## Static Analysis

Qodana config at `qodana.yaml` — runs in CI via `JetBrains/qodana-action`. Profile: `qodana.recommended` for JVM + JS/TS.

## Cluster

- RKE2 v1.35.6, 3 control-plane + 3 workers
- Ingress: `ecommerce.cris-atoms.local`
- Istio ambient mesh + waypoint proxy
- ArgoCD v3.4.5 (admin pw: `5cxLHZoqMpIUyqid`)

## GitOps

| App | Source |
|-----|--------|
| aurastore-apps | `aura-store-deployments/base/*` |
| aurastore-infrastructure | `aura-store-deployments/base/*` (postgres, redis, kafka) |
| aurastore-istio | `aura-store-deployments/istio/` |
| aurastore-monitoring | `aura-store-deployments/monitoring/` |

## Monitoring

- **Prometheus**: Rancher monitoring in `cattle-monitoring-system`
- **Grafana**: `rancher-monitoring-grafana.cattle-monitoring-system` with AuraStore dashboard
- **Jaeger**: tracing in `istio-system` (jaegertracing/all-in-one:1.62)
- **Kiali**: service mesh visualization
- **ServiceMonitors**: all services scrape `/actuator/prometheus` every 15s
- **Istio metrics**: waypoint + ztunnel stats scraped every 30s

## Local Development

```bash
# Infrastructure
docker run -d --name aurastore-postgres -e POSTGRES_DB=retail_db -e POSTGRES_USER=retail_user -e POSTGRES_PASSWORD=retail_pass -p 5432:5432 postgres:15-alpine
docker run -d --name aurastore-redis -p 6379:6379 redis:7-alpine
docker run -d --name aurastore-zookeeper -p 2181:2181 confluentinc/cp-zookeeper:7.3.0
docker run -d --name aurastore-kafka -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=localhost:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka:7.3.0

# Build Java services
for dir in auth-service catalog-service order-service api-gateway; do (cd microservices/$dir && mvn clean package -DskipTests); done

# Start services (separate terminals)
POSTGRES_HOST=localhost KAFKA_SERVERS=localhost:9092 java -jar microservices/auth-service/target/auth-service-1.0.0.jar
POSTGRES_HOST=localhost REDIS_HOST=localhost KAFKA_SERVERS=localhost:9092 java -jar microservices/catalog-service/target/catalog-service-1.0.0.jar
POSTGRES_HOST=localhost KAFKA_SERVERS=localhost:9092 java -jar microservices/order-service/target/order-service-1.0.0.jar
java -jar microservices/api-gateway/target/api-gateway-1.0.0.jar

# Storefront
npm install && npm run dev  # opens at localhost:5173
```

## Project Structure

```
├── .github/workflows/build-and-deploy.yaml  # CI/CD pipeline
├── qodana.yaml                               # Qodana static analysis config
├── vitest.config.ts                           # Storefront test config
├── src/                                       # React storefront
│   ├── App.tsx
│   ├── components/
│   └── *.test.tsx                             # Storefront tests
├── microservices/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── catalog-service/
│   ├── order-service/
│   └── history-service/
└── docker-compose.yml
```
