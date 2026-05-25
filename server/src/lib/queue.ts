import { Queue, Worker, type Job } from "bullmq";
import { redis } from "./redis.js";

const connection = { host: redis.options.host ?? "localhost", port: redis.options.port ?? 6379 };

export const emailQueue = new Queue("email", { connection });
export const certificateQueue = new Queue("certificate", { connection });
export const notificationQueue = new Queue("notification", { connection });
export const aiQueue = new Queue("ai-tasks", { connection });

export function createWorker<T>(
  queueName: string,
  processor: (job: Job<T>) => Promise<void>
): Worker<T> {
  return new Worker<T>(queueName, processor, {
    connection,
    concurrency: 3,
  });
}
