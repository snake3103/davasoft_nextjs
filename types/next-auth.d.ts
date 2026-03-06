import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      organizationId: string | null;
      role: "ADMIN" | "CONTADOR" | "VENDEDOR" | "USER";
    };
  }

  interface User {
    id: string;
    role: "ADMIN" | "CONTADOR" | "VENDEDOR" | "USER";
    organizationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    organizationId?: string | null;
    role?: string;
  }
}
