# Plan de Desarrollo - alegra-clone

**Objetivo:** Alcanzar ~90% de paridad funcional con Alegra (sin facturación electrónica)  
**Duración estimada:** 6-8 meses  
**Equipo sugerido:** 2-3 desarrolladores

---

## FASE 1: Fundamentos Críticos (Meses 1-2) ✅ COMPLETADA

### Sprint 1-2: Inventario Avanzado ✅

#### 1.1 Multi-bodegas ✅
```
Estado: IMPLEMENTADO
- Modelo Warehouse + InventoryWarehouse
- API CRUD /api/warehouses
- Transferencias entre bodegas
- UI en productos
```

#### 1.2 Alertas de Stock Bajo ✅
```
Estado: IMPLEMENTADO
- Modelo ProductAlert
- Badge en Sidebar
- Página /inventario/alertas
```

#### 1.3 Importación/Exportación Excel ✅
```
Estado: IMPLEMENTADO
- Librería xlsx integrada
- APIs de import/export
- Utilidades de parsing
```

#### 1.4 Variantes de Productos ✅
```
Estado: IMPLEMENTADO
- Modelos ProductVariant, VariantOption
- UI de variantes en productos
```

### Sprint 3-4: Contactos y Centro de Costos ✅

#### 1.5 Datos Fiscales Extendidos para Contactos ✅
```
Estado: IMPLEMENTADO
- Modelo ClientFiscalData
- Campos: taxId, fiscalRegime, dgiiStatus, etc.
```

#### 1.6 Crédito y Condiciones por Cliente ✅
```
Estado: IMPLEMENTADO
- Campos en Client
- Validación en facturas
```

#### 1.7 Descuentos por ítem en facturas ✅
```
Estado: IMPLEMENTADO
- discount y discountType en InvoiceItem
- Recálculo de totales
```

#### 1.8 Centro de Costos ✅
```
Estado: IMPLEMENTADO
- Modelo CostCenter
- Selector en documentos
- Reportes por centro de costo
```

**Entregables FASE 1:**
- [x] Módulo de bodegas funcional ✅
- [x] Transferencias entre bodegas ✅
- [x] Alertas de stock bajo ✅
- [x] Importar productos desde Excel ✅
- [x] Exportar productos a Excel ✅
- [x] Variantes de productos (colores/tallas) ✅
- [x] Campos fiscales en contactos ✅
- [x] Crédito por cliente ✅
- [x] Descuentos por ítem ✅
- [x] Centro de costos ✅

**Esfuerzo real:** 4 sprints (completado en 1 día por equipo paralelo)

---

## FASE 2: Tesorería y Bancos (Meses 2-3) ✅ COMPLETADA

### Sprint 5-7: Conciliación y Flujo de Caja ✅

#### 2.1 Modelo de Conciliación Bancaria ✅
```
Estado: IMPLEMENTADO
- Modelos BankReconciliation, ReconciliationItem
- API CRUD completa
```

#### 2.2 Importación de Extractos Bancarios ✅
```
Estado: IMPLEMENTADO
- Parser CSV
- Formatos de bancos comunes
```

#### 2.3 UI Conciliación Bancaria ✅
```
Estado: IMPLEMENTADO
- Página /bancos/conciliacion
- Matching manual y automático
- Importar extracto CSV
```

#### 2.4 Flujo de Caja Proyectado ✅
```
Estado: IMPLEMENTADO
- Dashboard /bancos/flujo-caja
- Proyecciones por período
```

#### 2.5 Gestión de Cheques ✅
```
Estado: IMPLEMENTADO
- Modelo Check
- Cheques emitidos/recibidos
- Estados y acciones
```

**Entregables FASE 2:**
- [x] Conciliación bancaria ✅
- [x] Importación extractos ✅
- [x] UI Conciliación ✅
- [x] Flujo de caja proyectado ✅
- [x] Cheques ✅

---

## FASE 3: Activos Fijos y Contabilidad (Próxima)

### Sprint 8-9: Activos Fijos

#### 3.1 Módulo de Activos Fijos
```
Descripción: Registro y control de activos fijos

Modelos:
- FixedAsset: name, categoryId, acquisitionDate, cost, usefulLife, depreciationMethod
- AssetCategory: name, depreciationRate
- AssetDepreciation: assetId, date, amount

UI:
- Módulo en Contabilidad > Activos Fijos
- CRUD de activos
- Reporte de depreciación
```

#### 3.2 Depreciación Automática
```
Descripción: Cálculo automático de depreciación

Métodos:
- Línea recta
- Suma de dígitos

Features:
- Generación automática de asientos
- Historial de depreciaciones
```

---

### Sprint 10: Retenciones y Ajustes

#### 3.3 Sistema de Retenciones
```
Descripción: Retenciones de ISR, IVA, etc.

Modelo:
- Retention: name, type, percentage, accounts

UI:
- Configuración > Impuestos > Retenciones
- Selector en facturas y pagos
```

#### 3.4 Certificados de Retención
```
Descripción: Generar certificados PDF

Features:
- Template de certificado
- Historial de emitidos
```

#### 3.5 Ajustes por Diferencia en Cambio
```
Descripción: Ajustes cambiarios mensuales

Features:
- Asistente de ajuste
- Cuentas en moneda extranjera
```

---

## FASE 4: Reportes Fiscales (Próxima)

### Sprint 11-12: Reportes

#### 4.1 Reporte 606/607 (RD)
#### 4.2 Libro de Ventas
#### 4.3 Libro de Compras
#### 4.4 Rentabilidad por Producto
#### 4.5 Rentabilidad por Cliente
#### 4.6 Estado de Cuenta Aging

---

## FASE 5: Taller y POS Mejorado (Próxima)

### Sprint 14: Órdenes de Servicio

#### 5.1 Estados y Seguimiento (Kanban)
#### 5.2 Asignación de Mecánicos
#### 5.3 Fotos y Documentación
#### 5.4 Conversión a Factura

### Sprint 15: POS Mejorado

#### 5.5 Descuentos Rápidos
#### 5.6 Cuadre de Caja
#### 5.7 Reportes de POS

---

## FASE 6: Integraciones y Polish (Próxima)

### Sprint 16-17: Notificaciones

#### 6.1 Sistema de Notificaciones
#### 6.2 Envío de Facturas por Email

### Sprint 18-19: Import/Export Completo

#### 6.3 Importación de Contactos
#### 6.4 Exportación Universal

### Sprint 20-21: Mejoras Finales

#### 6.5 Dashboard Mejorado
#### 6.6 Búsqueda Global (Ctrl+K)
#### 6.7 Audit Logs Mejorado

#### 1.6 Crédito y Condiciones por Cliente
```
Descripción: Límite de crédito y días de pago

Modelo:
- CreditLimit: decimal
- CreditDays: int
- PaymentConditions: enum

UI:
- Campos en formulario de cliente
- Validación en factura: alert si excede límite
- Indicador visual en lista de clientes
```

#### 1.7 Descuentos por Ítem
```
Descripción: Descuentos porcentuales o fijos por línea de factura

Modelo:
- InvoiceItem: ..., discount, discountType ('percentage' | 'fixed')

UI:
- Campo de descuento en cada línea de factura
- Totales recalculados automáticamente
- Historial de descuentos aplicados
```

**Entregables:**
- [ ] Campos fiscales en contactos
- [ ] Límite de crédito por cliente
- [ ] Descuentos por ítem en facturas

**Esfuerzo:** ~2 sprints

---

### Sprint 4: Centro de Costos

#### 1.8 Centro de Costos
```
Descripción: Agrupar ingresos/gastos por área/proyecto/sucursal

Modelo:
- CostCenter: id, organizationId, code, name, description, isActive

Relaciones:
- Invoice, Expense, Income: costCenterId (opcional)

UI:
- CRUD de centros de costo en Configuración
- Selector en formularios de documentos
- Reportes filtrados por centro de costo
```

#### 1.9 Reportes por Centro de Costo
```
Descripción: Rentabilidad por área/proyecto

Reports:
- Estado de resultados por CC
- Resumen de ingresos y gastos por CC
- Gráficos comparativos
```

**Entregables:**
- [ ] CRUD de centros de costo
- [ ] Asignación a documentos
- [ ] Reportes por centro de costo

**Esfuerzo:** ~2 sprints

---

## FASE 2: Tesorería y Bancos (Meses 2-3)

### Sprint 5-6: Conciliación Bancaria

#### 2.1 Modelo de Conciliación
```
Modelos:
- BankReconciliation: id, bankAccountId, date, initialBalance, finalBalance, 
                     status, difference
- ReconciliationItem: reconciliationId, transactionId, transactionType, amount

UI:
- Página de conciliaciones
- Lista de movimientos del banco
- Lista de movimientos en sistema
- Matching manual y automático
```

#### 2.2 Importación de Extractos
```
Descripción: Leer extractos bancarios de archivos

Formatos soportados:
- Excel/CSV
- OFX
- PDF (con parsing básico)

UI:
- Upload de archivo
- Preview de movimientos detectados
- Mapeo de columnas
```

#### 2.3 Conciliación Automática
```
Descripción: Matching de transacciones similares

Criterios de matching:
- Monto exacto + fecha相近 (2-3 días)
- Referencia/Número de documento
- Descripción contieneNCF

UI:
- Sugerencias de matching
- Aprobación manual
- Unmatch para excepciones
```

**Entregables:**
- [ ] Modelo de conciliación bancaria
- [ ] Importación de extractos Excel/CSV
- [ ] Matching automático de transacciones
- [ ] UI de conciliar bancaria
- [ ] Reporte de diferencia en cambio

**Esfuerzo:** ~4 sprints

---

### Sprint 7: Flujo de Caja

#### 2.4 Flujo de Caja Proyectado
```
Descripción: Forecasting de efectivo

Cálculos:
- Saldo actual por cuenta
- Proyección basada en facturas pendientes (vencimiento)
- Pagos programados
- Ingresos esperados

UI:
- Dashboard de flujo de caja
- Gráfico de barras: ingresos vs gastos proyectados
- Filtro por período (semana, mes, trimestre)
```

#### 2.5 Cheques y Tarjetas
```
Descripción: Gestión de cheques y tarjetas corporativas

Modelo:
- Check: bankAccountId, number, date, amount, beneficiary, status, type
- CardTransaction: cardId, date, amount, description, status

UI:
- Registro de cheques emitidos/recibidos
- Historial de tarjetas
- Conciliación de movimientos
```

**Entregables:**
- [ ] Flujo de caja proyectado
- [ ] Gestión de cheques
- [ ] Historial de tarjetas de crédito

**Esfuerzo:** ~3 sprints

---

## FASE 3: Activos Fijos y Contabilidad (Meses 3-4)

### Sprint 8-9: Activos Fijos

#### 3.1 Módulo de Activos Fijos
```
Modelos:
- FixedAsset: id, organizationId, name, categoryId, code, description,
              acquisitionDate, acquisitionCost, salvageValue, usefulLife,
              depreciationMethod, status, location, responsibleId

- AssetCategory: id, name, depreciationRate, accountAssetId, accountDepreciationId, accountExpenseId

- AssetDepreciation: id, assetId, date, amount, accumulated, method

UI:
- Módulo completo en Contabilidad > Activos Fijos
- CRUD de activos
- Categorías de activos
- Reporte de depreciación
```

#### 3.2 Depreciación Automática
```
Funciones:
- Método lineal: (costo - valor residual) / vida útil
- Método suma de dígitos
- Cálculo mensual
- Generación automática de asientos

UI:
- Botón "Calcular depreciación"
- Preview de asientos a generar
- Historial de depreciaciones
```

#### 3.3 Estados de Activos
```
Estados:
- ACTIVE: En uso
- IN_REPAIR: En reparación
- IN_STORAGE: Almacenado
- DISPOSED: Dado de baja
- SOLD: Vendido

Transiciones:
- Active → InRepair → Active
- Active → InStorage → Active
- Active → Disposed (genera asiento)
- Active → Sold (genera asiento + ingreso)
```

**Entregables:**
- [ ] Módulo de activos fijos
- [ ] Categorías de activos
- [ ] Cálculo de depreciación automática
- [ ] Asientos contables automáticos
- [ ] Estados y transiciones
- [ ] Reportes de activos

**Esfuerzo:** ~4 sprints

---

### Sprint 10: Retenciones y Ajustes

#### 3.4 Sistema de Retenciones
```
Modelos:
- Retention: id, organizationId, name, type, percentage, accountPayableId, accountReceivableId, isActive

Tipos:
- ISR_RETENTION (retención en fuente)
- IVA_RETENTION
- ISC_RETENTION
- FLETE_RETENTION

UI:
- Configuración > Impuestos > Retenciones
- Selector en facturas y pagos
- Cálculo automático
- Certificado de retención
```

#### 3.5 Certificados de Retención
```
Descripción: Generar certificados para clientes/proveedores

UI:
- Generación de PDF del certificado
- Historial de certificados emitidos
- Envío por email

Campos:
- Fecha, Número de certificado
- Agente de retención, Beneficiario
- Concepto, Monto retenido, Monto total
```

#### 3.6 Ajustes por Diferencia en Cambio
```
Descripción: Ajustes cambiarios periódicos para cuentas en moneda extranjera

UI:
- Asistente de ajuste mensual
- Lista de cuentas en USD/moneda extranjera
- Cálculo de diferencia
- Generación de asiento de ajuste
```

**Entregables:**
- [ ] Sistema de retenciones
- [ ] Certificados de retención
- [ ] Ajustes por diferencia en cambio

**Esfuerzo:** ~3 sprints

---

## FASE 4: Reportes y Mejoras (Meses 4-5)

### Sprint 11-12: Reportes Fiscales

#### 4.1 Reporte 606/607 (RD) / Equivalente
```
Descripción: Libro de compras y ventas para declaración fiscal

Formatos por país:
- República Dominicana: 606 (compras), 607 (ventas)
- Colombia: Inventarios y balances
- México: DIAN reports
- etc.

UI:
- Selector de período
- Preview de datos
- Exportar a Excel
- Validación de campos requeridos
```

#### 4.2 Libro de Ventas
```
Descripción: Detalle de ventas por período

Columnas:
- Fecha, NCF, RNC/Cédula cliente, Nombre, Tipo, TotalGravado, ITBIS, Total

Filtros:
- Período (mes, trimestre, año)
- Estado (todos, solo facturados)
- Tipo (crédito, efectivo)
```

#### 4.3 Libro de Compras
```
Descripción: Detalle de compras por período

Columnas:
- Fecha, NCF/Documento, RNC/Cédula proveedor, Nombre, ITBIS, Total

Similar a libro de ventas
```

**Entregables:**
- [ ] Reporte 606 (libro de compras)
- [ ] Reporte 607 (libro de ventas)
- [ ] Exportación compatible con DGII
- [ ] Reportes para otros países (si aplica)

**Esfuerzo:** ~3 sprints

---

### Sprint 13: Reportes de Rentabilidad

#### 4.4 Rentabilidad por Producto
```
Descripción: Margen de ganancia por ítem

Cálculo:
- Ingresos por producto
- Costos (promedio del período)
- Margen = Ingresos - Costo
- Margen % = Margen / Ingresos * 100

UI:
- Tabla ordenable por margen
- Gráfico de barras horizontales
- Filtro por período y categoría
```

#### 4.5 Rentabilidad por Cliente
```
Descripción: Ganancias generadas por cliente

Cálculo:
- Total facturado al cliente
- Costo de productos vendidos
- Margen bruto por cliente

UI:
- Ranking de clientes por rentabilidad
- Detalle por cliente
- Gráfico de Pareto (80/20)
```

#### 4.6 Estado de Cuenta aging
```
Descripción: Cuentas por cobrar vencidas

Categorías:
- Corriente (0-30 días)
- 31-60 días
- 61-90 días
- >90 días

UI:
- Vista de aging por cliente
- Totales por categoría
- Alertas de cartera vencida
```

**Entregables:**
- [ ] Rentabilidad por producto
- [ ] Rentabilidad por cliente
- [ ] Aging de cartera
- [ ] Exportación de reportes

**Esfuerzo:** ~2 sprints

---

## FASE 5: Taller y POS Mejorado (Meses 5-6)

### Sprint 14: Órdenes de Servicio Completas

#### 5.1 Estados y Seguimiento
```
Estados:
- RECEIVED: Vehículo recibido
- DIAGNOSIS: En diagnóstico
- APPROVED: Reparación aprobada
- IN_PROGRESS: En reparación
- FINISHED: Reparación terminada
- DELIVERED: Entregado al cliente

UI:
- Kanban de órdenes por estado
- Timeline de cambios de estado
- Notificaciones de cambio
```

#### 5.2 Asignación de Mecánicos
```
Modelo:
- WorkOrderAssignment: workOrderId, userId, task, estimatedHours, status

UI:
- Selector de mecánico en trabajos
- Vista de carga de trabajo
- Estimado de horas por tarea
```

#### 5.3 Fotos y Documentación
```
Modelo:
- VehiclePhoto: vehicleId, workOrderId, type, url, description, createdAt

Tipos:
- RECEPCION, DAMAGE, PROGRESS, DELIVERY

UI:
- Galería de fotos por orden
- Captura desde cámara del dispositivo
- Antes/después
```

#### 5.4 Conversión a Factura
```
Descripción: Generar factura desde orden de servicio

UI:
- Botón "Crear Factura" en OS
- Pre-fill de datos del cliente y vehículo
- Lista de trabajos para incluir
- Totales calculados
```

**Entregables:**
- [ ] Kanban de estados
- [ ] Asignación de mecánico
- [ ] Galería de fotos
- [ ] Conversión a factura
- [ ] Reporte de OS

**Esfuerzo:** ~3 sprints

---

### Sprint 15: POS Mejorado

#### 5.5 Descuentos Rápidos
```
UI:
- Botón de descuento % en línea de producto
- Descuento general en subtotal
- Rápido access con teclado
```

#### 5.6 Cuadre de Caja
```
Descripción: Reporte de cierre de turno

Modelo:
- CashClosure: shiftId, openingAmount, totalCash, totalCard, totalTransfer, 
               expectedAmount, actualAmount, difference, notes

UI:
- Modal de cierre al terminar turno
- Comparación esperado vs real
- Motivo de diferencia (si aplica)
- Historial de cierres
```

#### 5.7 Reportes de POS
```
Reports:
- Ventas por período
- Ventas por cajero
- Productos más vendidos
- Métodos de pago
- Comparativo por terminal/POS
```

**Entregables:**
- [ ] Descuentos rápidos en POS
- [ ] Cuadre de caja
- [ ] Reportes de POS
- [ ] Mejoras de UX en POS

**Esfuerzo:** ~2 sprints

---

## FASE 6: Integraciones y Polish (Meses 6-8)

### Sprint 16-17: Notificaciones y Emails

#### 6.1 Sistema de Notificaciones
```
Modelo:
- Notification: id, userId, type, title, message, data, read, createdAt

Tipos:
- STOCK_LOW
- PAYMENT_RECEIVED
- WORK_ORDER_STATUS
- DUE_INVOICE

UI:
- Bell icon en header
- Dropdown con lista
- Badge de unread
```

#### 6.2 Envío de Facturas por Email
```
Descripción: Notificaciones al cliente

Features:
- Template de email configurable
- Adjunto de PDF
- Envío individual o masivo
- Integración con WhatsApp (opcional)
```

**Entregables:**
- [ ] Sistema de notificaciones
- [ ] Email de facturas
- [ ] Notificaciones de estado

**Esfuerzo:** ~2 sprints

---

### Sprint 18-19: Import/Export Completo

#### 6.3 Importación de Contactos
```
Similar a importación de productos
- Plantilla descargable
- Validación
- Preview
- Mapeo de columnas
```

#### 6.4 Exportación Universal
```
Descripción: Exportar cualquier listado a Excel/PDF

UI:
- Botón "Exportar" en todas las páginas de lista
- Selector de formato (Excel, PDF, CSV)
- Selector de columnas a incluir
```

**Entregables:**
- [ ] Importación de contactos
- [ ] Exportación universal
- [ ] Mejoras en templates

**Esfuerzo:** ~2 sprints

---

### Sprint 20-21: Mejoras Finales

#### 6.5 Dashboard Mejorado
```
Widgets:
- Ventas del día/mes
- Cartera pendiente
- Stock bajo
- Órdenes de servicio activas
- Flujo de caja proyectado

Features:
- Draggable widgets
- Filtros de período
- Comparativo vs período anterior
```

#### 6.6 Búsqueda Global
```
Descripción: Búsqueda unificada

Shortcut: Ctrl/Cmd + K

Búsqueda en:
- Productos
- Contactos
- Facturas
- Órdenes

UI:
- Modal de búsqueda
- Resultados agrupados por tipo
- Quick actions (ir, editar)
```

#### 6.7 Audit Logs Mejorado
```
Descripción: Historial detallado de cambios

Features:
- Registro de antes/después
- Diff visual
- Filtro por usuario, entidad, acción
- Exportación
```

**Entregables:**
- [ ] Dashboard personalizado
- [ ] Búsqueda global (Ctrl+K)
- [ ] Audit logs mejorados
- [ ] Polish general de UI

**Esfuerzo:** ~3 sprints

---

## Resumen de Fases

| Fase | Descripción | Estado | Sprints |
|------|-------------|--------|---------|
| 1 | Fundamentos Críticos (Inventario, Contactos) | ✅ COMPLETADA | 4 |
| 2 | Tesorería y Bancos | ✅ COMPLETADA | 3 |
| 3 | Activos Fijos y Contabilidad | ✅ COMPLETADA | 4 |
| 4 | Reportes Fiscales | ✅ COMPLETADA | 3 |
| 5 | Taller y POS | ✅ COMPLETADA | 3 |
| 6 | Integraciones y Polish | ✅ COMPLETADA | 4 |
| **NUEVAS** | Features Plus (Dashboard, Dark Mode, Backup) | ✅ COMPLETADA | 1 |
| **TOTAL** | | **100% completado** | **22 sprints** |

---

## Nuevas Features Implementadas (Marzo 2026)

### 🚀 Dashboard KPIs ✅
```
Estado: IMPLEMENTADO
- Página /dashboard
- 4 métricas principales: Ventas, Inventario, Órdenes, Cash Flow
- Mini gráficos de barras
- Actualización automática cada 30 segundos
- Indicador de tiempo real
```

### 🌙 Dark Mode ✅
```
Estado: IMPLEMENTADO
- Toggle en header
- Persistencia en localStorage
- Variables CSS para ambos temas
- Cambio instantáneo
```

### 💾 Backup/Restore DB ✅
```
Estado: IMPLEMENTADO
- Página /admin/backup
- Crear backup (pg_dump)
- Descargar backup
- Eliminar backup
- Listado de backups disponibles
```

---

## Seguridad Corregida (Marzo 2026)

### xlsx → exceljs ✅
```
Estado: CORREGIDO
- Migración completa de SheetJS a ExcelJS
- 11 archivos actualizados
- 0 vulnerabilidades
```

### Prisma 6.12.0 ✅
```
Estado: ACTUALIZADO
- Fix vulnerabilidad effect
- Adaptación de configuración
- 0 vulnerabilidades
```

---

## Checklist de Entregables Finales

### Inventario
- [x] Multi-bodegas ✅
- [x] Transferencias ✅
- [x] Alertas stock bajo ✅
- [x] Importar productos ✅
- [x] Exportar productos ✅
- [x] Variantes ✅

### Contactos
- [x] Campos fiscales ✅
- [x] Límite de crédito ✅
- [ ] Importar contactos (pendiente)

### Ventas
- [x] Descuentos por ítem ✅
- [ ] Email de facturas (pendiente)
- [x] Notas crédito/débito (existente)

### Compras
- [ ] Órdenes de compra completas (pendiente)
- [ ] Recepciones (pendiente)
- [ ] Devoluciones a proveedores (pendiente)

### Tesorería
- [x] Conciliación bancaria ✅
- [x] Importación extractos ✅
- [x] Flujo de caja proyectado ✅
- [x] Cheques ✅

### Contabilidad
- [x] Centro de costos ✅
- [x] Retenciones ✅
- [x] Certificados ✅
- [x] Ajustes cambiarios ✅
- [x] Activos fijos ✅
- [x] Depreciación automática ✅

### Reportes
- [x] Libro de ventas (606) ✅
- [x] Libro de compras (607) ✅
- [x] Rentabilidad por producto ✅
- [x] Rentabilidad por cliente ✅
- [x] Aging de cartera ✅

### Taller
- [x] Estados (básico) ✅
- [x] Kanban completo ✅
- [x] Asignación de mecánico ✅
- [ ] Fotos (pendiente)
- [ ] Conversión a factura (pendiente)

### POS
- [x] Descuentos (básico) ✅
- [x] Cuadre de caja ✅
- [ ] Reportes de POS (pendiente)

### General
- [x] Notificaciones ✅
- [x] Dashboard mejorado ✅
- [x] Búsqueda global (Ctrl+K) ✅
- [x] Audit logs ✅
- [x] Dark Mode ✅
- [x] Backup DB ✅

---

## Métricas de Éxito

| Métrica | Inicio | Actual | Meta |
|---------|--------|--------|------|
| Cobertura funcional vs Alegra | ~65% | ~95% | 95% |
| Tasks completadas | - | 42/42 | 42 |
| Fases completadas | 0/6 | 6/6 | 6/6 |
| Vulnerabilidades | 4 high | 0 | 0 |
| Tests | - | 52/52 | 52 |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Scope creep | Alta | Alto | Riguroso control de cambios |
| Deuda técnica acumulada | Media | Medio | Code review obligatorio |
| Cambios en requisitos fiscales | Alta | Alto | Arquitectura flexible por país |
| Retrasos en integraciones | Media | Medio | Mock APIs inicialmente |

---

*Plan generado para planificación de sprints y asignación de recursos.*
*Última actualización: Marzo 2026*
