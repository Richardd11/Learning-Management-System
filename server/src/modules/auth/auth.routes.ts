import type { FastifyInstance } from "fastify";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";
import { authenticate } from "../../middleware/auth.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    try {
      const { user, tokens } = await authService.register(body);
      reply.code(201).send({
        success: true,
        data: { user: authService.sanitizeUser(user), tokens },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      reply.code(400).send({ success: false, error: message });
    }
  });

  app.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    try {
      const { user, tokens } = await authService.login(body);
      reply.send({
        success: true,
        data: { user: authService.sanitizeUser(user), tokens },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      reply.code(401).send({ success: false, error: message });
    }
  });

  app.post("/refresh", async (request, reply) => {
    const { refreshToken } = refreshTokenSchema.parse(request.body);
    try {
      const tokens = await authService.refreshTokens(refreshToken);
      reply.send({ success: true, data: { tokens } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Token refresh failed";
      reply.code(401).send({ success: false, error: message });
    }
  });

  app.post("/logout", { preHandler: [authenticate] }, async (request, reply) => {
    if (!request.user) {
      reply.code(401).send({ success: false, error: "Not authenticated" });
      return;
    }
    await authService.logout(request.user.userId);
    reply.send({ success: true, message: "Logged out" });
  });

  app.get("/me", { preHandler: [authenticate] }, async (request, reply) => {
    if (!request.user) {
      reply.code(401).send({ success: false, error: "Not authenticated" });
      return;
    }
    const { prisma } = await import("../../lib/prisma.js");
    const user = await prisma.user.findUnique({ where: { id: request.user.userId } });
    if (!user) {
      reply.code(404).send({ success: false, error: "User not found" });
      return;
    }
    reply.send({ success: true, data: { user: authService.sanitizeUser(user) } });
  });
}
