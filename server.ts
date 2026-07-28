import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Gateway URL — configured via env or default to Docker Compose service name
  const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://api-gateway:8080";

  app.use(express.json());

  // ============ API Proxy Middleware ============
  // Proxy /api/* requests to the Spring Cloud API Gateway.
  // In K8s this is handled by NGINX ingress; in Docker Compose or standalone
  // deployments, we add a reverse proxy here so the frontend can talk to the gateway.
  app.use("/api", (req, res) => {
    const targetUrl = `${API_GATEWAY_URL}${req.originalUrl}`;
    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers: {
          ...req.headers,
          host: new URL(API_GATEWAY_URL).host,
        },
      },
      (proxyRes) => {
        // Forward status and headers
        res.status(proxyRes.statusCode || 500);
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          if (value) res.setHeader(key, Array.isArray(value) ? value.join(", ") : value);
        }
        // Pipe the response body
        proxyRes.pipe(res);
      }
    );

    proxyReq.on("error", (err) => {
      console.error(`Proxy error for ${req.originalUrl}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: "Bad Gateway", message: err.message });
      }
    });

    // Forward the request body if present
    if (req.body && Object.keys(req.body).length > 0) {
      proxyReq.write(JSON.stringify(req.body));
    } else if (req.readable) {
      req.pipe(proxyReq);
    }
    proxyReq.end();
  });

  if (process.env.NODE_ENV !== "production") {
    // === DEVELOPMENT MODE ===
    // Serve via Vite dev server with HMR
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);

    console.log(`Storefront running in DEV mode on http://0.0.0.0:${PORT}`);
    console.log(`API proxy target: ${API_GATEWAY_URL}`);

  } else {
    // === PRODUCTION MODE ===
    // Serve static frontend files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // SPA fallback: all non-API routes serve index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    console.log(`Storefront running in PRODUCTION mode on http://0.0.0.0:${PORT}`);
    console.log(`Static files served from: ${distPath}`);
    console.log(`API proxy target: ${API_GATEWAY_URL}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Storefront server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
