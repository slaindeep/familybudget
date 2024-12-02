// src/lib/types/Category.ts
export interface Category {
  id: string;
  name: string;
  color: string;
  rules: {
    keywords: string[];
    amountRange?: {
      min?: number;
      max?: number;
    };
  };
}
