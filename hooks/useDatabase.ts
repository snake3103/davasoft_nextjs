import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- HOOKS PARA IMPUESTOS ---
export function useTaxes() {
  return useQuery({
    queryKey: ["taxes"],
    queryFn: async () => {
      const res = await fetch("/api/taxes");
      if (!res.ok) throw new Error("Error fetching taxes");
      return res.json();
    },
  });
}

// --- HOOKS PARA CLIENTES ---
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Error fetching clients");
      return res.json();
    },
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error("Error fetching client");
      return res.json();
    },
    enabled: !!id,
  });
}

// --- HOOKS PARA PRODUCTOS ---
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error fetching products");
      return res.json();
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Error fetching product");
      return res.json();
    },
    enabled: !!id,
  });
}

// --- HOOKS PARA ALERTAS DE STOCK BAJO ---
export function useLowStockAlerts() {
  return useQuery({
    queryKey: ["lowStockAlerts"],
    queryFn: async () => {
      const res = await fetch("/api/products/low-stock");
      if (!res.ok) throw new Error("Error fetching low stock alerts");
      return res.json();
    },
    refetchInterval: 60000, // Refrescar cada minuto
  });
}

export function useLowStockCount() {
  const { data } = useLowStockAlerts();
  return data?.length || 0;
}

// Mutation para actualizar configuración de alerta
export function useUpdateProductAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      productId: string;
      minQuantity: number;
      warehouseId?: string;
      isActive?: boolean;
    }) => {
      const res = await fetch(`/api/products/low-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error updating alert");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lowStockAlerts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// --- HOOKS PARA FACTURAS ---
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Error fetching invoices");
      return res.json();
    },
  });
}

// --- HOOKS PARA GASTOS ---
export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch("/api/expenses");
      if (!res.ok) throw new Error("Error fetching expenses");
      return res.json();
    },
  });
}

// --- HOOKS PARA COTIZACIONES ---
export function useEstimates() {
  return useQuery({
    queryKey: ["estimates"],
    queryFn: async () => {
      const res = await fetch("/api/estimates");
      if (!res.ok) throw new Error("Error fetching estimates");
      return res.json();
    },
  });
}

export function useEstimate(id: string) {
  return useQuery({
    queryKey: ["estimates", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/estimates/${id}`);
      if (!res.ok) throw new Error("Error fetching estimate");
      return res.json();
    },
    enabled: !!id,
  });
}

// --- HOOKS PARA DASHBOARD ---
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Error fetching stats");
      return res.json();
    },
  });
}

// --- MUTATIONS ---
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/invoices", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error creating invoice");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error updating invoice");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error deleting invoice");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// --- MUTATIONS ---
export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error updating client");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error deleting client");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/estimates", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error creating estimate");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });
}

export function useUpdateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/estimates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error updating estimate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });
}

export function useDeleteEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/estimates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error deleting estimate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });
}

export function useConvertToInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/estimates/${id}/invoice`, {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error converting to invoice");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
// --- HOOKS PARA CATEGORIAS ---
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Error fetching categories");
      return res.json();
    },
  });
}

// --- HOOKS PARA INGRESOS ---
export function useIncomes() {
  return useQuery({
    queryKey: ["incomes"],
    queryFn: async () => {
      const res = await fetch("/api/incomes");
      if (!res.ok) throw new Error("Error fetching incomes");
      return res.json();
    },
  });
}

export function useIncome(id: string) {
  return useQuery({
    queryKey: ["incomes", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/incomes/${id}`);
      if (!res.ok) throw new Error("Error fetching income");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/incomes", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error creating income");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/incomes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error updating income");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/incomes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error deleting income");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ... existing code ...
export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error creating expense");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Inventory might change
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// --- HOOKS PARA CUENTAS BANCARIAS ---
export function useBankAccounts() {
  return useQuery({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      const res = await fetch("/api/bank-accounts");
      if (!res.ok) throw new Error("Error fetching bank accounts");
      return res.json();
    },
  });
}

export function useBankAccount(id: string) {
  return useQuery({
    queryKey: ["bankAccounts", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/bank-accounts/${id}`);
      if (!res.ok) throw new Error("Error fetching bank account");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/bank-accounts", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error creating bank account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/bank-accounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error updating bank account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bank-accounts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error deleting bank account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error updating expense");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error deleting expense");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// --- HOOKS PARA COMPRAS ---
export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const res = await fetch("/api/purchases");
      if (!res.ok) throw new Error("Error fetching purchases");
      return res.json();
    },
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ["purchases", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/purchases/${id}`);
      if (!res.ok) throw new Error("Error fetching purchase");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/purchases", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error creating purchase");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error updating purchase");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error deleting purchase");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// --- HOOKS PARA VEHÍCULOS ---
export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Error fetching vehicles");
      return res.json();
    },
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/vehicles/${id}`);
      if (!res.ok) throw new Error("Error fetching vehicle");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error creating vehicle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error updating vehicle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error deleting vehicle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

// --- HOOKS PARA ÓRDENES DE SERVICIO ---
export function useWorkOrders() {
  return useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const res = await fetch("/api/work-orders");
      if (!res.ok) throw new Error("Error fetching work orders");
      return res.json();
    },
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ["workOrders", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/work-orders/${id}`);
      if (!res.ok) throw new Error("Error fetching work order");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error creating work order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/work-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error updating work order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/work-orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error updating status");
      return res.json();
    },
    onSuccess: () => {
      // Invalidar tanto la lista como el kanban
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrdersKanban"] });
      // También invalidar por tipo de query
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && key.includes('workOrders');
      }});
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/work-orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error deleting work order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}

// --- HOOKS PARA BODEGAS / WAREHOUSES ---
export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/warehouses");
      if (!res.ok) throw new Error("Error fetching warehouses");
      return res.json();
    },
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: ["warehouses", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/warehouses/${id}`);
      if (!res.ok) throw new Error("Error fetching warehouse");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error creating warehouse");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/warehouses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error updating warehouse");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/warehouses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error deleting warehouse");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}

// --- HOOKS PARA TRANSFERENCIAS DE INVENTARIO ---
export function useTransferInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      productId: string;
      fromWarehouseId: string;
      toWarehouseId: string;
      quantity: number;
      notes?: string;
    }) => {
      const res = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error transferring inventory");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useWarehouseInventory(warehouseId?: string) {
  return useQuery({
    queryKey: ["warehouseInventory", warehouseId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouseId", warehouseId);
      const res = await fetch(`/api/inventory/warehouse?${params}`);
      if (!res.ok) throw new Error("Error fetching warehouse inventory");
      return res.json();
    },
    enabled: true,
  });
}

export function useProductWarehouseStock(productId: string) {
  return useQuery({
    queryKey: ["productWarehouseStock", productId],
    queryFn: async () => {
      if (!productId) return null;
      const res = await fetch(`/api/inventory/transfer?productId=${productId}`);
      if (!res.ok) throw new Error("Error fetching product stock");
      return res.json();
    },
    enabled: !!productId,
  });
}

// --- HOOKS PARA DATOS FISCALES DE CLIENTES ---
export function useClientFiscalData(clientId: string) {
  return useQuery({
    queryKey: ["clientFiscalData", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const res = await fetch(`/api/clients/fiscal?clientId=${clientId}`);
      if (!res.ok) throw new Error("Error fetching fiscal data");
      return res.json();
    },
    enabled: !!clientId,
  });
}

export function useSaveClientFiscalData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      taxId?: string;
      fiscalRegime?: string;
      contributorType?: string;
      addressFiscal?: string;
      phoneFiscal?: string;
      emailBilling?: string;
      dgiiStatus?: string;
      agentRetention?: boolean;
      agentPerception?: boolean;
    }) => {
      const res = await fetch("/api/clients/fiscal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error saving fiscal data");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clientFiscalData", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
    },
  });
}

export function useDeleteClientFiscalData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      const res = await fetch(`/api/clients/fiscal?clientId=${clientId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error deleting fiscal data");
      }
      return res.json();
    },
    onSuccess: (_, clientId) => {
      queryClient.invalidateQueries({ queryKey: ["clientFiscalData", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients", clientId] });
    },
  });
}

// --- HOOKS PARA CENTROS DE COSTO ---
export function useCostCenters() {
  return useQuery({
    queryKey: ["costCenters"],
    queryFn: async () => {
      const res = await fetch("/api/cost-centers");
      if (!res.ok) throw new Error("Error fetching cost centers");
      return res.json();
    },
  });
}

export function useCostCenter(id: string) {
  return useQuery({
    queryKey: ["costCenters", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/cost-centers/${id}`);
      if (!res.ok) throw new Error("Error fetching cost center");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      code: string;
      name: string;
      description?: string;
      isActive?: boolean;
    }) => {
      const res = await fetch("/api/cost-centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error creating cost center");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
    },
  });
}

export function useUpdateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/cost-centers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error updating cost center");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
    },
  });
}

export function useDeleteCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cost-centers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error deleting cost center");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
    },
  });
}
