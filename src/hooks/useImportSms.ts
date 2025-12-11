import { useMutation } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export interface ParsedTransaction {
  date?: string;
  description: string;
  amount: number;
  currency?: string;
  category?: string;
}

export interface ImportResult {
  transactions: ParsedTransaction[];
  totalsByCategory: Record<string, number>;
  weeklyTotals: { weekLabel: string; total: number }[];
  optimizedBudget: Record<string, number>;
  summary: string;
}

export function useImportSms() {
  return useMutation({
    mutationFn: async ({
      text,
      wallet,
    }: {
      text: string;
      wallet?: string;
    }): Promise<ImportResult> => {
      // If VITE_API_URL is set (Vercel/Render), use that.
      // Otherwise, fall back to relative path for local dev.
      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/import/sms`
        : "/api/import/sms";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, wallet }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const textBody = await response.text();
        console.error("Non-JSON response from SMS import:", {
          status: response.status,
          bodyPreview: textBody.slice(0, 300),
        });
        throw new Error(
          "Unexpected response from SMS import service. The backend may not be reachable."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse transactions");
      }

      return {
        transactions: data.transactions || [],
        totalsByCategory: data.totalsByCategory || {},
        weeklyTotals: data.weeklyTotals || [],
        optimizedBudget: data.optimizedBudget || {},
        summary: data.summary || "",
      };
    },
  });
}
