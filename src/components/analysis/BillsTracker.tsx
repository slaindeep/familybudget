import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bill } from "@/lib/types/Bill";
import { Transaction } from "@/lib/types/Transaction";
import { matchBillsWithTransactions } from "@/lib/utils/billMatcher";

interface BillsTrackerProps {
  transactions: Transaction[];
}

export const BillsTracker: React.FC<BillsTrackerProps> = ({ transactions }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [matchedBills, setMatchedBills] = useState<Bill[]>([]);

  useEffect(() => {
    // In production, this would fetch from Google Sheets API
    const sampleBills: Bill[] = [
      {
        date: "11/2/2024",
        description: "Chase Credit Card 1",
        category: "CHASE",
        amount: 200.0,
      },
      // ... other bills
    ];
    setBills(sampleBills);
  }, []);

  useEffect(() => {
    if (bills.length && transactions.length) {
      const matched = matchBillsWithTransactions(bills, transactions);
      setMatchedBills(matched);
    }
  }, [bills, transactions]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bills Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Due Date</th>
                <th className="p-2">Description</th>
                <th className="p-2">Category</th>
                <th className="p-2">Expected Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Payment Date</th>
                <th className="p-2">Actual Amount</th>
              </tr>
            </thead>
            <tbody>
              {matchedBills.map((bill, index) => (
                <tr
                  key={index}
                  className={`border-b ${
                    bill.isPaid ? "bg-green-50" : "bg-yellow-50"
                  }`}
                >
                  <td className="p-2">{formatDate(bill.date)}</td>
                  <td className="p-2">{bill.description}</td>
                  <td className="p-2">{bill.category}</td>
                  <td className="p-2">{formatCurrency(bill.amount)}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        bill.isPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {bill.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="p-2">
                    {bill.actualPaymentDate
                      ? formatDate(bill.actualPaymentDate)
                      : "-"}
                  </td>
                  <td className="p-2">
                    {bill.actualAmount
                      ? formatCurrency(bill.actualAmount)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
