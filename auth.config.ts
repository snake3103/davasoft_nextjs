import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
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
        nextUrl.pathname.startsWith("/dashboard") || 
        nextUrl.pathname.startsWith("/ventas") ||
        nextUrl.pathname.startsWith("/gastos") ||
        nextUrl.pathname.startsWith("/bancos");

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
