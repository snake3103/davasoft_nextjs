const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_n3Ff4qRjklXv@ep-empty-thunder-aiubr5ge-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
      }
    }
  });

  try {
    console.log("Checking DB directly...");
    const user = await prisma.user.findFirst({
      where: { email: "admin@davasoft.com" },
      include: { memberships: true }
    });

    if (!user) {
      console.log("User admin@davasoft.com not found.");
      return;
    }

    console.log("User found:", user.email, "Role:", user.role);
    console.log("Memberships count:", user.memberships.length);
    
    if (user.memberships.length === 0) {
      console.log("Creating membership for admin user...");
      const org = await prisma.organization.findFirst();
      if (org) {
        await prisma.membership.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            role: "ADMIN"
          }
        });
        console.log("✅ Membership created successfully for org:", org.name);
      } else {
        console.log("❌ No organizations found to link user to.");
      }
    } else {
      console.log("User already has memberships.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
