import type { FastifyRequest, FastifyReply } from "fastify";
import type { Role } from "@prisma/client";
import { verifyAccessToken } from "../lib/jwt.js";
import type { JwtPayload } from "../types/index.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    reply.code(401).send({ success: false, error: "Missing or invalid authorization header" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    request.user = verifyAccessToken(token);
  } catch {
    reply.code(401).send({ success: false, error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (!request.user || !roles.includes(request.user.role)) {
      reply.code(403).send({ success: false, error: "Insufficient permissions" });
    }
  };
}
