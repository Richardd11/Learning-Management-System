import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times: number) {
    // Give up after 3 attempts — Redis is optional for local dev
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

let redisErrorLogged = false;
redis.on("error", (err) => {
  if (!redisErrorLogged) {
    console.warn("[Redis] Not available — queues/notifications disabled:", err.message);
    redisErrorLogged = true;
  }
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});
