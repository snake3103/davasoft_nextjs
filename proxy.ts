import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Usamos authConfig que es ligero y no tiene Prisma para el Edge
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};