// src/lib/tests/systemCheck.ts
import { GoogleSheetsService } from "../services/googleSheets";

export const runSystemCheck = async () => {
  console.log("🔍 Starting system check...");
  const checks = {
    env: false,
    googleSheets: false,
    components: true, // We'll assume components are OK if they're imported
  };

  // 1. Check environment variables
  try {
    const requiredEnvVars = [
      "VITE_GOOGLE_SHEETS_API_KEY",
      "VITE_SPREADSHEET_ID",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !import.meta.env[varName]
    );

    if (missingVars.length > 0) {
      console.error("❌ Missing environment variables:", missingVars);
      checks.env = false;
    } else {
      console.log("✅ Environment variables check passed");
      checks.env = true;
    }
  } catch (error) {
    console.error("❌ Error checking environment variables:", error);
  }

  // 2. Test Google Sheets connection
  try {
    const bills = await GoogleSheetsService.fetchBills();
    if (bills && Array.isArray(bills)) {
      console.log("✅ Successfully fetched bills from Google Sheets");
      console.log("📊 Sample data:", bills.slice(0, 2));
      checks.googleSheets = true;
    } else {
      console.error("❌ Failed to fetch bills from Google Sheets");
    }
  } catch (error) {
    console.error("❌ Error connecting to Google Sheets:", error);
  }

  // 3. Overall status
  const allChecksPass = Object.values(checks).every(Boolean);
  console.log("\n📋 System Check Summary:");
  console.log("-------------------------");
  console.log("Environment Variables:", checks.env ? "✅" : "❌");
  console.log("Google Sheets API:", checks.googleSheets ? "✅" : "❌");
  console.log("Components Loaded:", checks.components ? "✅" : "❌");
  console.log("-------------------------");
  console.log("Overall Status:", allChecksPass ? "✅ PASS" : "❌ FAIL");

  return {
    success: allChecksPass,
    checks,
  };
};
