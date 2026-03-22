"use client";

import { use } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/inventory/ProductForm";
import { useProduct } from "@/hooks/useDatabase";
import { Loader2 } from "lucide-react";
import { updateProduct } from "@/app/actions/products";

export default function EditarProductoPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const { data: product, isLoading } = useProduct(params.id);

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            </AppLayout>
        );
    }

    if (!product) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-slate-700">Producto no encontrado</h2>
                        <a href="/inventario" className="text-primary hover:underline mt-2 inline-block">
                            Volver al inventario
                        </a>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const boundUpdateAction = updateProduct.bind(null, params.id);

    return (
        <AppLayout>
            <ProductForm
                title="Editar Producto"
                initialData={product}
                action={boundUpdateAction as any}
            />
        </AppLayout>
    );
}
