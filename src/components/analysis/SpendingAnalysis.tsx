import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/lib/types/Transaction";

interface SpendingAnalysisProps {
  transactions: Transaction[];
}

export const SpendingAnalysis: React.FC<SpendingAnalysisProps> = ({
  transactions,
}) => {
  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        const amount = transaction.amount || 0;
        return {
          credits:
            acc.credits +
            (transaction.type === "credit" ? Math.abs(amount) : 0),
          debits:
            acc.debits + (transaction.type === "debit" ? Math.abs(amount) : 0),
          largest:
            Math.abs(amount) > Math.abs(acc.largest) ? amount : acc.largest,
          smallest:
            Math.abs(amount) < Math.abs(acc.smallest) ? amount : acc.smallest,
        };
      },
      {
        credits: 0,
        debits: 0,
        largest: 0,
        smallest: Number.MAX_VALUE,
      }
    );
  }, [transactions]);

  const dailyTotals = useMemo(() => {
    const totals = transactions.reduce((acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = { date, credit: 0, debit: 0, net: 0 };
      }
      const amount = transaction.amount || 0;
      if (transaction.type === "credit") {
        acc[date].credit += amount;
      } else {
        acc[date].debit += Math.abs(amount);
      }
      acc[date].net = acc[date].credit - acc[date].debit;
      return acc;
    }, {} as Record<string, { date: string; credit: number; debit: number; net: number }>);

    return Object.values(totals).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [transactions]);

  const netChange = summary.credits - summary.debits;
  const averageTransaction =
    transactions.length > 0
      ? (summary.credits + summary.debits) / transactions.length
      : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.credits.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary.debits.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${netChange.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageTransaction.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Totals Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Transaction Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTotals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="credit"
                  stroke="#10B981"
                  name="Credits"
                />
                <Line
                  type="monotone"
                  dataKey="debit"
                  stroke="#EF4444"
                  name="Debits"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#6366F1"
                  name="Net"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpendingAnalysis;
