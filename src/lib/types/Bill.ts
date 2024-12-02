// src/lib/types/Bill.ts
export interface Bill {
  date: string;
  description: string;
  category: string;
  amount: number;
  isPaid?: boolean;
  actualPaymentDate?: string;
  actualAmount?: number;
}
