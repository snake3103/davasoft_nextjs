"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/inventory/ProductForm";
import { createProduct } from "@/app/actions/products";

export default function NuevoProductoPage() {
    return (
        <AppLayout>
            <ProductForm
                title="Agregar Nuevo Producto"
                action={createProduct}
            />
        </AppLayout>
    );
}
