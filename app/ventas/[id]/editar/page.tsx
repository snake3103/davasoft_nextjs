"use client";

import { use } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import InvoiceForm from "@/components/forms/InvoiceForm";
import { useInvoices } from "@/hooks/useDatabase";
import { useParams } from "next/navigation";
import { updateInvoice } from "@/app/actions/invoices";

export default function EditarFacturaPage() {
    const params = useParams();
    const id = params?.id as string;
    const { data: invoices, isLoading } = useInvoices();

    const invoice = invoices?.find((i: any) => i.id === id);

    // Vinculamos el ID a la acción de actualización
    const updateInvoiceWithId = updateInvoice.bind(null, id);

    if (isLoading) return <AppLayout><div className="p-20 text-center">Cargando...</div></AppLayout>;
    if (!invoice) return <AppLayout><div className="p-20 text-center text-rose-500 font-bold">Factura no encontrada</div></AppLayout>;

    return (
        <AppLayout>
            <InvoiceForm
                initialData={invoice}
                action={updateInvoiceWithId}
            />
        </AppLayout>
    );
}
