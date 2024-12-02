// src/lib/utils/csvParser.ts
import Papa, { ParseResult, ParseError } from "papaparse";
import { Transaction } from "../types/Transaction";

interface RawTransactionRow {
  Date?: string;
  Description?: string;
  Amount?: string;
  "Running Bal."?: string;
  [key: string]: string | undefined;
}

export const parseStatement = async (file: File): Promise<Transaction[]> => {
  console.log("Starting to parse file:", file.name);
  const text = await file.text();
  console.log("File content received:", text.substring(0, 200));

  // First, let's find the actual transaction rows
  const lines = text.split("\n");
  const headerIndex = lines.findIndex((line) =>
    line.startsWith("Date,Description,Amount")
  );

  if (headerIndex === -1) {
    throw new Error(
      "Invalid statement format: Cannot find transaction headers"
    );
  }

  // Get only the transaction portion of the CSV
  const transactionsCsv = lines.slice(headerIndex).join("\n");

  return new Promise<Transaction[]>((resolve, reject) => {
    const parseConfig = {
      header: true,
      skipEmptyLines: "greedy" as const,
      dynamicTyping: false,
      complete(results: ParseResult<RawTransactionRow>) {
        try {
          console.log("Raw parse results:", results);

          if (!results.data || !Array.isArray(results.data)) {
            throw new Error("Invalid CSV data structure");
          }

          // Type assertion for results.data
          const rows = results.data as RawTransactionRow[];

          // Process only valid transaction rows
          const transactions: Transaction[] = rows
            .filter((row) => {
              // Skip summary rows and ensure we have valid data
              return (
                row.Date &&
                row.Description &&
                row.Amount !== undefined &&
                !row.Date.toLowerCase().includes("balance")
              );
            })
            .map((row) => {
              // Process Amount
              const amountStr = String(row.Amount || "").trim();
              const cleanAmount = amountStr.replace(/[,$]/g, "");
              const amount = parseFloat(cleanAmount);

              // Process Running Balance
              const balanceStr = String(row["Running Bal."] || "").trim();
              const cleanBalance = balanceStr.replace(/[,$]/g, "");
              const balance = parseFloat(cleanBalance);

              // Create transaction object
              const transaction: Transaction = {
                date: row.Date || "",
                description: row.Description || "",
                amount: isNaN(amount) ? null : amount,
                runningBalance: isNaN(balance) ? null : balance,
                type: cleanAmount.startsWith("-") ? "debit" : "credit",
                categoryId: null,
              };

              return transaction;
            });

          console.log("Processed transactions:", transactions.slice(0, 2));

          if (transactions.length === 0) {
            console.error("No valid transactions found after processing");
            throw new Error("No valid transactions found in file");
          }

          resolve(transactions);
        } catch (error: unknown) {
          console.error("Processing error:", error);
          reject(
            error instanceof Error
              ? error
              : new Error("Failed to process CSV data")
          );
        }
      },
      error: function (error: ParseError) {
        console.error("Papa Parse error:", error);
        reject(new Error(error.message));
      },
    };

    Papa.parse(transactionsCsv, parseConfig);
  });
};
