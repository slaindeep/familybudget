import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Transaction } from "@/lib/types/Transaction";
import { BillAnalyzer, Bill } from "@/lib/ml/billAnalyzer";

interface BillsAnalysisProps {
  transactions: Transaction[];
}

export const BillsAnalysis: React.FC<BillsAnalysisProps> = ({
  transactions,
}) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const analyzer = new BillAnalyzer(transactions);
      const result = analyzer.analyzeBills();
      setBills(result);
    } catch (error) {
      console.error("Error analyzing transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="text-gray-500">Analyzing transactions...</span>
      </div>
    );
  }

  if (bills.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bills.map((bill, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-medium">{bill.description}</span>
                  <span className="text-sm text-gray-500">
                    Due: {new Date(bill.next_due_date).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-semibold">${bill.amount.toFixed(2)}</span>
              </div>
            ))}
            {bills.length === 0 && (
              <p className="text-gray-500 text-sm">
                No upcoming bills detected
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bills.map((bill, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-medium">{bill.description}</span>
                  <span className="text-sm text-gray-500">
                    Paid: {new Date(bill.last_paid_date).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-semibold">${bill.amount.toFixed(2)}</span>
              </div>
            ))}
            {bills.length === 0 && (
              <p className="text-gray-500 text-sm">No recent payments found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
