"use client";

import { use } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useClient } from "@/hooks/useDatabase";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { updateClient } from "@/app/actions/clients";

export default function EditarContactoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: contact, isLoading, error } = useClient(id);

    // Vinculamos el ID a la acción de actualización
    const updateClientWithId = updateClient.bind(null, id);

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Cargando información del contacto...</p>
                </div>
            </AppLayout>
        );
    }

    if (error || !contact) {
        return (
            <AppLayout>
                <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl border border-border text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Error al cargar el contacto</h2>
                    <p className="text-slate-500">No pudimos encontrar el contacto que intentas editar o hubo un problema de conexión.</p>
                    <button
                        onClick={() => router.push("/contactos")}
                        className="px-6 py-2 bg-slate-100 h-10 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
                    >
                        Volver a contactos
                    </button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <ContactForm
                title="Editar Contacto"
                initialData={contact}
                action={updateClientWithId}
            />
        </AppLayout>
    );
}
