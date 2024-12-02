// src/lib/ml/billAnalyzer.ts
import { Transaction } from "../types/Transaction";
import _ from "lodash";

export interface Bill {
  description: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
  typical_day: number;
  last_paid_date: string;
  next_due_date: string;
  confidence: number;
}

export class BillAnalyzer {
  private readonly FREQUENCY_THRESHOLD = 2; // Minimum occurrences to identify a pattern
  private readonly AMOUNT_VARIANCE_THRESHOLD = 0.1; // 10% variance allowed for same bill amount
  private readonly HIGH_CONFIDENCE_THRESHOLD = 0.8;

  constructor(private transactions: Transaction[]) {}

  public analyzeBills(): Bill[] {
    // Group transactions by merchant/description
    const groupedTransactions = _.groupBy(this.transactions, "description");
    const bills: Bill[] = [];

    Object.entries(groupedTransactions).forEach(([description, txns]) => {
      // Only consider debits (negative amounts)
      const debits = txns.filter((t) => t.type === "debit");

      if (debits.length >= this.FREQUENCY_THRESHOLD) {
        const frequencyResult = this.analyzeFrequency(debits);

        if (frequencyResult) {
          const amount = this.calculateTypicalAmount(debits);
          const dates = debits.map((t) => new Date(t.date));
          const typicalDay = this.calculateTypicalDay(dates);
          const lastPaidDate =
            _.maxBy(dates, (d) => d.getTime())?.toISOString() || "";

          bills.push({
            description,
            amount: Math.abs(amount),
            frequency: frequencyResult.frequency,
            typical_day: typicalDay,
            last_paid_date: lastPaidDate,
            next_due_date: this.calculateNextDueDate(
              lastPaidDate,
              frequencyResult.frequency,
              typicalDay
            ),
            confidence: frequencyResult.confidence,
          });
        }
      }
    });

    return bills;
  }

  private analyzeFrequency(
    transactions: Transaction[]
  ): {
    frequency: "monthly" | "quarterly" | "annual";
    confidence: number;
  } | null {
    const dates = transactions.map((t) => new Date(t.date));
    const intervals = [];

    for (let i = 1; i < dates.length; i++) {
      const daysDiff = Math.round(
        (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      );
      intervals.push(daysDiff);
    }

    const avgInterval = _.mean(intervals);
    const stdDev = Math.sqrt(
      _.mean(intervals.map((i) => Math.pow(i - avgInterval, 2)))
    );
    const confidence = 1 - stdDev / avgInterval;

    if (confidence < 0.5) return null;

    // Determine frequency based on average interval
    if (avgInterval >= 25 && avgInterval <= 35)
      return { frequency: "monthly", confidence };
    if (avgInterval >= 85 && avgInterval <= 95)
      return { frequency: "quarterly", confidence };
    if (avgInterval >= 350 && avgInterval <= 380)
      return { frequency: "annual", confidence };

    return null;
  }

  private calculateTypicalAmount(transactions: Transaction[]): number {
    const amounts = transactions.map((t) => t.amount || 0);
    return _.mean(amounts);
  }

  private calculateTypicalDay(dates: Date[]): number {
    const days = dates.map((d) => d.getDate());
    return Math.round(_.mean(days));
  }

  private calculateNextDueDate(
    lastPaid: string,
    frequency: "monthly" | "quarterly" | "annual",
    typicalDay: number
  ): string {
    const lastDate = new Date(lastPaid);
    const nextDate = new Date(lastDate);

    switch (frequency) {
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "quarterly":
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case "annual":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    nextDate.setDate(typicalDay);
    return nextDate.toISOString();
  }
}

// src/lib/ml/transactionAnalyzer.ts
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

    // Separate bills into paid and upcoming
    const { paid, upcoming } = _.groupBy(bills, (bill) => {
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
