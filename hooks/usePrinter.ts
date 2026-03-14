import { useState, useEffect, useCallback, useRef } from "react";

export interface PrinterConfig {
  id: string;
  name: string;
  type: "system" | "pdf";
  width: number;
  charactersPerLine: number;
  isDefault: boolean;
}

const STORAGE_KEY = "pos-printer-config";

export function usePrinter() {
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterConfig | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [hasPrintedSuccessfully, setHasPrintedSuccessfully] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedPrinter) {
          setSelectedPrinter(parsed.selectedPrinter);
        }
      } catch {
        console.error("Error parsing printer config");
      }
    }
  }, []);

  const detectPrinters = useCallback(async () => {
    const detectedPrinters: PrinterConfig[] = [
      {
        id: "system-default",
        name: "Impresora predeterminada",
        type: "system",
        width: 80,
        charactersPerLine: 48,
        isDefault: true,
      },
      {
        id: "pdf",
        name: "Guardar como PDF",
        type: "pdf",
        width: 80,
        charactersPerLine: 48,
        isDefault: false,
      },
    ];

    setPrinters(detectedPrinters);
    
    if (!selectedPrinter) {
      setSelectedPrinter(detectedPrinters[0]);
    }
    
    return detectedPrinters;
  }, [selectedPrinter]);

  useEffect(() => {
    detectPrinters();
  }, [detectPrinters]);

  const selectPrinter = useCallback((printer: PrinterConfig) => {
    setSelectedPrinter(printer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      selectedPrinter: printer,
    }));
  }, []);

  const printDirect = useCallback(async (content: string): Promise<boolean> => {
    setIsPrinting(true);
    setPrintError(null);
    setHasPrintedSuccessfully(false);

    try {
      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("No se pudo acceder al documento");
      }

      // Write the content with print-specific styles
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Imprimiendo...</title>
            <script>
              function closeAfterPrint() {
                setTimeout(function() {
                  window.frameElement.parentNode.removeChild(window.frameElement);
                }, 1000);
              }
            </script>
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'Courier New', Courier, monospace;
                font-size: 11px;
                width: 80mm;
                margin: 0 auto;
                padding: 3mm;
                line-height: 1.2;
              }
              @media print {
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  width: auto !important;
                  padding: 0 !important;
                }
              }
            </style>
          </head>
          <body onload="window.print(); closeAfterPrint();">
            ${content}
          </body>
        </html>
      `);
      
      iframeDoc.close();

      // Wait for print to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // If we get here, consider it successful
      setHasPrintedSuccessfully(true);
      
      // Clean up iframe after a delay
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          // Iframe may already be removed
        }
      }, 3000);

      return true;
    } catch (error) {
      console.error("Print error:", error);
      setPrintError("Error al imprimir: " + (error as Error).message);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const printWithDialog = useCallback(async (content: string): Promise<boolean> => {
    setIsPrinting(true);
    setPrintError(null);

    try {
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        setPrintError("No se pudo abrir la ventana de impresión");
        return false;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Imprimir</title>
            <style>
              @page { margin: 0; size: auto; }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 11px;
                width: 80mm;
                margin: 0 auto;
                padding: 5mm;
              }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();

      await new Promise(resolve => setTimeout(resolve, 500));
      printWindow.focus();
      printWindow.print();
      
      setHasPrintedSuccessfully(true);
      return true;
    } catch (error) {
      console.error("Print error:", error);
      setPrintError("Error: " + (error as Error).message);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const savePdf = useCallback(async (content: string): Promise<boolean> => {
    setIsPrinting(true);
    setPrintError(null);

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setPrintError("No se pudo abrir la ventana");
        return false;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Recibo</title>
            <style>
              @page { margin: 5mm; }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px;
                width: 80mm;
                margin: 0 auto;
                padding: 10px;
              }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      printWindow.print();
      
      setHasPrintedSuccessfully(true);
      return true;
    } catch (error) {
      console.error("PDF error:", error);
      setPrintError("Error: " + (error as Error).message);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const printReceipt = useCallback(async (content: string): Promise<boolean> => {
    // Try direct print first
    return printDirect(content);
  }, [printDirect]);

  const clearError = useCallback(() => {
    setPrintError(null);
  }, []);

  return {
    printers,
    selectedPrinter,
    selectPrinter,
    printReceipt,
    printDirect,
    printWithDialog,
    savePdf,
    isPrinting,
    printError,
    hasPrintedSuccessfully,
    clearError,
    detectPrinters,
  };
}
