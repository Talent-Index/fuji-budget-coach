import OpenAI from "openai";

export interface ParsedTransaction {
  date?: string;
  description: string;
  amount: number;
  currency?: string;
  category?: string;
}

export interface ImportAnalysis {
  transactions: ParsedTransaction[];
  totalsByCategory: Record<string, number>;
  weeklyTotals: { weekLabel: string; total: number }[];
  optimizedBudget: Record<string, number>;
  summary: string;
}

export interface ImportResult {
  success: boolean;
  data?: ImportAnalysis;
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

export async function parseAndAnalyze(text: string): Promise<ImportResult> {
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
          content:
            "You are a finance parser that reads SMS-like bank / mobile money alerts and extracts clean JSON transaction data.",
        },
        {
          role: "user",
          content: `
Parse the following messages into a JSON object with this EXACT shape:

{
  "transactions": [
    {
      "date": "YYYY-MM-DD or null",
      "description": "string",
      "amount": number,
      "currency": "string or null",
      "category": "Food | Rent | Transport | Bills | Groceries | Shopping | Entertainment | Income | Other"
    }
  ],
  "analysis": {
    "totalsByCategory": {
      "Food": number,
      "Rent": number,
      "Transport": number,
      "...": number
    },
    "weeklyTotals": [
      {
        "weekLabel": "YYYY-Www or 'Unknown'",
        "total": number
      }
    ],
    "optimizedBudget": {
      "Needs": number,
      "Wants": number,
      "Savings": number
    },
    "insights": [
      "Short bullet about where the user spends a lot",
      "Short bullet about where they could cut back or adjust"
    ]
  }
}

Rules:
- Guess reasonable categories from the messages.
- Group transactions into weeklyTotals by weekLabel if dates are present, else put under 'Unknown'.
- optimizedBudget is a 50/30/20 or similar breakdown, tuned to their spending pattern.
- Return ONLY valid JSON, no commentary.

Messages:
${text}
`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 1400,
    });

    const raw = response.choices[0].message.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse JSON from ImportService:", e, raw);
      return {
        success: false,
        error: "Model did not return valid JSON.",
      };
    }

    const txs: ParsedTransaction[] = parsed.transactions || [];
    const analysis = parsed.analysis || {};
    const totalsByCategory: Record<string, number> =
      analysis.totalsByCategory || {};
    const weeklyTotals: { weekLabel: string; total: number }[] =
      analysis.weeklyTotals || [];
    const optimizedBudget: Record<string, number> =
      analysis.optimizedBudget || {};
    const insights: string[] = analysis.insights || [];

    const summary =
      insights.length > 0
        ? insights.join(" ")
        : "Here are your recent transactions, category totals, and a suggested budget breakdown.";

    return {
      success: true,
      data: {
        transactions: txs,
        totalsByCategory,
        weeklyTotals,
        optimizedBudget,
        summary,
      },
    };
  } catch (error: any) {
    console.error("Error parsing SMS transactions:", error);
    return {
      success: false,
      error: error.message || "Failed to parse SMS transactions",
    };
  }
}

export async function parseSmsTransactions(text: string): Promise<ImportResult> {
  return parseAndAnalyze(text);
}
