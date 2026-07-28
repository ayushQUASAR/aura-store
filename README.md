# AuraStore: Full-Stack Microservices eCommerce Platform

AuraStore is a production-ready, high-performance eCommerce application designed for deployment on **Kubernetes** clusters or **Docker Compose** locally.

This repository contains:
1. **Interactive Storefront SPA (React.js + Vite)**: A beautiful customer-facing storefront featuring dynamic search, product filtering, user authentication, a sliding cart drawer, and secure checkout.
2. **Express API Gateway + Proxy (`server.ts`)**: Embedded Express.js server that proxies `/api/*` requests to the Spring Cloud API Gateway — works out-of-the-box for both local dev and Kubernetes.
3. **Four Java Spring Boot Microservices (`/microservices`)**: Fully implemented Spring Boot services supporting PostgreSQL, Redis query caching, Kafka message streams, and Actuator Prometheus metrics.
4. **Docker Compose (`docker-compose.yml`)**: One-command local orchestration (recommended for development).
5. **Kubernetes Manifests (`/k8s` and `/local-k8s`)**: Deployment definitions for production and local clusters.

---

## 🚀 Quick Start (Docker Compose — Recommended)

The fastest way to run the entire platform locally:

```bash
# Start everything (builds all images automatically)
docker compose up --build -d

# Watch logs
docker compose logs -f

# Open the app
http://localhost:3000
```

This starts 8 Docker containers:
| Service | Port | Description |
|---------|------|-------------|
| **PostgreSQL** | 5432 | Shared relational database |
| **Redis** | 6379 | Catalog query cache |
| **Zookeeper** | 2181 | Kafka coordination |
| **Kafka** | 9092 | Event streaming |
| **auth-service** | 8081 | Authentication & JWT generation |
| **catalog-service** | 8082 | Product catalog with Redis cache |
| **order-service** | 8083 | Order management with Kafka |
| **api-gateway** | 8080 | Spring Cloud Gateway (routing) |
| **storefront** | 3000 | React/Vite SPA |

> ⏱️ **First build takes 5–10 minutes** (Maven downloads dependencies).

### Useful Docker Commands

```bash
# View logs for a specific service
docker compose logs -f auth-service

# Rebuild a single service (after code changes)
docker compose build catalog-service && docker compose up -d catalog-service

# Restart everything
docker compose restart

# Reset all data (wipes database)
docker compose down -v && docker compose up --build -d
```

---

## 🏗️ System Architecture & Ports

```
Browser (http://localhost:3000)
  │
  │ /api/* (proxied by server.ts → api-gateway:8080)
  ▼
Spring Cloud API Gateway (:8080)
  │
  ├── /api/auth/**  ──► auth-service (:8081) ──► PostgreSQL (:5432)
  ├── /api/catalog/** ──► catalog-service (:8082) ──► PostgreSQL + Redis (:6379) + Kafka (:9092)
  └── /api/orders/** ──► order-service (:8083) ──► PostgreSQL + Kafka
```

| Service Name | Port | Directory | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Aura Storefront** | `3000` | `/` | React 19 + Vite + Tailwind V4 |
| **API Gateway** | `8080` | `/microservices/api-gateway` | Spring Cloud Gateway |
| **Auth Service** | `8081` | `/microservices/auth-service` | Spring Security, JJWT, JPA |
| **Catalog Service** | `8082` | `/microservices/catalog-service` | Spring Web, Redis Cache, Kafka Producer |
| **Order Service** | `8083` | `/microservices/order-service` | Spring Kafka Producer/Consumer |
| **PostgreSQL** | `5432` | `k8s/postgres.yaml` | PostgreSQL 15 |
| **Redis Cache** | `6379` | `k8s/redis.yaml` | Redis 7 Alpine |
| **Kafka Broker** | `9092` | `k8s/kafka.yaml` | Confluent Kafka + Zookeeper |

---

## 🧪 Testing the API

```bash
# 1. Get an ADMIN token (demo login)
curl -X POST http://localhost:8080/api/auth/demo \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'

# 2. List products (public — no auth needed)
curl http://localhost:8080/api/catalog/products

# 3. Create a product (ADMIN only — requires token)
TOKEN="<ADMIN_TOKEN_FROM_STEP_1>"
curl -X POST http://localhost:8080/api/catalog/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Wireless Headphones","description":"Noise cancelling bluetooth","price":79.99,"category":"Electronics","imageUrl":"","stock":50}'

# 4. Get categories
curl http://localhost:8080/api/catalog/categories
```

---

## 💻 Local Development (without Docker)

### Prerequisites
- **Java 17+** and **Maven 3.9+**
- **Node.js 20+** and **npm**
- **Docker** (for PostgreSQL, Redis, Kafka)

### 1. Start Infrastructure

```bash
docker run -d --name aurastore-postgres \
  -e POSTGRES_DB=retail_db \
  -e POSTGRES_USER=retail_user \
  -e POSTGRES_PASSWORD=retail_pass \
  -p 5432:5432 postgres:15-alpine

docker run -d --name aurastore-redis \
  -p 6379:6379 redis:7-alpine

docker run -d --name aurastore-zookeeper \
  -p 2181:2181 \
  -e ZOOKEEPER_CLIENT_PORT=2181 \
  -e ZOOKEEPER_TICK_TIME=2000 \
  confluentinc/cp-zookeeper:7.3.0

docker run -d --name aurastore-kafka \
  -p 9092:9092 \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_ZOOKEEPER_CONNECT=localhost:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 \
  confluentinc/cp-kafka:7.3.0
```

### 2. Build Java Microservices

```bash
for dir in auth-service catalog-service order-service api-gateway; do
  (cd microservices/$dir && mvn clean package -DskipTests)
done
```

### 3. Start Microservices (4 terminals)

```bash
# Terminal 1 - Auth (port 8081)
POSTGRES_HOST=localhost KAFKA_SERVERS=localhost:9092 \
  java -jar microservices/auth-service/target/auth-service-1.0.0.jar

# Terminal 2 - Catalog (port 8082)
POSTGRES_HOST=localhost REDIS_HOST=localhost KAFKA_SERVERS=localhost:9092 \
  java -jar microservices/catalog-service/target/catalog-service-1.0.0.jar

# Terminal 3 - Order (port 8083)
POSTGRES_HOST=localhost KAFKA_SERVERS=localhost:9092 \
  java -jar microservices/order-service/target/order-service-1.0.0.jar

# Terminal 4 - Gateway (port 8080)
java -jar microservices/api-gateway/target/api-gateway-1.0.0.jar
```

### 4. Start Storefront

```bash
npm install
API_GATEWAY_URL=http://localhost:8080 npm run dev
```

Open http://localhost:5173

---

## ☸️ Deploying to Kubernetes (Minikube / Kind)

### Minikube

```bash
minikube start --cpus=4 --memory=8g
eval $(minikube docker-env)

# Build all Docker images (Dockerfiles in each microservice dir)
docker build -t auth-service:latest -f microservices/auth-service/Dockerfile microservices/auth-service
docker build -t catalog-service:latest -f microservices/catalog-service/Dockerfile microservices/catalog-service
docker build -t order-service:latest -f microservices/order-service/Dockerfile microservices/order-service
docker build -t api-gateway:latest -f microservices/api-gateway/Dockerfile microservices/api-gateway
docker build -t aura-storefront:latest -f Dockerfile .

# Apply manifests
kubectl apply -f local-k8s/namespace.yaml
kubectl apply -f local-k8s/jwt-secret.yaml
kubectl apply -f local-k8s/postgres.yaml
kubectl apply -f local-k8s/redis.yaml
kubectl apply -f local-k8s/kafka.yaml
kubectl apply -f local-k8s/services.yaml
kubectl apply -f local-k8s/ingress.yaml

# Enable ingress
minikube addons enable ingress

# Wait for pods
kubectl wait --for=condition=ready pods --all -n local-retail --timeout=300s
```

### Kind

See [local-k8s/README.md](local-k8s/README.md) for detailed Kind setup instructions.

---

## 👤 User Authentication Flow

The app uses JWT-based authentication:

1. **Register** or use the **Demo Login** buttons (Customer or Admin)
2. Backend (`auth-service`) validates credentials and returns a JWT
3. JWT contains `sub` (email) and `role` (CUSTOMER or ADMIN) claims
4. Frontend stores the token in `localStorage` as `aura_session`
5. API calls include `Authorization: Bearer <token>` header
6. `catalog-service` and `order-service` validate the token independently using the shared `jwt.secret`

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Customer | customer@example.com | password123 |

---

## 📈 Prometheus Monitoring

All services expose Prometheus metrics at `/actuator/prometheus`:

| Metric | Type | Description |
|--------|------|-------------|
| `auth_login_attempts_total` | Counter | Total login requests |
| `auth_registrations_total` | Counter | Total registrations |
| `catalog_fetches_total` | Counter | Product catalog lookups |
| `catalog_cache_evictions_total` | Counter | Redis cache flushes |
| `catalog_kafka_published_total` | Counter | Kafka events published |
| `orders_placed_total` | Counter | Orders created |
| `orders_status_updates_total` | Counter | Order status changes |

---

## 📁 Project Structure

```
├── docker-compose.yml              # Local orchestration (recommended)
├── server.ts                        # Express server with API proxy middleware
├── Dockerfile                       # Storefront production container
├── package.json                     # Node dependencies & build scripts
├── src/                             # React/TypeScript storefront
│   ├── App.tsx                      # Main app with routing, auth, cart
│   ├── types.ts                     # Type definitions
│   └── components/
│       ├── Navbar.tsx               # Top navigation bar
│       ├── AuthModal.tsx            # Login/Register modal
│       ├── CartModal.tsx            # Shopping cart drawer
│       ├── ProductCard.tsx          # Product display card
│       └── AdminDashboard.tsx       # Admin CRUD interface
├── k8s/                             # Production Kubernetes manifests
│   ├── postgres.yaml                # PostgreSQL StatefulSet
│   ├── redis.yaml                   # Redis Deployment
│   ├── kafka.yaml                   # Kafka + Zookeeper
│   ├── jwt-secret.yaml              # JWT signing secret
│   ├── services.yaml                # All microservice deployments
│   └── ingress.yaml                 # NGINX ingress rules
├── local-k8s/                       # Local K8s manifests (Minikube/Kind)
│   ├── namespace.yaml
│   ├── postgres.yaml
│   ├── redis.yaml
│   ├── kafka.yaml
│   ├── jwt-secret.yaml
│   ├── services.yaml
│   ├── ingress.yaml
│   └── README.md
├── microservices/
│   ├── api-gateway/                 # Spring Cloud Gateway (:8080)
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/java/com/aurastore/gateway/
│   ├── auth-service/                # Auth & JWT (:8081)
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/java/com/aurastore/auth/
│   ├── catalog-service/             # Products with Redis cache (:8082)
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/java/com/aurastore/catalog/
│   └── order-service/               # Orders with Kafka (:8083)
│       ├── Dockerfile
│       ├── pom.xml
│       └── src/main/java/com/aurastore/order/
└── storefront images/              # Pre-built Docker image archives
