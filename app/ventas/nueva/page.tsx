"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import InvoiceForm from "@/components/forms/InvoiceForm";
import { createInvoice } from "@/app/actions/invoices";

export default function NuevaFacturaPage() {
    return (
        <AppLayout>
            <InvoiceForm action={createInvoice} />
        </AppLayout>
    );
}
