"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import InvoiceForm from "@/components/forms/InvoiceForm";
import { useInvoices } from "@/hooks/useDatabase";
import { useParams } from "next/navigation";

export default function EditarFacturaPage() {
    const { id } = useParams();
    const { data: invoices, isLoading } = useInvoices();

    const invoice = invoices?.find((i: any) => i.id === id);

    if (isLoading) return <AppLayout><div>Cargando...</div></AppLayout>;
    if (!invoice) return <AppLayout><div>Factura no encontrada</div></AppLayout>;

    return (
        <AppLayout>
            <InvoiceForm initialData={invoice} />
        </AppLayout>
    );
}
