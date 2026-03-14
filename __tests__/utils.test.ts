import { describe, it, expect } from "vitest";
import { formatMoney, formatCurrency, formatNumber, cn } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("formatMoney", () => {
    it("should format a positive number with 2 decimal places", () => {
      expect(formatMoney(1234.56)).toBe("1,234.56");
    });

    it("should handle string numbers", () => {
      expect(formatMoney("1234.56")).toBe("1,234.56");
    });

    it("should handle null values", () => {
      expect(formatMoney(null)).toBe("0,00");
    });

    it("should handle undefined values", () => {
      expect(formatMoney(undefined)).toBe("0,00");
    });

    it("should handle invalid numbers", () => {
      expect(formatMoney(NaN)).toBe("0,00");
    });

    it("should format large numbers with separators", () => {
      expect(formatMoney(1234567.89)).toBe("1,234,567.89");
    });

    it("should handle zero", () => {
      expect(formatMoney(0)).toBe("0.00");
    });
  });

  describe("formatCurrency", () => {
    it("should format with $ symbol", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("should handle null values", () => {
      expect(formatCurrency(null)).toBe("$0,00");
    });

    it("should format large numbers correctly", () => {
      expect(formatCurrency(1000000)).toBe("$1,000,000.00");
    });
  });

  describe("formatNumber", () => {
    it("should format integer with separators", () => {
      expect(formatNumber(1234567)).toBe("1,234,567");
    });

    it("should handle decimal numbers", () => {
      expect(formatNumber(1234.56)).toBe("1,234.56");
    });

    it("should handle null values", () => {
      expect(formatNumber(null)).toBe("0");
    });

    it("should handle zero", () => {
      expect(formatNumber(0)).toBe("0");
    });
  });

  describe("cn (className merge)", () => {
    it("should merge class names", () => {
      const result = cn("foo", "bar");
      expect(result).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      const result = cn("foo", false && "bar", "baz");
      expect(result).toBe("foo baz");
    });

    it("should handle arrays", () => {
      const result = cn(["foo", "bar"]);
      expect(result).toBe("foo bar");
    });

    it("should handle undefined", () => {
      const result = cn("foo", undefined, "bar");
      expect(result).toBe("foo bar");
    });
  });
});
