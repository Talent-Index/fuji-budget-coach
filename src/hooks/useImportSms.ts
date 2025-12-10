import { useMutation } from "@tanstack/react-query";

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
    mutationFn: async ({ text, wallet }: { text: string; wallet?: string }): Promise<ImportResult> => {
      const response = await fetch("/api/import/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, wallet }),
      });
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
