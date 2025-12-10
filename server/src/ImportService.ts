import OpenAI from "openai";

export interface ParsedTransaction {
  date?: string;
  description: string;
  amount: number;
  currency?: string;
  category?: string;
}

export interface ImportResult {
  success: boolean;
  transactions?: ParsedTransaction[];
  error?: string;
}

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export async function parseSmsTransactions(text: string): Promise<ImportResult> {
  const openai = getOpenAI();
  if (!openai) {
    return {
      success: false,
      error: "OpenAI API key not configured",
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a transaction parser. Extract financial transactions from SMS messages or bank notifications.
          
Return a JSON array of transactions with these fields:
- date: string (ISO date if parseable, otherwise null)
- description: string (merchant name or transaction description)
- amount: number (positive for income, negative for expenses)
- currency: string (3-letter code like USD, EUR, or null)
- category: string (one of: food, transport, shopping, bills, entertainment, transfer, income, other)

Only return the JSON array, no other text.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "No response from AI" };
    }

    const parsed = JSON.parse(content);
    const transactions: ParsedTransaction[] = Array.isArray(parsed)
      ? parsed
      : parsed.transactions || [];

    return { success: true, transactions };
  } catch (error: any) {
    console.error("SMS parsing error:", error);
    return {
      success: false,
      error: error.message || "Failed to parse transactions",
    };
  }
}
