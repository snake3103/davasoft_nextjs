import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@davasoft.com" },
      include: { 
        memberships: {
          include: {
            organization: true
          }
        }
      }
    });

    console.log("--- ADMIN USER DATA ---");
    if (user) {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Memberships: ${user.memberships.length}`);
      user.memberships.forEach((m, i) => {
        console.log(`  ${i+1}. Organization: ${m.organization.name} (ID: ${m.organizationId})`);
      });
    } else {
      console.log("User admin@davasoft.com not found");
    }

    const totalOrgs = await prisma.organization.count();
    console.log(`Total Organizations in DB: ${totalOrgs}`);

    if (totalOrgs > 0 && user && user.memberships.length === 0) {
      console.log("WARNING: Admin user has NO memberships!");
    }

  } catch (error) {
    console.error("Error checking DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
