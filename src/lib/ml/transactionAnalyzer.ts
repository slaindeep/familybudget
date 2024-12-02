// src/lib/ml/transactionAnalyzer.ts

import { Transaction } from "../types/Transaction";
import { BillAnalyzer, Bill } from "./billAnalyzer";
import groupBy from "lodash/groupBy";

export interface AnalyzedBills {
  paid: Bill[];
  upcoming: Bill[];
  total_monthly: number;
}

export class TransactionAnalyzer {
  constructor(private transactions: Transaction[]) {}

  public analyzeMonthlyExpenses(): AnalyzedBills {
    const analyzer = new BillAnalyzer(this.transactions);
    const bills = analyzer.analyzeBills();
    const today = new Date();

    const { paid, upcoming } = groupBy(bills, (bill) => {
      const dueDate = new Date(bill.next_due_date);
      return dueDate < today ? "paid" : "upcoming";
    });

    // Calculate total monthly expenses
    const monthlyTotal = bills.reduce((sum, bill) => {
      const multiplier =
        bill.frequency === "monthly"
          ? 1
          : bill.frequency === "quarterly"
          ? 1 / 3
          : 1 / 12;
      return sum + bill.amount * multiplier;
    }, 0);

    return {
      paid: paid || [],
      upcoming: upcoming || [],
      total_monthly: monthlyTotal,
    };
  }
}
