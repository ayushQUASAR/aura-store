# Multi-Stage Build: Stage 1 - Build the React + Express storefront application
FROM node:26-bookworm AS builder
WORKDIR /app

# Copy dependency configuration
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --include=optional --no-audit --no-fund
RUN npm rebuild @tailwindcss/oxide

# Copy the rest of the application code
COPY . .

# Build the storefront static files and compile server.ts to dist/server.cjs
RUN npm run build

# Stage 2: Minimalist Production Image
FROM node:26-bookworm-slim
WORKDIR /app

# Copy dependency configuration
COPY package.json package-lock.json ./

# Install only production dependencies for a slim, secure footprint
RUN npm ci --omit=dev --no-audit --no-fund

# Copy the built production assets from Stage 1
COPY --from=builder /app/dist ./dist

# Expose the designated ingress port for the storefront
EXPOSE 3000

# Start the full-stack server
CMD ["npm", "start"]
