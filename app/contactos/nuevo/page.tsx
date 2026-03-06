"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { createClient } from "@/app/actions/clients";

export default function NuevoCliente() {
    return (
        <AppLayout>
            <ContactForm
                title="Crear Nuevo Contacto"
                action={createClient}
            />
        </AppLayout>
    );
}
