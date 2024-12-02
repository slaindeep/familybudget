import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseStatement } from "@/lib/utils/csvParser";
import type { Transaction } from "@/lib/types/Transaction";

interface FixedExpense {
  description: string;
  expectedAmount: number;
  actualAmount: number | null;
  status: "verified" | "missing" | "different";
  difference: number;
}

interface Props {
  onTransactionsLoaded?: (transactions: Transaction[]) => void;
}

export const FixedExpensesDashboard: React.FC<Props> = ({
  onTransactionsLoaded,
}) => {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processStatement = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const transactions = await parseStatement(file);

      // Create expense map from transactions
      const expenseMap = transactions.reduce(
        (acc: Record<string, number>, curr) => {
          if (curr.amount !== null) {
            // Using absolute value for amount comparison
            const amount = Math.abs(curr.amount);
            acc[curr.description] = amount;
          }
          return acc;
        },
        {}
      );

      // Convert to FixedExpense array
      const processedExpenses: FixedExpense[] = Object.entries(expenseMap).map(
        ([description, amount]) => ({
          description,
          expectedAmount: amount, // This would come from Google Sheets later
          actualAmount: amount,
          status: "verified", // This would be calculated based on comparison with expected
          difference: 0, // This would be calculated based on comparison
        })
      );

      setExpenses(processedExpenses);
      if (onTransactionsLoaded) {
        onTransactionsLoaded(transactions);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process statement"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processStatement(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Fixed Expenses Dashboard</h2>
        <div className="mt-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-violet-50 file:text-violet-700
                            hover:file:bg-violet-100"
            disabled={isLoading}
          />
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : expenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Expected Amount</TableHead>
                <TableHead className="text-right">Actual Amount</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense, index) => (
                <TableRow key={`${expense.description}-${index}`}>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="text-right">
                    ${expense.expectedAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {expense.actualAmount
                      ? `$${expense.actualAmount.toFixed(2)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      expense.difference > 0
                        ? "text-red-600"
                        : expense.difference < 0
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    {expense.difference !== 0
                      ? `${expense.difference > 0 ? "+" : ""}$${Math.abs(
                          expense.difference
                        ).toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expense.status === "verified"
                          ? "bg-green-100 text-green-800"
                          : expense.status === "missing"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {expense.status.charAt(0).toUpperCase() +
                        expense.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Upload a statement to see expense analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FixedExpensesDashboard;
