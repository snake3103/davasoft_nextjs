export const PERMISSIONS = {
  // Configuración
  CONFIG_VIEW: "config:view",
  CONFIG_EDIT: "config:edit",
  
  // Ventas (Facturas)
  SALES_VIEW: "sales:view",
  SALES_CREATE: "sales:create",
  SALES_EDIT: "sales:edit",
  SALES_DELETE: "sales:delete",

  // Cotizaciones
  ESTIMATES_VIEW: "estimates:view",
  ESTIMATES_CREATE: "estimates:create",
  ESTIMATES_EDIT: "estimates:edit",
  ESTIMATES_DELETE: "estimates:delete",

  // Compras & Gastos
  PURCHASES_VIEW: "purchases:view",
  PURCHASES_CREATE: "purchases:create",
  PURCHASES_EDIT: "purchases:edit",
  PURCHASES_DELETE: "purchases:delete",

  // Contactos
  CONTACTS_VIEW: "contacts:view",
  CONTACTS_CREATE: "contacts:create",
  CONTACTS_EDIT: "contacts:edit",
  CONTACTS_DELETE: "contacts:delete",

  // Inventario
  INVENTORY_VIEW: "inventory:view",
  INVENTORY_CREATE: "inventory:create",
  INVENTORY_EDIT: "inventory:edit",
  INVENTORY_DELETE: "inventory:delete",

  // Finanzas / Bancos
  FINANCE_VIEW: "finance:view",
  FINANCE_CREATE: "finance:create",
  FINANCE_EDIT: "finance:edit",
  FINANCE_DELETE: "finance:delete",

  // Punto de Venta
  POS_ACCESS: "pos:access",
  
  // Roles y Usuarios
  USERS_VIEW: "users:view",
  USERS_MANAGE: "users:manage",
  ROLES_MANAGE: "roles:manage",
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Matriz de módulos y los permisos asociados para el UI de configuración de roles.
 */
export const MODULE_PERMISSIONS = [
  {
    module: "Ventas",
    description: "Creación y gestión de facturas de venta",
    permissions: [
      { id: PERMISSIONS.SALES_VIEW, label: "Ver Facturas" },
      { id: PERMISSIONS.SALES_CREATE, label: "Crear Facturas" },
      { id: PERMISSIONS.SALES_EDIT, label: "Editar Facturas" },
      { id: PERMISSIONS.SALES_DELETE, label: "Eliminar Facturas" },
    ]
  },
  {
    module: "Punto de Venta",
    description: "Acceso a la vista POS para vendedores",
    permissions: [
      { id: PERMISSIONS.POS_ACCESS, label: "Acceder al POS" },
    ]
  },
  {
    module: "Cotizaciones",
    description: "Gestión de estimados / cotizaciones",
    permissions: [
      { id: PERMISSIONS.ESTIMATES_VIEW, label: "Ver Cotizaciones" },
      { id: PERMISSIONS.ESTIMATES_CREATE, label: "Crear Cotizaciones" },
      { id: PERMISSIONS.ESTIMATES_EDIT, label: "Editar Cotizaciones" },
      { id: PERMISSIONS.ESTIMATES_DELETE, label: "Eliminar Cotizaciones" },
    ]
  },
  {
    module: "Inventario",
    description: "Catálogo de productos y servicios",
    permissions: [
      { id: PERMISSIONS.INVENTORY_VIEW, label: "Ver Productos" },
      { id: PERMISSIONS.INVENTORY_CREATE, label: "Crear Productos" },
      { id: PERMISSIONS.INVENTORY_EDIT, label: "Editar Productos" },
      { id: PERMISSIONS.INVENTORY_DELETE, label: "Eliminar Productos" },
    ]
  },
  {
    module: "Contactos",
    description: "Gestión de clientes y proveedores",
    permissions: [
      { id: PERMISSIONS.CONTACTS_VIEW, label: "Ver Contactos" },
      { id: PERMISSIONS.CONTACTS_CREATE, label: "Crear Contactos" },
      { id: PERMISSIONS.CONTACTS_EDIT, label: "Editar Contactos" },
      { id: PERMISSIONS.CONTACTS_DELETE, label: "Eliminar Contactos" },
    ]
  },
  {
    module: "Compras y Gastos",
    description: "Facturas de proveedores y gastos de la empresa",
    permissions: [
      { id: PERMISSIONS.PURCHASES_VIEW, label: "Ver Compras/Gastos" },
      { id: PERMISSIONS.PURCHASES_CREATE, label: "Crear Compras/Gastos" },
      { id: PERMISSIONS.PURCHASES_EDIT, label: "Editar Compras/Gastos" },
      { id: PERMISSIONS.PURCHASES_DELETE, label: "Eliminar Compras/Gastos" },
    ]
  },
  {
    module: "Finanzas y Bancos",
    description: "Cuentas bancarias y conciliación",
    permissions: [
      { id: PERMISSIONS.FINANCE_VIEW, label: "Ver Cuentas" },
      { id: PERMISSIONS.FINANCE_CREATE, label: "Crear Transacciones / Cuentas" },
      { id: PERMISSIONS.FINANCE_EDIT, label: "Editar Transacciones" },
      { id: PERMISSIONS.FINANCE_DELETE, label: "Eliminar Transacciones" },
    ]
  },
  {
    module: "Configuración y Usuarios",
    description: "Ajustes de la empresa, roles y miembros",
    permissions: [
      { id: PERMISSIONS.CONFIG_VIEW, label: "Ver Configuración General" },
      { id: PERMISSIONS.CONFIG_EDIT, label: "Editar Configuración General" },
      { id: PERMISSIONS.USERS_VIEW, label: "Ver Usuarios" },
      { id: PERMISSIONS.USERS_MANAGE, label: "Invitar / Editar Usuarios" },
      { id: PERMISSIONS.ROLES_MANAGE, label: "Gestionar Roles y Permisos" },
    ]
  }
];

export interface AppSessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  systemRole?: string;
  rolePermissions?: string[]; // E.g., ["sales:view", "contacts:view"]
}

/**
 * Función centralizada para evaluar si un usuario tiene un permiso específico.
 * 
 * Reglas de acceso (en orden de prioridad):
 * 1. ADMIN en `systemRole` = acceso total
 * 2. ADMIN en `role` (campo legacy del User) = acceso total
 * 3. Si NO tiene un customRole asignado (rolePermissions vacío/undefined) = acceso total
 *    (backward compatibility: usuarios sin rol personalizado conservan acceso completo)
 * 4. Si tiene rolePermissions con "*" = acceso total
 * 5. Verifica si el permiso específico está en rolePermissions
 */
export function hasPermission(user: AppSessionUser | undefined | null, requiredPermission: PermissionKey | "*"): boolean {
  if (!user) return false;
  
  // SystemRole ADMIN = pase directo
  if (user.systemRole === "ADMIN") return true;

  // Legacy User.role ADMIN = pase directo
  if ((user as any).role === "ADMIN") return true;

  // Si el usuario NO tiene rolePermissions asignados (no se le ha asignado un Custom Role),
  // le damos acceso total para mantener backward compatibility.
  // Solo se restringe cuando explícitamente se le asigna un rol con permisos específicos.
  if (!user.rolePermissions || user.rolePermissions.length === 0) {
    return true;
  }

  // Verifica si tiene comodín global
  if (user.rolePermissions.includes("*")) return true;

  return user.rolePermissions.includes(requiredPermission);
}
