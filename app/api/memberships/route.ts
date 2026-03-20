import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const inviteUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  systemRole: z.enum(["ADMIN", "CONTADOR", "VENDEDOR", "USER"]).default("USER"),
  password: z.string().min(6).optional(),
  createAccount: z.boolean().default(false),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.user.organizationId;

    const members = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, createdAt: true },
        },
        role: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Error fetching members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, name, systemRole, password, createAccount } = inviteUserSchema.parse(body);

    const orgId = session.user.organizationId;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create them
    if (!user) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });
    } else if (createAccount && password) {
      // If user exists but we want to set a password
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        organizationId: orgId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "El usuario ya es miembro de esta organización" },
        { status: 400 }
      );
    }

    // Create membership
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: orgId,
        systemRole: systemRole as any,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(membership);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error inviting user:", error);
    return NextResponse.json({ error: "Error inviting user" }, { status: 500 });
  }
}
