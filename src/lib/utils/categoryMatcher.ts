// src/lib/utils/categoryMatcher.ts
import { Transaction } from "../types/Transaction";
import { Category } from "../types/Category";

export const matchTransactionToCategory = (
  transaction: Transaction,
  categories: Category[]
): string | null => {
  for (const category of categories) {
    const matchesKeyword = category.rules.keywords.some((keyword) =>
      transaction.description.toLowerCase().includes(keyword.toLowerCase())
    );

    const matchesAmount = category.rules.amountRange
      ? (!category.rules.amountRange.min ||
          transaction.amount >= category.rules.amountRange.min) &&
        (!category.rules.amountRange.max ||
          transaction.amount <= category.rules.amountRange.max)
      : true;

    if (matchesKeyword && matchesAmount) {
      return category.id;
    }
  }

  return null;
};
