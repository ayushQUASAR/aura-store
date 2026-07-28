# Rebuild Images & Deploy to Minikube + Test All APIs

## Status Legend
- [ ] Pending
- [x] Completed
- [~] In Progress

## Plan

### Phase 1: Configure Docker Environment for Minikube
- [x] Step 1: Point Docker to minikube's Docker daemon
- [x] Step 2: Verify Docker can see minikube's images

### Phase 2: Rebuild All Docker Images (in minikube's Docker daemon)
- [ ] Step 3: Build `auth-service:latest`
- [ ] Step 4: Build `catalog-service:latest`
- [ ] Step 5: Build `order-service:latest`
- [ ] Step 6: Build `api-gateway:latest`
- [ ] Step 7: Build `storefront:latest`

### Phase 3: Restart K8s Deployments
- [ ] Step 8: Restart all deployments to pick up fresh images
- [ ] Step 9: Wait for all pods to become Ready

### Phase 4: Test All API Endpoints
- [ ] Step 10: Test POST /api/auth/register - Register new user
- [ ] Step 11: Test POST /api/auth/login - Login with credentials
- [ ] Step 12: Test POST /api/auth/demo - Demo login (ADMIN & CUSTOMER)
- [ ] Step 13: Test GET /api/catalog/products - List products (public)
- [ ] Step 14: Test GET /api/catalog/categories - Get categories
- [ ] Step 15: Test POST /api/catalog/products - Create product (ADMIN)
- [ ] Step 16: Test GET /api/catalog/products/{id} - Get product by ID
- [ ] Step 17: Test PUT /api/catalog/products/{id} - Update product
- [ ] Step 18: Test DELETE /api/catalog/products/{id} - Delete product
- [ ] Step 19: Test POST /api/orders - Create order
- [ ] Step 20: Test GET /api/orders - List orders
- [ ] Step 21: Test PUT /api/orders/{id}/status - Update order status

### Phase 5: Verify Storefront
- [ ] Step 22: Test storefront serves index.html

