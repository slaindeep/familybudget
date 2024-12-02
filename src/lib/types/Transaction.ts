export interface Transaction {
  date: string;
  description: string;
  amount: number | null;
  runningBalance: number | null;
  type: "credit" | "debit";
  categoryId?: string | null;
  notes?: string; // New property added
}

export interface RawTransactionRow {
  Date: string;
  Description: string;
  Amount: string;
  "Running Bal.": string;
}

export interface CategorizedTransaction extends Transaction {
  categoryId: string | null;
}
