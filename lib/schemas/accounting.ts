import { z } from "zod";

// Schema para crear/editar una cuenta contable
export const accountingAccountSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  parentId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// Schema para línea de asiento (débito/crédito)
export const journalLineSchema = z.object({
  accountId: z.string().min(1, "La cuenta es requerida"),
  debit: z.coerce.number().min(0, "El débito no puede ser negativo").default(0),
  credit: z.coerce.number().min(0, "El crédito no puede ser negativo").default(0),
  description: z.string().optional().nullable(),
});

// Schema para asiento contable completo
export const journalEntrySchema = z.object({
  date: z.coerce.date(),
  description: z.string().min(1, "La descripción es requerida"),
  reference: z.string().optional().nullable(),
  lines: z.array(journalLineSchema)
    .min(2, "Un asiento debe tener al menos 2 líneas")
    .refine(
      (lines) => {
        const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
        // Permitir pequeña diferencia por redondeo
        return Math.abs(totalDebit - totalCredit) < 0.01;
      },
      { message: "Los débitos y créditos deben cuadrar" }
    ),
  status: z.enum(["DRAFT", "POSTED", "CANCELLED"]).default("POSTED"),
  sourceType: z.string().optional().nullable(),
  sourceId: z.string().optional().nullable(),
});

export type AccountingAccountFormData = z.infer<typeof accountingAccountSchema>;
export type JournalLineFormData = z.infer<typeof journalLineSchema>;
export type JournalEntryFormData = z.infer<typeof journalEntrySchema>;
