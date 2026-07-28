#!/bin/bash
# ==============================================================
# Build & Deploy Script for AuraStore Microservices
# Run this on your controlPlane1 node where Docker can reach the registry
# ==============================================================

set -e

REGISTRY="10.10.10.2:31771"
NAMESPACE="production-retail"
VERSION="1.0.0"

tag_and_push() {
  local image_name="$1"
  local registry_name="$2"

  docker tag "${image_name}:latest" "${REGISTRY}/${registry_name}:${VERSION}"
  docker tag "${image_name}:latest" "${REGISTRY}/${registry_name}:latest"
  docker push "${REGISTRY}/${registry_name}:${VERSION}"
  docker push "${REGISTRY}/${registry_name}:latest"
}

echo "========================================"
echo "Starting full rebuild of all services..."
echo "========================================"

# 1. Build auth-service (includes new SecurityConfig.java)
echo ""
echo ">>> Building auth-service..."
cd microservices/auth-service
mvn clean package -DskipTests
docker build -t auth-service:latest .
tag_and_push auth-service auth-service
cd ../..

# 2. Build catalog-service
echo ""
echo ">>> Building catalog-service..."
cd microservices/catalog-service
mvn clean package -DskipTests
docker build -t catalog-service:latest .
tag_and_push catalog-service catalog-service
cd ../..

# 3. Build order-service
echo ""
echo ">>> Building order-service..."
cd microservices/order-service
mvn clean package -DskipTests
docker build -t order-service:latest .
tag_and_push order-service order-service
cd ../..

# 4. Build api-gateway
echo ""
echo ">>> Building api-gateway..."
cd microservices/api-gateway
mvn clean package -DskipTests
docker build -t api-gateway:latest .
tag_and_push api-gateway api-gateway
cd ../..

# 5. Build storefront (includes fixed server.ts)
echo ""
echo ">>> Building storefront..."
npm ci --include=optional --no-audit --no-fund
npm run build
docker build -t storefront:latest .
tag_and_push storefront aura-storefront

# 6. Apply k8s configs
echo ""
echo ">>> Applying Kubernetes manifests..."
kubectl apply -f k8s/postgres.yaml -n ${NAMESPACE}
kubectl apply -f k8s/redis.yaml -n ${NAMESPACE}
kubectl apply -f k8s/kafka.yaml -n ${NAMESPACE}
kubectl apply -f k8s/services.yaml -n ${NAMESPACE}
kubectl apply -f k8s/ingress.yaml -n ${NAMESPACE}

# 7. Restart deployments to pick up new images
echo ""
echo ">>> Restarting deployments..."
kubectl rollout restart deployment auth-service -n ${NAMESPACE}
kubectl rollout restart deployment catalog-service -n ${NAMESPACE}
kubectl rollout restart deployment order-service -n ${NAMESPACE}
kubectl rollout restart deployment api-gateway -n ${NAMESPACE}
kubectl rollout restart deployment storefront -n ${NAMESPACE}

# 8. Wait for rollouts
echo ""
echo ">>> Waiting for rollouts to complete..."
kubectl rollout status deployment auth-service -n ${NAMESPACE} --timeout=120s
kubectl rollout status deployment catalog-service -n ${NAMESPACE} --timeout=120s
kubectl rollout status deployment order-service -n ${NAMESPACE} --timeout=120s
kubectl rollout status deployment api-gateway -n ${NAMESPACE} --timeout=120s
kubectl rollout status deployment storefront -n ${NAMESPACE} --timeout=120s

echo ""
echo "========================================"
echo "Build and deploy complete!"
echo "========================================"
echo ""
echo "Check services:"
echo "  kubectl get pods -n ${NAMESPACE}"
echo "  kubectl logs -n ${NAMESPACE} -l app=auth-service --tail=30"
echo "  curl -s http://ecommerce.cris-atoms.local/api/auth/register -X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"name\":\"Test\",\"password\":\"pass123\",\"role\":\"CUSTOMER\"}'"
