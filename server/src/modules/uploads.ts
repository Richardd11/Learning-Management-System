import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.js";
import { uploadFile, getPresignedUrl } from "../lib/s3.js";
import { randomUUID } from "crypto";

export async function uploadRoutes(app: FastifyInstance): Promise<void> {
  app.post("/", { preHandler: [authenticate] }, async (request, reply) => {
    const file = await request.file();
    if (!file) {
      reply.code(400).send({ success: false, error: "No file provided" });
      return;
    }

    const ext = file.filename.split(".").pop() ?? "bin";
    const key = `uploads/${request.user!.userId}/${randomUUID()}.${ext}`;
    const chunks: Buffer[] = [];

    for await (const chunk of file.file) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const url = await uploadFile(key, buffer, file.mimetype);

    reply.send({ success: true, data: { url, key } });
  });

  app.get("/presigned/:key", { preHandler: [authenticate] }, async (request, reply) => {
    const { key } = request.params as { key: string };
    const url = await getPresignedUrl(key);
    reply.send({ success: true, data: { url } });
  });
}
