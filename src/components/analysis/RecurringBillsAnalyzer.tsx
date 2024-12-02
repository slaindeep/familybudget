import React, { useEffect, useState } from "react";
import { Transaction } from "@/lib/types/Transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecurringBill {
  description: string;
  amount: number;
  frequency: string;
  lastDate: string;
  nextDueDate: string | null;
}

interface RecurringBillsAnalyzerProps {
  transactions: Transaction[];
}

export const RecurringBillsAnalyzer: React.FC<RecurringBillsAnalyzerProps> = ({
  transactions,
}) => {
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);

  useEffect(() => {
    // Analyze transactions for recurring patterns
    const bills = detectRecurringBills(transactions);
    setRecurringBills(bills);
  }, [transactions]);

  const detectRecurringBills = (
    transactions: Transaction[]
  ): RecurringBill[] => {
    const transactionMap = new Map<string, Transaction[]>();

    // Group transactions by description
    transactions.forEach((transaction) => {
      if (transaction.type === "debit") {
        const key = transaction.description.trim();
        const existing = transactionMap.get(key) || [];
        transactionMap.set(key, [...existing, transaction]);
      }
    });

    // Analyze patterns
    const bills: RecurringBill[] = [];
    transactionMap.forEach((transactions, description) => {
      if (transactions.length >= 2) {
        const amounts = transactions.map((t) => t.amount);
        const uniqueAmounts = new Set(amounts);

        if (uniqueAmounts.size === 1) {
          const amount = amounts[0] || 0;
          const dates = transactions.map((t) => new Date(t.date));
          const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());

          bills.push({
            description,
            amount: Math.abs(amount),
            frequency: determineFrequency(sortedDates),
            lastDate: sortedDates[0].toISOString().split("T")[0],
            nextDueDate: predictNextDueDate(sortedDates),
          });
        }
      }
    });

    return bills;
  };

  const determineFrequency = (dates: Date[]): string => {
    if (dates.length < 2) return "Unknown";

    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      const days = Math.round(
        (dates[i - 1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24)
      );
      intervals.push(days);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    if (avgInterval >= 28 && avgInterval <= 31) return "Monthly";
    if (avgInterval >= 13 && avgInterval <= 15) return "Bi-weekly";
    if (avgInterval >= 6 && avgInterval <= 8) return "Weekly";
    return "Variable";
  };

  const predictNextDueDate = (dates: Date[]): string | null => {
    if (dates.length < 2) return null;

    const frequency = determineFrequency(dates);
    const lastDate = dates[0];

    let daysToAdd = 0;
    switch (frequency) {
      case "Monthly":
        daysToAdd = 30;
        break;
      case "Bi-weekly":
        daysToAdd = 14;
        break;
      case "Weekly":
        daysToAdd = 7;
        break;
      default:
        return null;
    }

    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate.toISOString().split("T")[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recurringBills.map((bill, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{bill.description}</h3>
              <p className="text-sm text-gray-600">
                Amount: ${bill.amount.toFixed(2)} • Frequency: {bill.frequency}
              </p>
              <p className="text-sm text-gray-600">
                Last payment: {bill.lastDate}
                {bill.nextDueDate && ` • Next due: ${bill.nextDueDate}`}
              </p>
            </div>
          ))}
          {recurringBills.length === 0 && (
            <p className="text-center text-gray-500">
              No recurring bills detected yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
