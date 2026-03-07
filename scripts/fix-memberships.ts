import prisma from "../lib/prisma";

async function fixMemberships() {
  const result = await (prisma as any).membership.updateMany({
    data: { systemRole: "ADMIN" },
  });
  console.log(`✅ Updated ${result.count} memberships to systemRole: ADMIN`);
  
  const memberships = await prisma.membership.findMany({
    include: { user: { select: { email: true, name: true } } }
  });
  memberships.forEach((m: any) => {
    console.log(`  - User: ${m.user?.email} | systemRole: ${m.systemRole} | orgId: ${m.organizationId}`);
  });
}

fixMemberships().catch(console.error).finally(() => process.exit(0));
