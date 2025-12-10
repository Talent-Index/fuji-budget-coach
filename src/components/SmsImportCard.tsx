import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { useImportSms, ParsedTransaction } from "@/hooks/useImportSms";

function formatAmount(amount: number, currency?: string) {
  const sign = amount >= 0 ? "+" : "";
  const curr = currency || "USD";
  return `${sign}${curr} ${Math.abs(amount).toFixed(2)}`;
}

function getCategoryColor(category?: string) {
  const colors: Record<string, string> = {
    food: "bg-orange-500/20 text-orange-400",
    transport: "bg-blue-500/20 text-blue-400",
    shopping: "bg-pink-500/20 text-pink-400",
    bills: "bg-red-500/20 text-red-400",
    entertainment: "bg-purple-500/20 text-purple-400",
    transfer: "bg-cyan-500/20 text-cyan-400",
    income: "bg-green-500/20 text-green-400",
    other: "bg-gray-500/20 text-gray-400",
  };
  return colors[category || "other"] || colors.other;
}

export function SmsImportCard() {
  const [smsText, setSmsText] = useState("");
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const importSms = useImportSms();

  const handleParse = async () => {
    if (!smsText.trim()) {
      toast.error("Please paste some SMS messages");
      return;
    }
    try {
      const result = await importSms.mutateAsync(smsText);
      setTransactions(result);
      toast.success(`Parsed ${result.length} transactions`);
    } catch (error: any) {
      toast.error(error.message || "Failed to parse SMS");
    }
  };

  const handleClear = () => {
    setSmsText("");
    setTransactions([]);
  };

  return (
    <Card variant="gradient" className="w-full" data-testid="card-sms-import">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          SMS Import
        </CardTitle>
        <CardDescription>
          Paste bank SMS notifications to extract transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your SMS messages here...

Example:
Your account ***1234 debited $50.00 at Starbucks on Dec 10
Transfer of $1000 received from John Doe
Bill payment of $150 to Electric Company"
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
          {transactions.length > 0 && (
            <Button variant="outline" onClick={handleClear} data-testid="button-clear-sms">
              Clear
            </Button>
          )}
        </div>

        {transactions.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border/50">
            <p className="text-sm font-medium text-foreground">
              Parsed Transactions ({transactions.length})
            </p>
            {transactions.map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary/30"
                data-testid={`row-transaction-${index}`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {tx.amount >= 0 ? (
                    <ArrowDown className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <ArrowUp className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-sm truncate">{tx.description}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tx.category && (
                    <Badge variant="secondary" className={getCategoryColor(tx.category)}>
                      {tx.category}
                    </Badge>
                  )}
                  <span className={`text-sm font-mono ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatAmount(tx.amount, tx.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
