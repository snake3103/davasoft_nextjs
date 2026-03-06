import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const passwordsMatch = bcrypt.compareSync(credentials.password as string, user.password);

        if (passwordsMatch) return user;
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Si tenemos un usuario pero no la organización, la buscamos (útil para sesiones existentes)
      if (token.id && !token.organizationId) {
        const membership = await prisma.membership.findFirst({
          where: { userId: token.id as string },
          orderBy: { createdAt: "asc" },
        });
        
        if (membership) {
          token.organizationId = membership.organizationId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.organizationId = (token.organizationId as string) ?? null;
        session.user.role = (token.role as any) ?? "USER";
      }
      return session;
    },
  },
});

