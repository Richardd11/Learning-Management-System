import { Queue, Worker, type Job } from "bullmq";
import { redis } from "./redis.js";

// BullMQ needs a raw ioredis connection config, not the client instance.
// Pull host/port from the parsed REDIS_URL so it works whether redis is up or not.
const connection = { host: redis.options.host ?? "localhost", port: redis.options.port ?? 6379 };

// Lazy queue factory — returns null-safe wrappers when Redis isn't available.
function safeQueue(name: string) {
  try {
    const q = new Queue(name, { connection });
    q.on("error", () => {}); // suppress uncaught queue errors
    return q;
  } catch {
    return null;
  }
}

export const emailQueue = safeQueue("email");
export const certificateQueue = safeQueue("certificate");
export const notificationQueue = safeQueue("notification");
export const aiQueue = safeQueue("ai-tasks");

export function createWorker<T>(
  queueName: string,
  processor: (job: Job<T>) => Promise<void>
): Worker<T> | null {
  try {
    const w = new Worker<T>(queueName, processor, { connection, concurrency: 3 });
    w.on("error", () => {}); // suppress
    return w;
  } catch {
    return null;
  }
}
