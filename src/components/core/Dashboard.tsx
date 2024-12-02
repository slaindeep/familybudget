import React, { useState } from "react";
import { SystemTest } from "./SystemTest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatementUpload } from "./StatementUpload";
import { TransactionTable } from "./TransactionTable";
import { BillsTracker } from "../analysis/BillsTracker";
import { Transaction } from "@/lib/types/Transaction";
import * as TabsPrimitive from "@/components/ui/tabs"; // Change this line

export const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleTransactionsLoaded = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Budget Dashboard</h1>

      <div className="mb-6">
        <StatementUpload onTransactionsLoaded={handleTransactionsLoaded} />
      </div>

      {transactions.length > 0 && (
        <TabsPrimitive.Tabs defaultValue="bills" className="space-y-4">
          <TabsPrimitive.TabsList>
            <TabsPrimitive.TabsTrigger value="bills">
              Bills Tracker
            </TabsPrimitive.TabsTrigger>
            <TabsPrimitive.TabsTrigger value="transactions">
              All Transactions
            </TabsPrimitive.TabsTrigger>
            <TabsPrimitive.TabsTrigger value="test">
              System Test
            </TabsPrimitive.TabsTrigger>
          </TabsPrimitive.TabsList>

          <TabsPrimitive.TabsContent value="bills">
            <BillsTracker transactions={transactions} />
          </TabsPrimitive.TabsContent>

          <TabsPrimitive.TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTable transactions={transactions} />
              </CardContent>
            </Card>
          </TabsPrimitive.TabsContent>

          <TabsPrimitive.TabsContent value="test">
            <SystemTest />
          </TabsPrimitive.TabsContent>
        </TabsPrimitive.Tabs>
      )}
    </div>
  );
};

export default Dashboard;
