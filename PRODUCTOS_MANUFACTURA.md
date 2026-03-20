# Sistema de Productos Manufacturados y Fórmulas - Alegra Clone

## 1. Conceptos Fundamentales

### 1.1 Bill of Materials (BoM) - Lista de Materiales
Un **BoM** es la lista completa de materiales, componentes e ingredientes necesarios para fabricar un producto. Es el documento central de cualquier sistema de manufactura.

**Tipos de BoM:**
- **BoM Simple**: Lista plana de materiales con cantidades fijas
- **BoM Multi-nivel**: Productos que contienen sub-ensambles (otros productos manufacturados)
- **BoM por Variantes**: Una sola BoM que sirve para múltiples variantes de producto
- **BoM Dinámica**: BoM con fórmulas que calculan cantidades automáticamente según atributos

### 1.2 Fórmula vs BoM
| Característica | BoM | Fórmula |
|---------------|-----|---------|
| Uso típico | Manufactura discreta | Procesos (recetas) |
| Componentes | Piezas físicas | Ingredientes |
| Subproductos | No | Sí |
| Pérdida/Yield | Opcional | Obligatorio |

### 1.3 Atributos de Producto
Los **atributos** son características configurables que definen un producto:
- Dimensiones (ancho, alto, profundidad)
- Material
- Color
- Acabado
- Grado/Calidad

---

## 2. Tipos de Productos en el Sistema

### 2.1 Producto Terminado (PT)
Producto final que se vende y manufactura.

```
Ejemplo: Ventana de aluminio 1.20m x 1.50m
```

### 2.2 Sub-ensamble (SE)
Producto intermedio que se manufactura y se usa en otros productos.

```
Ejemplo: Marco de ventana (se usa en múltiples tipos de ventanas)
```

### 2.3 Materia Prima (MP)
Insumos básicos que se compran y se consumen.

```
Ejemplo: Perfil de aluminio, tornillos, vidrio, sellador
```

### 2.4 Producto Configurable
Producto cuyo BoM varía según atributos seleccionados.

```
Ejemplo: Ventana con medidas variables (ancho x alto)
```

---

## 3. Estructura de Datos Propuesta

### 3.1 Modelo de Producto (Extensión)
```typescript
// Nuevo enum para tipo de producto
enum ProductType {
  FINISHED = "FINISHED",      // Producto terminado
  SEMI_FINISHED = "SEMI_FINISHED",  // Sub-ensamble
  RAW = "RAW",               // Materia prima
  CONFIGURABLE = "CONFIGURABLE"  // Producto con variantes
}

// Atributos del producto
interface ProductAttribute {
  id: string;
  name: string;           // "Ancho", "Alto", "Material"
  code: string;          // "width", "height", "material"
  type: "number" | "text" | "select" | "boolean";
  unit?: string;         // "m", "cm", "mm"
  defaultValue?: any;
  options?: string[];    // Para tipo "select"
  isRequired: boolean;
}
```

### 3.2 Modelo de BoM
```typescript
interface BillOfMaterials {
  id: string;
  productId: string;           // Producto que se manufactura
  version: string;            // "1.0", "2.0"
  isActive: boolean;
  type: "PRODUCTION" | "COSTING" | "PLANNING";
  
  // Componentes
  items: BoMItem[];
  
  // Operaciones (opcional)
  operations: Operation[];
  
  // Costo calculado
  totalCost: number;
}

interface BoMItem {
  id: string;
  componentId: string;        // Producto componente
  quantity: number;           // Cantidad base
  
  // Para BoM dinámicas
  quantityFormula?: string;   // Fórmula: "{width} * {height} / 10000"
  
  // Para BoM por variantes
  applicableVariants?: string[];  // IDs de variantes donde aplica
  
  // Configuración avanzada
  isOptional: boolean;
  scrapPercentage: number;    // % de desperdicio
}
```

### 3.3 Modelo de Fórmula
```typescript
interface ProductFormula {
  id: string;
  name: string;
  productId: string;
  
  // Atributos que usa la fórmula
  inputs: FormulaInput[];
  
  // Expresión de cálculo
  expression: string;
  
  // Resultado
  outputCode: string;        // Código del atributo resultado
}

interface FormulaInput {
  attributeCode: string;     // Código del atributo
  label: string;             // Etiqueta visible
}
```

---

## 4. Sistema de Atributos y Variables

### 4.1 Atributos Predefinidos del Sistema

Para productos manufactureros, el sistema soportará:

| Código | Nombre | Tipo | Unidad | Descripción |
|--------|--------|------|--------|-------------|
| width | Ancho | number | m, cm, mm | Dimensión horizontal |
| height | Alto | number | m, cm, mm | Dimensión vertical |
| depth | Profundidad | number | m, cm, mm | Tercera dimensión |
| length | Largo | number | m, cm, mm | Longitud total |
| area | Área | number | m² | Área calculada |
| perimeter | Perímetro | number | m | Perímetro calculado |
| weight | Peso | number | kg, g | Peso calculado |
| quantity | Cantidad | number | - | Cantidad a producir |

### 4.2 Atributos Personalizables
Los usuarios pueden crear atributos adicionales:

```
Ejemplos:
- material: "Aluminio", "PVC", "Madera"
- color: "Blanco", "Negro", "Gris"
- acabado: "Brillante", "Mate"
- thickness: Espesor del material
- grade: Grado/calidad del material
```

---

## 5. Motor de Fórmulas

### 5.1 Sintaxis de Fórmulas
Las fórmulas usarán una sintaxis similar a hojas de cálculo:

```
{attribute_code}  → Referencia a atributo del producto
{matr_attribute}   → Referencia a atributo del material
+ - * /           → Operadores matemáticos
()                → Agrupación
ROUND()           → Funciones de redondeo
IF()              → Condicionales
MIN() MAX()       → Funciones de agregación
```

### 5.2 Operadores Soportados

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| = | Igual | material = "aluminio" |
| != | Diferente | color != "blanco" |
| > | Mayor que | width > 1.0 |
| < | Menor que | height < 2.5 |
| >= | Mayor o igual | quantity >= 10 |
| <= | Menor o igual |
| and | Y lógico |
| or | O lógico |

### 5.3 Funciones Disponibles

```javascript
// Redondeo
ROUND(value, decimals)           // ROUND({area}, 2)
ROUNDUP(value)                   // Redondeo hacia arriba
ROUNDDOWN(value)                 // Redondeo hacia abajo

// Matemáticas
ABS(value)                       // Valor absoluto
MIN(a, b, ...)                   // Mínimo
MAX(a, b, ...)                   // Máximo
SQRT(value)                      // Raíz cuadrada
POW(base, exp)                   // Potencia

// Condicionales
IF(condition, trueValue, falseValue)
IF({width} > 2, "Grande", "Chico")

// Conversión
CONVERT(value, fromUnit, toUnit)
```

---

## 6. Ejemplo Práctico: Fabricación de Ventanas

### 6.1 Definición del Producto

**Producto:** Ventana de Aluminum
**Tipo:** Configurable
**Atributos:**

| Atributo | Tipo | Valores/Ubicación |
|----------|------|-------------------|
| width | number | 0.5 - 3.0 m |
| height | number | 0.5 - 2.5 m |
| glassType | select | Transparente, Templado, Laminado |
| color | select | Blanco, Negro, Madera, Gris |

### 6.2 BoM con Fórmulas

```
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTO: Ventana de Aluminum                               │
│ TIPO: BoM Dinámica                                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────┬──────────────────────────┐
│ Componente       │ Cantidad     │ Fórmula                  │
├──────────────────┼──────────────┼──────────────────────────┤
│ Perfil marco     │ 2 ×          │ ({width} + {height}) × 2 │
│ Perfil refuerzo  │ 2 ×          │ {width} × 1.5            │
│ Vidrio           │ 1 ×          │ {width} × {height} × 1.1 │
│ Tornillos        │ 8 ×          │ ROUND({perimeter} / 0.3) │
│ Sellador         │ 1 ×          │ {perimeter} / 10         │
│ Vinilo           │ 2 ×          │ ({width} + {height}) × 2 │
│ Burletes         │ 2 ×          │ ({width} + {height}) × 2 │
└──────────────────┴──────────────┴──────────────────────────┘

Cálculos auxiliares:
- perimeter = ({width} + {height}) × 2
- area = {width} × {height}
```

### 6.3 Ejecución de la Fórmula

**Input del usuario:**
- Ancho: 1.20 m
- Alto: 1.50 m

**Cálculos automáticos:**
```
perímetro = (1.20 + 1.50) × 2 = 5.40 m
área = 1.20 × 1.50 = 1.80 m²

Componentes:
- Perfil marco: (1.20 + 1.50) × 2 = 5.40 m
- Perfil refuerzo: 1.20 × 1.5 = 1.80 m
- Vidrio: 1.20 × 1.50 × 1.1 = 1.98 m²
- Tornillos: ROUND(5.40 / 0.3) = 18 unidades
- Sellador: 5.40 / 10 = 0.54 tubo
- Vinilo: 5.40 m
- Burletes: 5.40 m
```

### 6.4 Resultado en Inventory

Al crear una **Orden de Producción** para 1 ventana de 1.20 x 1.50:

```
┌─────────────────────────────────────────────────────────────┐
│ ORDEN DE PRODUCCIÓN: OP-001                                │
│ Producto: Ventana 1.20x1.50                                │
│ Cantidad: 1                                                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬────────────┬────────────┬───────────────┐
│ Material         │ Requerido  │ Consumido  │ Diferencia    │
├──────────────────┼────────────┼────────────┼───────────────┤
│ Perfil marco     │ 5.40 m     │ 5.40 m     │ 0             │
│ Perfil refuerzo  │ 1.80 m     │ 1.80 m     │ 0             │
│ Vidrio           │ 1.98 m²    │ 1.98 m²    │ 0             │
│ Tornillos        │ 18 pz      │ 18 pz      │ 0             │
│ Sellador         │ 0.54 tub   │ 0.54 tub   │ 0             │
│ Vinilo           │ 5.40 m     │ 5.40 m     │ 0             │
│ Burletes         │ 5.40 m     │ 5.40 m     │ 0             │
└──────────────────┴────────────┴────────────┴───────────────┘
```

---

## 7. Casos de Uso Adicionales

### 7.1 Muebles a Medida
```
Producto: Mueble de cocina
Atributos: width, depth, height, material, doors, drawers

Fórmulas:
-板材 = {width} × {height} × 0.018 × 2 + {depth} × {height} × 0.018 × 2
- tiradores = {doors} + {drawers}
- bisagras = {doors} × 2
```

### 7.2 Cableado Eléctrico
```
Producto: Cableado por metro cuadrado
Atributos: area, type (residential, commercial, industrial)

Fórmulas:
- cable_principal = IF({type}="residential", {area} × 1.5, {area} × 2)
- cable_secundario = {area} × 3
- tomas = ROUNDUP({area} / 10)
-Interruptores = ROUNDUP({area} / 15)
```

### 7.3 Pintura
```
Producto: Pintura de paredes
Atributos: wall_width, wall_height, coats (capas), paint_type

Fórmulas:
- area = {wall_width} × {wall_height}
- liters = ({area} × {coats}) / 10  // 10m² por litro
- primer = {area} / 15               // 15m² por litro
```

---

## 8. Propuesta de Implementación

### 8.1 Fases de Desarrollo

#### Fase 1: Extensión del Modelo de Datos
- [ ] Agregar campo `type` a Producto (FINISHED, SEMI_FINISHED, RAW, CONFIGURABLE)
- [ ] Crear tabla `ProductAttribute` para atributos personalizables
- [ ] Crear tabla `ProductAttributeValue` para valores por variante
- [ ] Crear tabla `BillOfMaterials` con soporte para fórmulas
- [ ] Crear tabla `BoMItem` con campo `quantityFormula`

#### Fase 2: Motor de Fórmulas
- [ ] Crear parser de expresiones (o usar librería como `mathjs`)
- [ ] Implementar evaluación de fórmulas con atributos
- [ ] Crear función de cálculo de materiales
- [ ] Manejo de errores y validación

#### Fase 3: Interfaz de Usuario
- [ ] Formulario de creación de atributos
- [ ] Editor visual de BoM con fórmulas
- [ ] Calculadora de materiales en tiempo real
- [ ] Preview de consumo de materiales

#### Fase 4: Integración con Producción
- [ ] Crear modelo de Orden de Producción
- [ ] Integración con inventario (reserva de materiales)
- [ ] Consumo automático de materiales
- [ ] Reporte de diferencia material

### 8.2 Librerías Recomendadas

```typescript
// Para evaluación de fórmulas
- mathjs: mathjs.org  // Potente parser de expresiones
- expr-eval: https://github.com/silentmatt/expr-eval
- formula-parser: https://github.com/handsontable/formula-parser

// Para validación
- zod: Validación de esquemas
```

### 8.3 Estructura de Archivos Propuesta

```
lib/
├── formulas/
│   ├── engine.ts        // Parser y evaluador
│   ├── functions.ts     // Funciones disponibles
│   └── validator.ts     // Validador de fórmulas
├── manufacturing/
│   ├── bom.ts          // Lógica de BoM
│   ├── production.ts    // Órdenes de producción
│   └── inventory.ts     // Consumo de materiales
```

---

## 9. Resumen

Este documento presenta un sistema completo para:

1. **Productos con atributos variables** (ancho, alto, material, etc.)
2. **Fórmulas dinámicas** que calculan consumo de materiales
3. **Bill of Materials (BoM)** con expresiones matemáticas
4. **Producción automatizada** con reserva y consumo de inventario

### Beneficios:
- ✅ Precisión en cálculo de materiales
- ✅ Reducción de desperdicio
- ✅ Trazabilidad completa
- ✅ Flexibilidad para cualquier tipo de manufactura
- ✅ Integración con inventario

---

*Documento preparado para el equipo de desarrollo de Alegra Clone*
*Versión: 1.0 - Marzo 2026*
