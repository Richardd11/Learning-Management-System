import type { FastifyInstance } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import { verifyAccessToken } from "../lib/jwt.js";

const connectedClients = new Map<string, Set<WebSocket>>();

export async function websocketHandler(app: FastifyInstance): Promise<void> {
  app.get("/ws", { websocket: true }, (socket, request) => {
    const token = (request.query as Record<string, string>).token;
    if (!token) {
      socket.close(4001, "Missing token");
      return;
    }

    let userId: string;
    try {
      const payload = verifyAccessToken(token);
      userId = payload.userId;
    } catch {
      socket.close(4001, "Invalid token");
      return;
    }

    if (!connectedClients.has(userId)) {
      connectedClients.set(userId, new Set());
    }
    connectedClients.get(userId)!.add(socket);

    socket.on("message", (data: Buffer | string) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "ping") {
          socket.send(JSON.stringify({ type: "pong" }));
        }
      } catch {
        // ignore malformed messages
      }
    });

    socket.on("close", () => {
      const clients = connectedClients.get(userId);
      if (clients) {
        clients.delete(socket);
        if (clients.size === 0) connectedClients.delete(userId);
      }
    });
  });
}

export function sendToUser(userId: string, data: Record<string, unknown>): void {
  const clients = connectedClients.get(userId);
  if (!clients) return;

  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

export function broadcastToAll(data: Record<string, unknown>): void {
  const message = JSON.stringify(data);
  for (const clients of connectedClients.values()) {
    for (const client of clients) {
      if (client.readyState === 1) {
        client.send(message);
      }
    }
  }
}
