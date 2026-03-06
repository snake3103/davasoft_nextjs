import type { NextAuthConfig } from "next-auth";
import { env } from "@/lib/env";

export const authConfig: NextAuthConfig = {
  secret: env.AUTH_SECRET,
  trustHost: true,
  providers: [], // Providers are added in the main auth.ts
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login");
      const isDashboardPage = 
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/dashboard") || 
        nextUrl.pathname.startsWith("/ventas") ||
        nextUrl.pathname.startsWith("/gastos") ||
        nextUrl.pathname.startsWith("/bancos") ||
        nextUrl.pathname.startsWith("/contactos") ||
        nextUrl.pathname.startsWith("/inventario");

      if (isDashboardPage) {
        if (isLoggedIn) return true;
        return false; 
      }

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      
      return true;
    },
  },
} satisfies NextAuthConfig;
