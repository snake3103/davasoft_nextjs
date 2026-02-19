import { Decimal } from 'decimal.js';

// Configuration for consistent financial calculations
Decimal.set({ 
  precision: 20, 
  rounding: Decimal.ROUND_HALF_UP 
});

/**
 * Utility class for common financial calculations in the ERP
 */
export class Finance {
  /**
   * Calculates the total with tax (IVA)
   */
  static addTax(amount: Decimal.Value, rate: Decimal.Value = 0.19): Decimal {
    const base = new Decimal(amount);
    const taxRate = new Decimal(rate);
    return base.mul(new Decimal(1).add(taxRate));
  }

  /**
   * Calculates the tax amount from a base price
   */
  static calculateTax(amount: Decimal.Value, rate: Decimal.Value = 0.19): Decimal {
    return new Decimal(amount).mul(new Decimal(rate));
  }

  /**
   * Formats a decimal to a string with 2 decimal places for database storage
   */
  static toFixed(amount: Decimal.Value): string {
    return new Decimal(amount).toFixed(2);
  }

  /**
   * Helper to ensure we are working with Decimal objects
   */
  static d(value: Decimal.Value): Decimal {
    return new Decimal(value);
  }
}
