// src/components/core/StatementUpload.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { parseStatement } from "../../lib/utils/csvParser";
import { Transaction } from "../../lib/types/Transaction";

interface StatementUploadProps {
  onTransactionsLoaded: (transactions: Transaction[]) => void;
}

export const StatementUpload = ({
  onTransactionsLoaded,
}: StatementUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting file upload for:", file.name);
      const transactions = await parseStatement(file);
      console.log("Parsed transactions:", transactions.slice(0, 2));

      if (transactions.length === 0) {
        throw new Error("No valid transactions found in file");
      }

      onTransactionsLoaded(transactions);
    } catch (error) {
      console.error("Error parsing statement:", error);
      setError(
        error instanceof Error ? error.message : "Failed to parse CSV file"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Bank Statement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">CSV file only</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </label>
        </div>
        {isLoading && (
          <div className="mt-4 text-center text-gray-600">
            Processing file...
          </div>
        )}
        {error && <div className="mt-4 text-center text-red-600">{error}</div>}
      </CardContent>
    </Card>
  );
};
