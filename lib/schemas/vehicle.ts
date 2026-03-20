import { z } from "zod";

export const vehicleSchema = z.object({
  clientId: z.string().min(1, "El cliente es requerido"),
  brand: z.string().min(1, "La marca es requerida"),
  model: z.string().min(1, "El modelo es requerido"),
  year: z.number().int().min(1900).max(2100).optional(),
  color: z.string().optional().nullable(),
  plates: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  mileage: z.number().int().min(0),
  cameWithTow: z.boolean(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

export const workOrderItemSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  cost: z.number().min(0),
  completed: z.boolean(),
});

export const workOrderSchema = z.object({
  vehicleId: z.string().min(1, "El vehículo es requerido"),
  clientId: z.string().min(1, "El cliente es requerido"),
  number: z.string().optional(),
  entryDate: z.date().optional(),
  exitDate: z.date().optional().nullable(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "DELIVERED", "CANCELLED"]),
  fuelLevel: z.number().int().min(0).max(100),
  cameWithTow: z.boolean(),
  description: z.string().optional().nullable(),
  workItems: z.array(workOrderItemSchema).optional(),
  inventory: z.record(z.string(), z.boolean()).optional(),
  preExistingDamage: z.record(z.string(), z.boolean()).optional(),
  notes: z.string().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
});

export type WorkOrderFormData = z.infer<typeof workOrderSchema>;
export type WorkOrderItem = z.infer<typeof workOrderItemSchema>;