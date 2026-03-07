import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EditRoleForm } from "./EditRoleForm";

export default async function EditarRolPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.organizationId) {
        redirect("/login");
    }

    // @ts-ignore - Prisma types cache may be stale
    const role = await (prisma as any).role.findUnique({
        where: { id },
    });

    if (!role || role.organizationId !== session.user.organizationId) {
        redirect("/configuracion/roles");
    }

    return (
        <EditRoleForm
            role={{
                id: role.id,
                name: role.name,
                description: role.description || "",
                permissions: role.permissions || [],
            }}
        />
    );
}
