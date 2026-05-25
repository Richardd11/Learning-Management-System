import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyWebsocket from "@fastify/websocket";
import fastifyMultipart from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";

import { authRoutes } from "./modules/auth/index.js";
import { courseRoutes } from "./modules/courses/index.js";
import { enrollmentRoutes } from "./modules/enrollments/index.js";
import { userRoutes } from "./modules/users/index.js";
import { notificationRoutes } from "./modules/notifications/index.js";
import { adminRoutes } from "./modules/admin/index.js";
import { aiRoutes } from "./agents/index.js";
import { uploadRoutes } from "./modules/uploads.js";
import { websocketHandler } from "./modules/websocket.js";

const PORT = parseInt(process.env.PORT ?? "3001", 10);
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  // Plugins
  await app.register(cors, {
    origin: [CLIENT_URL, "http://localhost:5173"],
    credentials: true,
  });

  await app.register(fastifyCookie);
  await app.register(fastifyMultipart, { limits: { fileSize: 500 * 1024 * 1024 } });
  await app.register(fastifyWebsocket);

  await app.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "LMS API",
        description: "Learning Management System API Documentation",
        version: "1.0.0",
      },
      servers: [{ url: `http://localhost:${PORT}` }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
  });

  await app.register(fastifySwaggerUi, { routePrefix: "/docs" });

  // Routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(courseRoutes, { prefix: "/api/courses" });
  await app.register(enrollmentRoutes, { prefix: "/api/enrollments" });
  await app.register(userRoutes, { prefix: "/api/users" });
  await app.register(notificationRoutes, { prefix: "/api/notifications" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
  await app.register(aiRoutes, { prefix: "/api/ai" });
  await app.register(uploadRoutes, { prefix: "/api/uploads" });
  await app.register(websocketHandler);

  // Health check
  app.get("/api/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  return app;
}

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API docs at http://localhost:${PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
