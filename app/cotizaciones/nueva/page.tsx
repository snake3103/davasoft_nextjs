"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { EstimateForm } from "@/components/estimates/EstimateForm";
import { createEstimate } from "@/app/actions/estimates";

export default function NuevaCotizacionPage() {
    return (
        <AppLayout>
            <EstimateForm
                title="Crear Nueva Cotización"
                action={createEstimate}
            />
        </AppLayout>
    );
}
