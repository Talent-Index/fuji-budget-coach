import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, ArrowDown, ArrowUp, TrendingUp, PieChart, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useImportSms, ImportResult, ParsedTransaction } from "@/hooks/useImportSms";

const categoryColors: Record<string, string> = {
  Food: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  Groceries: "bg-lime-500/20 text-lime-300 border-lime-500/40",
  Rent: "bg-red-500/20 text-red-300 border-red-500/40",
  Bills: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  Transport: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  Shopping: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  Entertainment: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  Income: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  Other: "bg-muted text-muted-foreground border-border",
};

function getCategoryColor(category?: string) {
  if (!category) return categoryColors.Other;
  const key = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return categoryColors[key] || categoryColors.Other;
}

function formatAmount(amount: number, currency?: string) {
  const curr = currency || "USD";
  return `${curr} ${Math.abs(amount).toLocaleString()}`;
}

export function SmsImportCard() {
  const [smsText, setSmsText] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const importSms = useImportSms();

  const handleParse = async () => {
    if (!smsText.trim()) {
      toast.error("Please paste some SMS messages");
      return;
    }
    try {
      const data = await importSms.mutateAsync(smsText);
      setResult(data);
      toast.success(`Parsed ${data.transactions.length} transactions`);
    } catch (error: any) {
      toast.error(error.message || "Failed to parse SMS");
    }
  };

  const handleClear = () => {
    setSmsText("");
    setResult(null);
  };

  const transactions = result?.transactions ?? [];

  return (
    <Card variant="gradient" className="w-full" data-testid="card-sms-import">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          SMS Import
        </CardTitle>
        <CardDescription>
          Paste bank SMS notifications to extract transactions, spending hotspots, and get an optimized budget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your SMS messages here...

Example:
M-PESA confirmed. Ksh 500 sent to SHOPRITE on 10/12/24.
Bank alert: $50.00 debited at Starbucks on Dec 10
Transfer of $1000 received from John Doe"
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          className="min-h-[120px] resize-none"
          data-testid="textarea-sms"
        />

        <div className="flex gap-2">
          <Button
            onClick={handleParse}
            disabled={importSms.isPending || !smsText.trim()}
            className="flex-1"
            data-testid="button-parse-sms"
          >
            {importSms.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Parsing...
              </>
            ) : (
              "Parse Transactions"
            )}
          </Button>
          {result && (
            <Button variant="outline" onClick={handleClear} data-testid="button-clear-sms">
              Clear
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            {result.summary && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  AI Analysis
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.summary}
                </p>
              </div>
            )}

            {Object.keys(result.totalsByCategory).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <PieChart className="w-4 h-4 text-primary" />
                  Category Totals
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.totalsByCategory).map(([cat, amt]) => {
                    const colorClass = getCategoryColor(cat);
                    return (
                      <span
                        key={cat}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs border ${colorClass}`}
                      >
                        <span>{cat}</span>
                        <span className="opacity-80">{amt.toLocaleString()}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {result.weeklyTotals && result.weeklyTotals.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  Weekly Spending Heatmap
                </div>
                <div className="space-y-1">
                  {result.weeklyTotals.map((w) => {
                    const max = Math.max(
                      ...result.weeklyTotals.map((x) => x.total || 0),
                      1
                    );
                    const width = Math.max(5, (w.total / max) * 100);
                    return (
                      <div key={w.weekLabel} className="flex items-center gap-2">
                        <span className="w-20 text-xs text-muted-foreground truncate">
                          {w.weekLabel}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/80"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-xs text-muted-foreground">
                          {w.total.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result.optimizedBudget && Object.keys(result.optimizedBudget).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Auto-Budget Suggestion
                </div>
                <div className="space-y-1 text-sm">
                  {Object.entries(result.optimizedBudget).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-muted-foreground">
                      <span>{key}</span>
                      <span className="font-mono">{val}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Apply this split in your main budget to keep spending aligned.
                </p>
              </div>
            )}

            {transactions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Detected Transactions ({transactions.length})
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {transactions.map((tx, index) => {
                    const colorClass = getCategoryColor(tx.category);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary/30"
                        data-testid={`row-transaction-${index}`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {tx.amount >= 0 ? (
                            <ArrowDown className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <ArrowUp className="w-4 h-4 text-red-400 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{tx.description}</span>
                            <span className="text-xs text-muted-foreground">
                              {tx.date || "Unknown date"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {tx.category && (
                            <span className={`rounded-full px-2 py-0.5 text-xs border ${colorClass}`}>
                              {tx.category}
                            </span>
                          )}
                          <span className={`text-sm font-mono ${tx.amount >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                            {formatAmount(tx.amount, tx.currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
