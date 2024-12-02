// src/components/core/SystemTest.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runSystemCheck } from "@/lib/tests/systemCheck";

export const SystemTest: React.FC = () => {
  interface TestResults {
    success: boolean;
    error?: string;
    checks?: {
      env: boolean;
      googleSheets: boolean;
      components: boolean;
    };
  }

  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      try {
        const results = await runSystemCheck();
        setTestResults(results);
      } catch (error) {
        console.error("Error running tests:", error);
        setTestResults({ success: false, error: String(error) });
      } finally {
        setIsLoading(false);
      }
    };

    runTests();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center">Running system checks...</div>
        ) : testResults ? (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${
                testResults.success ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <h3 className="font-semibold">
                Overall Status: {testResults.success ? "PASS ✅" : "FAIL ❌"}
              </h3>
            </div>
            {testResults.checks && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>Environment Variables:</div>
                  <div>{testResults.checks.env ? "✅" : "❌"}</div>
                  <div>Google Sheets API:</div>
                  <div>{testResults.checks.googleSheets ? "✅" : "❌"}</div>
                  <div>Components:</div>
                  <div>{testResults.checks.components ? "✅" : "❌"}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-red-500">Failed to run system checks</div>
        )}
      </CardContent>
    </Card>
  );
};
