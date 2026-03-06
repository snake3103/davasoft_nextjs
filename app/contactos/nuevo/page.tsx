"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useCreateClient } from "@/hooks/useDatabase";
import { useRouter } from "next/navigation";

export default function NuevoCliente() {
    const router = useRouter();
    const createClient = useCreateClient();

    const handleSave = async (data: any) => {
        try {
            await createClient.mutateAsync(data);
            router.push("/contactos");
        } catch (error: any) {
            alert("Error al guardar el contacto: " + error.message);
        }
    };

    return (
        <AppLayout>
            <ContactForm
                title="Crear Nuevo Contacto"
                onSave={handleSave}
                isLoading={createClient.isPending}
            />
        </AppLayout>
    );
}
