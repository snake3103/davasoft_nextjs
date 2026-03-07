import { PrismaClient } from "@prisma/client";

// No importamos lib/prisma para evitar problemas de aliases
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking database for admin@davasoft.com...");
    
    const user = await prisma.user.findFirst({
      where: { email: "admin@davasoft.com" },
      include: {
        memberships: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user) {
      console.log("❌ USER NOT FOUND");
      return;
    }

    console.log(`✅ USER FOUND: ${user.id} (${user.email})`);
    console.log(`Role: ${user.role}`);
    
    if (user.memberships.length === 0) {
      console.log("❌ NO MEMBERSHIPS FOUND for this user.");
      
      // Intentar ver si hay alguna organización en la DB para crearle una
      const org = await prisma.organization.findFirst();
      if (org) {
        console.log(`Found existing organization: ${org.name} (${org.id})`);
        console.log(`Suggestion: Create a membership for user ${user.id} in org ${org.id}`);
      } else {
        console.log("❌ NO ORGANIZATIONS FOUND in DB at all.");
      }
    } else {
      user.memberships.forEach((m, i) => {
        console.log(`⭐ Membership ${i + 1}: Org "${m.organization.name}" (ID: ${m.organizationId}) - Role: ${m.systemRole}`);
      });
    }

  } catch (err: any) {
    console.error("❌ ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
