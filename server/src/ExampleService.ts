import OpenAI from "openai";

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

export interface BudgetInsightRequest {
  text: string;
  monthlyIncome?: number;
  currency?: string;
  location?: string;
}

export interface BudgetInsightResponse {
  success: boolean;
  insight?: string;
  error?: string;
}

export async function generateBudgetInsight(
  request: BudgetInsightRequest
): Promise<BudgetInsightResponse> {
  const openai = getOpenAI();
  if (!openai) {
    return {
      success: true,
      insight: `Based on your monthly income of ${request.currency || "USD"} ${request.monthlyIncome || "N/A"} in ${request.location || "your area"}:

**Budget Recommendation:**
- Housing: 30% (~${Math.round((request.monthlyIncome || 0) * 0.3)})
- Food & Groceries: 15% (~${Math.round((request.monthlyIncome || 0) * 0.15)})
- Transportation: 10% (~${Math.round((request.monthlyIncome || 0) * 0.1)})
- Utilities: 5% (~${Math.round((request.monthlyIncome || 0) * 0.05)})
- Savings & Investments: 20% (~${Math.round((request.monthlyIncome || 0) * 0.2)})
- Entertainment: 10% (~${Math.round((request.monthlyIncome || 0) * 0.1)})
- Miscellaneous: 10% (~${Math.round((request.monthlyIncome || 0) * 0.1)})

**Key Tips:**
1. Build an emergency fund covering 3-6 months of expenses
2. Consider local cost-of-living factors
3. Track your spending to identify areas for optimization

This insight was generated as a demo. Connect OpenAI for personalized AI-powered advice!`,
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert personal finance advisor. Provide helpful, actionable budget advice tailored to the user's situation. Be concise but thorough. Format your response with markdown for readability.`,
        },
        {
          role: "user",
          content: `My situation: ${request.text}
          
Monthly Income: ${request.currency || "USD"} ${request.monthlyIncome || "Not specified"}
Location: ${request.location || "Not specified"}

Please provide personalized budgeting advice and recommendations.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const insight = response.choices[0]?.message?.content;
    if (!insight) {
      return { success: false, error: "No response from AI" };
    }

    return { success: true, insight };
  } catch (error: any) {
    console.error("Budget insight error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate insight",
    };
  }
}
