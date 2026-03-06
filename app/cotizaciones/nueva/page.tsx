"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { EstimateForm } from "@/components/estimates/EstimateForm";
import { useCreateEstimate } from "@/hooks/useDatabase";
import { useRouter } from "next/navigation";

export default function NuevaCotizacionPage() {
    const router = useRouter();
    const createEstimate = useCreateEstimate();

    const handleSave = async (data: any) => {
        try {
            await createEstimate.mutateAsync(data);
            router.push("/cotizaciones");
        } catch (error: any) {
            console.error("Error creating estimate:", error);
            alert(error.message || "Error al crear la cotización");
        }
    };

    return (
        <AppLayout>
            <EstimateForm
                title="Nueva Cotización"
                onSave={handleSave}
                isSubmitting={createEstimate.isPending}
            />
        </AppLayout>
    );
}
