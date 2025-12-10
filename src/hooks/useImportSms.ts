import { useMutation } from "@tanstack/react-query";

export interface ParsedTransaction {
  date?: string;
  description: string;
  amount: number;
  currency?: string;
  category?: string;
}

export function useImportSms() {
  return useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch("/api/import/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse transactions");
      }
      return data.transactions as ParsedTransaction[];
    },
  });
}
