import { Bill } from "../types/Bill";

export class GoogleSheetsService {
  // Use import.meta.env instead of process.env for Vite
  private static API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
  private static SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;

  static async fetchBills(): Promise<Bill[]> {
    try {
      if (!this.API_KEY || !this.SPREADSHEET_ID) {
        throw new Error(
          "Missing API key or Spreadsheet ID in environment variables"
        );
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/Bills!A:D?key=${this.API_KEY}`
      );

      if (!response.ok) throw new Error("Failed to fetch from Google Sheets");

      const data = await response.json();

      // Skip header row and convert to Bill objects
      return data.values.slice(1).map((row: string[]) => ({
        date: row[0],
        description: row[1],
        category: row[2],
        amount: parseFloat(row[3].replace(/[^0-9.-]+/g, "")),
      }));
    } catch (error) {
      console.error("Error fetching bills:", error);
      return [];
    }
  }
}
