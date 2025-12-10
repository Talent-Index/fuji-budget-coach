import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useHistory, InsightSnapshot } from "@/hooks/useProfile";
import { format } from "date-fns";

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function TrendsDashboard() {
  const { data, isLoading } = useHistory(20);

  if (isLoading) {
    return (
      <Card variant="gradient" className="w-full">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading trends...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = data?.insights || [];

  if (insights.length === 0) {
    return (
      <Card variant="gradient" className="w-full" data-testid="card-trends">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Insight Trends
          </CardTitle>
          <CardDescription>
            Your budgeting history will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No insights yet. Get your first budget insight to start tracking!
          </p>
        </CardContent>
      </Card>
    );
  }

  const firstInsight = insights[insights.length - 1];
  const latestInsight = insights[0];

  return (
    <Card variant="gradient" className="w-full" data-testid="card-trends">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Insight Trends
        </CardTitle>
        <CardDescription>
          Insights: {insights.length} | First: {format(new Date(firstInsight.createdAt), "MMM d")} | Latest: {format(new Date(latestInsight.createdAt), "MMM d")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.slice(0, 5).map((insight: InsightSnapshot, index: number) => (
          <div
            key={insight.createdAt}
            className="flex items-center justify-between gap-2 py-2 border-b border-border/30 last:border-0"
            data-testid={`row-insight-${index}`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(insight.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Badge variant="outline">
                {formatCurrency(insight.income, insight.currency)}
              </Badge>
            </div>
          </div>
        ))}

        {insights.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            + {insights.length - 5} more insights
          </p>
        )}
      </CardContent>
    </Card>
  );
}
