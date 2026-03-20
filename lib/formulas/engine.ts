import { create, all, MathJsStatic } from "mathjs";
import Decimal from "decimal.js";

const math: MathJsStatic = create(all);

export interface FormulaContext {
  [key: string]: number | string | boolean;
}

export interface FormulaResult {
  success: boolean;
  value?: number;
  error?: string;
}

export function evaluateFormula(formula: string, context: FormulaContext): FormulaResult {
  try {
    if (!formula || formula.trim() === "") {
      return { success: true, value: 0 };
    }

    let expr = formula;

    // Replace {variable} with context values
    const varPattern = /\{([^}]+)\}/g;
    expr = expr.replace(varPattern, (match, varName) => {
      const cleanName = varName.trim();
      if (cleanName in context) {
        const val = context[cleanName];
        return String(val);
      }
      // Try with matr_ prefix
      if (`matr_${cleanName}` in context) {
        return String(context[`matr_${cleanName}`]);
      }
      return "0";
    });

    // Evaluate the expression
    const result = math.evaluate(expr);

    if (typeof result === "number") {
      return { success: true, value: result };
    } else if (typeof result === "bigint") {
      return { success: true, value: Number(result) };
    } else if (typeof result === "string") {
      return { success: true, value: Number(result) || 0 };
    }

    return { success: true, value: 0 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function calculateMaterialQuantity(
  formula: string | null | undefined,
  attributes: FormulaContext
): Decimal {
  if (!formula || formula.trim() === "") {
    return new Decimal(0);
  }

  const result = evaluateFormula(formula, attributes);

  if (!result.success || result.value === undefined) {
    return new Decimal(0);
  }

  return new Decimal(result.value);
}

export function validateFormula(formula: string): { valid: boolean; error?: string } {
  try {
    // Test with dummy values
    const testContext: FormulaContext = {
      width: 1,
      height: 1,
      depth: 1,
      quantity: 1,
      area: 1,
      perimeter: 2,
      length: 1,
      weight: 1,
      material: "test",
      color: "test",
    };

    const result = evaluateFormula(formula, testContext);

    if (!result.success) {
      return { valid: false, error: result.error };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid formula",
    };
  }
}

export function getAvailableVariables(): { code: string; description: string; type: string }[] {
  return [
    { code: "width", description: "Ancho del producto", type: "number" },
    { code: "height", description: "Alto del producto", type: "number" },
    { code: "depth", description: "Profundidad del producto", type: "number" },
    { code: "length", description: "Largo del producto", type: "number" },
    { code: "area", description: "Área calculada (width * height)", type: "number" },
    { code: "perimeter", description: "Perímetro ((width + height) * 2)", type: "number" },
    { code: "quantity", description: "Cantidad a producir", type: "number" },
    { code: "weight", description: "Peso del producto", type: "number" },
    { code: "thickness", description: "Espesor del material", type: "number" },
    { code: "material", description: "Tipo de material", type: "text" },
    { code: "color", description: "Color del producto", type: "text" },
    { code: "matr_*", description: "Prefijo para atributos del material (ej: matr_width)", type: "any" },
  ];
}

export function getAvailableFunctions(): { name: string; syntax: string; description: string }[] {
  return [
    { name: "round", syntax: "round(value, decimals)", description: "Redondea un número" },
    { name: "ceil", syntax: "ceil(value)", description: "Redondea hacia arriba" },
    { name: "floor", syntax: "floor(value)", description: "Redondea hacia abajo" },
    { name: "abs", syntax: "abs(value)", description: "Valor absoluto" },
    { name: "min", syntax: "min(a, b, ...)", description: "Mínimo valor" },
    { name: "max", syntax: "max(a, b, ...)", description: "Máximo valor" },
    { name: "sqrt", syntax: "sqrt(value)", description: "Raíz cuadrada" },
    { name: "pow", syntax: "pow(base, exponent)", description: "Potencia" },
    { name: "log", syntax: "log(value)", description: "Logaritmo natural" },
    { name: "log10", syntax: "log10(value)", description: "Logaritmo base 10" },
    { name: "exp", syntax: "exp(value)", description: "Exponencial" },
    { name: "sin", syntax: "sin(value)", description: "Seno" },
    { name: "cos", syntax: "cos(value)", description: "Coseno" },
    { name: "tan", syntax: "tan(value)", description: "Tangente" },
    { name: "factorial", syntax: "factorial(n)", description: "Factorial" },
    { name: "mod", syntax: "mod(a, b)", description: "Módulo (resto)" },
    { name: "clamp", syntax: "clamp(value, min, max)", description: "Limita valor entre min y max" },
  ];
}

// Calculate derived attributes from base dimensions
export function calculateDerivedAttributes(attributes: FormulaContext): FormulaContext {
  const derived: FormulaContext = { ...attributes };
  
  const width = Number(derived.width) || 0;
  const height = Number(derived.height) || 0;
  const depth = Number(derived.depth) || Number(derived.length) || 0;
  const quantity = Number(derived.quantity) || 1;

  // Calculate area (width * height)
  derived.area = width * height;
  
  // Calculate perimeter ((width + height) * 2)
  derived.perimeter = (width + height) * 2;
  
  // Calculate volume (width * height * depth)
  derived.volume = width * height * depth;
  
  // Calculate quantity for total
  derived.quantity = quantity;

  return derived;
}
