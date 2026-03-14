import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export const rateLimit = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "10 s"),
    prefix: "ratelimit:api",
  }),

  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "ratelimit:auth",
  }),

  write: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "ratelimit:write",
  }),
};

export async function checkRateLimit(
  identifier: string,
  limitType: "api" | "auth" | "write" = "api"
) {
  const result = await rateLimit[limitType].limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}