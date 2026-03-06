"use client";

import { use, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EstimateForm } from "@/components/estimates/EstimateForm";
import { useEstimate, useUpdateEstimate } from "@/hooks/useDatabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditarCotizacionPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const { data: estimate, isLoading } = useEstimate(params.id);
    const updateEstimate = useUpdateEstimate();

    const handleSave = async (data: any) => {
        try {
            await updateEstimate.mutateAsync({ id: params.id, data });
            router.push("/cotizaciones");
        } catch (error: any) {
            console.error("Error updating estimate:", error);
            alert(error.message || "Error al actualizar la cotización");
        }
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            </AppLayout>
        );
    }

    if (!estimate) {
        return (
            <AppLayout>
                <div className="text-center py-20">
                    <h2 className="text-xl font-bold text-slate-700">Cotización no encontrada</h2>
                    <button
                        onClick={() => router.push("/cotizaciones")}
                        className="mt-4 text-primary font-bold hover:underline"
                    >
                        Volver a la lista
                    </button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <EstimateForm
                title="Editar Cotización"
                initialData={estimate}
                onSave={handleSave}
                isSubmitting={updateEstimate.isPending}
            />
        </AppLayout>
    );
}
