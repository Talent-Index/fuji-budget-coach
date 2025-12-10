import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, MapPin, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICE_USDC } from "@/lib/thirdweb";

interface BudgetFormProps {
  onSubmit: (data: {
    text: string;
    monthlyIncome: number;
    currency: string;
    location: string;
  }) => void;
  isLoading: boolean;
  isConnected: boolean;
}

export function BudgetForm({ onSubmit, isLoading, isConnected }: BudgetFormProps) {
  const [income, setIncome] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [location, setLocation] = useState("");
  const [goals, setGoals] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const text = `My monthly income is ${income} ${currency}${location ? ` and I live in ${location}` : ""}. ${goals || "Help me create a monthly budget."}`;

    onSubmit({
      text,
      monthlyIncome: parseFloat(income) || 0,
      currency,
      location,
    });
  };

  const currencies = [
    { code: "USD", label: "$ USD" },
    { code: "KES", label: "KSh KES" },
    { code: "EUR", label: "€ EUR" },
    { code: "GBP", label: "£ GBP" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card variant="gradient" className="overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Get Your Budget Insight</CardTitle>
              <CardDescription>AI-powered budgeting for ${PRICE_USDC.toFixed(2)} USDC</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Income Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Monthly Income
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="5000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Location (optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nairobi, Kenya"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                What do you want to achieve?
              </label>
              <textarea
                placeholder="e.g., Save for a trip, pay off debt, build an emergency fund..."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="flex min-h-[100px] w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full gap-2"
                disabled={isLoading || !isConnected || !income}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Get Insight for ${PRICE_USDC.toFixed(2)} USDC
                  </>
                )}
              </Button>

              {!isConnected && (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Connect your wallet to continue
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
