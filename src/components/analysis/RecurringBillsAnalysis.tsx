import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import _ from "lodash";
import { Transaction } from "@/lib/types/Transaction";

interface RecurringTransaction {
  amount: number;
  description: string;
  occurrences: number;
  dates: string[];
  isMonthly: boolean;
}

interface RecurringBillsAnalyzerProps {
  transactions: Transaction[];
}

export const RecurringBillsAnalyzer: React.FC<RecurringBillsAnalyzerProps> = ({
  transactions,
}) => {
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!Array.isArray(transactions) || transactions.length === 0) {
        setError("No transaction data available");
        setIsLoading(false);
        return;
      }

      // Group by amount and description to find recurring patterns
      const grouped = _.groupBy(
        transactions,
        (transaction) =>
          `${Math.abs(transaction.amount || 0).toFixed(2)}_${
            transaction.description
          }`
      );

      const recurring: RecurringTransaction[] = Object.entries(grouped)
        .map(([key, occurrences]) => {
          const [amountStr] = key.split("_");
          const amount = parseFloat(amountStr);

          if (isNaN(amount) || occurrences.length < 2) return null;

          const dates = occurrences
            .map((t) => new Date(t.date))
            .sort((a, b) => a.getTime() - b.getTime());

          // Check if transactions occur monthly
          const isMonthly =
            dates.length >= 2 &&
            dates.some((date, i) => {
              if (i === 0) return false;
              const prevDate = dates[i - 1];
              const monthsDiff =
                date.getMonth() -
                prevDate.getMonth() +
                12 * (date.getFullYear() - prevDate.getFullYear());
              return monthsDiff === 1;
            });

          return {
            amount,
            description: occurrences[0].description,
            occurrences: occurrences.length,
            dates: occurrences.map((t) => t.date),
            isMonthly,
          };
        })
        .filter(
          (item): item is RecurringTransaction =>
            item !== null && item.amount > 0 && item.occurrences >= 2
        )
        .sort((a, b) => b.occurrences - a.occurrences);

      setRecurringTransactions(recurring);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze transactions"
      );
      setIsLoading(false);
    }
  }, [transactions]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center">
            <span className="loading">Analyzing transactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Bills Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recurringTransactions.slice(0, 10).map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{item.description}</h3>
                  <p className="text-sm text-gray-500">
                    {item.isMonthly ? "Monthly payment" : "Recurring payment"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {item.occurrences} occurrences
                  </p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Last transaction:{" "}
                {new Date(
                  item.dates[item.dates.length - 1]
                ).toLocaleDateString()}
              </div>
            </div>
          ))}
          {recurringTransactions.length === 0 && (
            <div className="text-center text-gray-500">
              No recurring transactions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurringBillsAnalyzer;
