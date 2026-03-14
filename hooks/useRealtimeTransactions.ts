import { useState, useEffect, useRef } from "react";

interface Transaction {
  id: string;
  number: string;
  total?: number;
  amount?: number;
  status?: string;
  clientName?: string;
  description?: string;
  createdAt: string;
}

interface UseRealtimeTransactionsOptions {
  interval?: number; // polling interval in ms
  enabled?: boolean;
}

export function useRealtimeTransactions(options: UseRealtimeTransactionsOptions = {}) {
  const { interval = 5000, enabled = true } = options;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<string>(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTransactions = async () => {
    if (!enabled) return;
    
    try {
      const res = await fetch(`/api/realtime/transactions?since=${lastTimestamp}`);
      if (!res.ok) throw new Error("Error fetching transactions");
      
      const data = await res.json();
      
      if (data.invoices?.length > 0 || data.incomes?.length > 0) {
        const newInvoices = data.invoices.map((inv: any) => ({
          id: inv.id,
          number: inv.number,
          total: inv.total,
          status: inv.status,
          clientName: inv.clientName,
          createdAt: inv.createdAt,
          type: "invoice",
        }));
        
        const newIncomes = data.incomes.map((inc: any) => ({
          id: inc.id,
          number: inc.number,
          amount: inc.amount,
          description: inc.description,
          createdAt: inc.createdAt,
          type: "income",
        }));
        
        const allNew = [...newInvoices, ...newIncomes];
        
        if (allNew.length > 0) {
          setNewTransaction(allNew[0]);
          setTimeout(() => setNewTransaction(null), 5000);
          
          // Update last timestamp
          if (data.timestamp) {
            setLastTimestamp(data.timestamp);
          }
        }
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    
    // Initial fetch
    fetchTransactions();
    
    // Set up polling
    timeoutRef.current = setInterval(fetchTransactions, interval);
    
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [enabled, interval, lastTimestamp]);

  return {
    newTransaction,
    clearNewTransaction: () => setNewTransaction(null),
  };
}