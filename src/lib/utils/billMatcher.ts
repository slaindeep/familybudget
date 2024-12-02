// src/lib/utils/billMatcher.ts
import { Transaction } from "../types/Transaction";
import { Bill } from "../types/Bill";

export const matchBillsWithTransactions = (
  bills: Bill[],
  transactions: Transaction[]
): Bill[] => {
  return bills.map((bill) => {
    // Convert bill date to a Date object for comparison
    const billDate = new Date(bill.date);
    const monthStart = new Date(billDate.getFullYear(), billDate.getMonth(), 1);
    const monthEnd = new Date(
      billDate.getFullYear(),
      billDate.getMonth() + 1,
      0
    );

    // Find matching transaction
    const matchingTransaction = transactions.find((transaction) => {
      const transactionDate = new Date(transaction.date);
      const descriptionMatch = transaction.description
        .toLowerCase()
        .includes(bill.description.toLowerCase());
      const amountMatch = Math.abs(transaction.amount || 0) === bill.amount;
      const dateInRange =
        transactionDate >= monthStart && transactionDate <= monthEnd;

      return descriptionMatch && amountMatch && dateInRange;
    });

    return {
      ...bill,
      isPaid: !!matchingTransaction,
      actualPaymentDate: matchingTransaction?.date,
      actualAmount: matchingTransaction
        ? Math.abs(matchingTransaction.amount || 0)
        : undefined,
    };
  });
};
