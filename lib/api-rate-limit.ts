import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function rateLimitMiddleware(
  request: NextRequest,
  limitType: "api" | "auth" | "write" = "api"
) {
  const ip = request.headers.get("x-forwarded-for") || 
              request.headers.get("x-real-ip") || 
              "anonymous";
  
  const { success, remaining, reset } = await checkRateLimit(ip, limitType);
  
  if (!success) {
    return new NextResponse(
      JSON.stringify({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: reset,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": "0",
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  return response;
}