// src/hooks/useTransactions.ts
import { useState, useCallback } from "react";
import { Transaction } from "@/lib/types/Transaction";
import { parseStatement } from "@/lib/utils/csvParser";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseStatement(file);
      setTransactions(parsed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse transactions"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { transactions, isLoading, error, loadTransactions };
};
