import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import _ from "lodash";

interface Transaction {
  date: string;
  description: string;
  amount: number | null;
  runningBalance: number | null;
}

interface RecurringPattern {
  description: string;
  frequency: number;
  avgAmount: number;
  stdDevAmount: number;
  avgInterval: number;
  stdDevInterval: number;
  isRecurring: boolean;
  category: "expense" | "income";
  transactions: Transaction[];
}

const RecurringTransactionAnalyzer = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringPattern[]
  >([]);

  const analyzeTransactions = (transactions: Transaction[]) => {
    // Group transactions by description
    const groupedByDescription = _.groupBy(transactions, "description");

    // Analyze recurring patterns
    const analyzed = Object.entries(groupedByDescription).map(
      ([description, items]) => {
        const amounts = items.map((t) => Math.abs(t.amount || 0));
        const dates = items.map((t) => new Date(t.date));

        // Calculate intervals between transactions
        const intervals: number[] = [];
        for (let i = 1; i < dates.length; i++) {
          const diffDays =
            (dates[i].getTime() - dates[i - 1].getTime()) /
            (1000 * 60 * 60 * 24);
          intervals.push(diffDays);
        }

        const avgInterval = intervals.length > 0 ? _.mean(intervals) : 0;
        const stdDevInterval =
          intervals.length > 0
            ? Math.sqrt(
                _.mean(_.map(intervals, (i) => Math.pow(i - avgInterval, 2)))
              )
            : 0;

        // Check amount consistency
        const avgAmount = _.mean(amounts);
        const stdDevAmount = Math.sqrt(
          _.mean(_.map(amounts, (a) => Math.pow(a - avgAmount, 2)))
        );

        // Classification logic
        const isRecurring =
          items.length >= 3 && // At least 3 occurrences
          stdDevInterval < 5 && // Consistent timing
          stdDevAmount < avgAmount * 0.1; // Consistent amount

        return {
          description,
          frequency: items.length,
          avgAmount: _.round(avgAmount, 2),
          stdDevAmount: _.round(stdDevAmount, 2),
          avgInterval: _.round(avgInterval, 2),
          stdDevInterval: _.round(stdDevInterval, 2),
          isRecurring,
          category: (amounts[0] < 0 ? "expense" : "income") as
            | "expense"
            | "income",
          transactions: items,
        };
      }
    );

    // Filter and sort recurring transactions
    const recurring = analyzed
      .filter((t) => t.isRecurring)
      .sort((a, b) => b.frequency - a.frequency);

    setRecurringTransactions(recurring);
  };

  // Analyze transactions when they change
  React.useEffect(() => {
    if (transactions.length > 0) {
      analyzeTransactions(transactions);
    }
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recurring Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Average Amount</TableHead>
              <TableHead>Interval (days)</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurringTransactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.frequency}x</TableCell>
                <TableCell>{formatCurrency(transaction.avgAmount)}</TableCell>
                <TableCell>{transaction.avgInterval}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      transaction.category === "expense"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {transaction.category}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecurringTransactionAnalyzer;
