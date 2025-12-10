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

const avatarLabelMap: Record<number, string> = {
  0: "Seed not planted",
  1: "Seedling",
  2: "Small plant",
  3: "Growing tree",
  4: "Flowering tree",
  5: "Legendary glowing tree",
};

const avatarDescMap: Record<number, string> = {
  0: "[seed]",
  1: "[seedling]",
  2: "[small plant]",
  3: "[growing tree]",
  4: "[flowering tree]",
  5: "[legendary tree]",
};

function buildTreeNarrative(profile: ProfileData): string {
  const { bp, currentStreak, avatarLevel, bpEarned } = profile;
  const avatarLabel = avatarLabelMap[avatarLevel] ?? "Seedling";
  const avatarDesc = avatarDescMap[avatarLevel] ?? "[seedling]";

  let narrative = `Your Money Tree is currently at Level ${avatarLevel} - ${avatarLabel} ${avatarDesc}.`;

  if (bpEarned && bpEarned > 0) {
    narrative += ` You just earned ${bpEarned} new Budget Points (BP), bringing you to ${bp} BP total.`;
  } else {
    narrative += ` You now have ${bp} Budget Points (BP) in total.`;
  }

  if (avatarLevel >= 4 && currentStreak >= 5) {
    narrative += " Your Flowering Tree is glowing today because you've kept a strong streak going!";
  } else if (currentStreak >= 3) {
    narrative += ` Your streak is ${currentStreak} days - your tree is growing steadily.`;
  } else if (currentStreak === 1) {
    narrative += " This is the first day of your new streak - keep coming back to help your tree grow.";
  }

  return narrative;
}

interface ProfileData {
  bp: number;
  currentStreak: number;
  bestStreak: number;
  avatarLevel: number;
  totalInsights: number;
  bpEarned?: number;
}

export interface BudgetInsightRequest {
  text: string;
  monthlyIncome?: number;
  currency?: string;
  location?: string;
  profile?: ProfileData;
}

export interface BudgetInsightResponse {
  success: boolean;
  insight?: string;
  error?: string;
}

export async function generateBudgetInsight(
  request: BudgetInsightRequest
): Promise<BudgetInsightResponse> {
  const profile = request.profile || {
    bp: 0,
    currentStreak: 0,
    bestStreak: 0,
    avatarLevel: 0,
    totalInsights: 0,
  };
  
  const treeNarrative = buildTreeNarrative(profile);
  const avatarLabel = avatarLabelMap[profile.avatarLevel] ?? "Seedling";

  const openai = getOpenAI();
  if (!openai) {
    const income = request.monthlyIncome || 5000;
    return {
      success: true,
      insight: `Based on your monthly income of ${request.currency || "USD"} ${income} in ${request.location || "your area"}:

**Budget Recommendation (50/30/20 Rule):**
- Needs (50%): ~${Math.round(income * 0.5)} for rent, bills, groceries
- Wants (30%): ~${Math.round(income * 0.3)} for entertainment, dining out
- Savings (20%): ~${Math.round(income * 0.2)} for emergency fund, investments

**Key Tips:**
1. Build an emergency fund covering 3-6 months of expenses
2. Track your spending to identify areas for optimization
3. Consider local cost-of-living factors

**Money Tree update**
${treeNarrative}

To level up your tree: Keep requesting insights daily to build your streak, and earn more BP!

**Next 7 days:**
- Track all expenses in a simple note or app
- Set up automatic transfers to savings on payday
- Review one subscription you might not need

*This insight was generated as a demo. Connect OpenAI for personalized AI-powered advice!*`,
    };
  }

  try {
    const systemPrompt = `You are "Fuji Budget Coach", an AI budgeting assistant for early crypto users.

CONTEXT:
- Users pay small microtransactions in USDC via x402 on Avalanche to get each insight.
- User location: ${request.location || "Not specified"}
- Preferred currency: ${request.currency || "USD"}

GAMIFICATION:
- The user has a Money Tree avatar that grows with good habits.
- Data you have:
  - Total Budget Points (BP): ${profile.bp}
  - Current streak (days with at least one insight): ${profile.currentStreak}
  - Best streak: ${profile.bestStreak}
  - Total insights so far: ${profile.totalInsights}
  - Avatar level: ${profile.avatarLevel} (${avatarLabel})
  - BP earned in this call: ${profile.bpEarned ?? "unknown"}
- Here is a concrete sentence you MUST include verbatim in the "Money Tree update" section:
  "${treeNarrative}"

BEHAVIOUR:
- Give practical, non-jargony budgeting advice.
- Focus on allocations, simple rules (50/30/20 etc.), and 1-3 concrete adjustments.
- DO NOT give legal, tax, or specific investment advice.
- DO NOT ask the user to send funds anywhere.
- Keep the answer under ~260 words.

OUTPUT STRUCTURE (text, not JSON):
1. Friendly one-line summary.
2. Clear budget breakdown (percentages + example amounts).
3. 1-3 problem areas and how to fix them.
4. A dedicated section titled "Money Tree update" (exact title):
   - Include the treeNarrative sentence above.
   - Briefly explain what the current level means and how to level up.
5. A short bullet list titled "Next 7 days" with exactly 3 bullets.`;

    const userPrompt = `User message:
${request.text || "Help me build a monthly budget."}

Structured context:
- Monthly income: ${request.monthlyIncome ? `${request.monthlyIncome} ${request.currency || "USD"}` : "not specified"}
- Location: ${request.location || "Not specified"}
- Currency: ${request.currency || "USD"}
- Total insights so far: ${profile.totalInsights}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
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
