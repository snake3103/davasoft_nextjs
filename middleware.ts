import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Coincide con todas las rutas excepto archivos estáticos y API interna
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
