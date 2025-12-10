import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightDisplayProps {
  insight: string;
  onNewInsight: () => void;
}

export function InsightDisplay({ insight, onNewInsight }: InsightDisplayProps) {
  // Parse the insight into sections (basic parsing)
  const sections = insight.split("\n\n").filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card variant="gradient" className="overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-success" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Your Budget Insight
                <CheckCircle2 className="w-4 h-4 text-success" />
              </CardTitle>
              <CardDescription>Personalized recommendations from your AI coach</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          {/* Main insight content */}
          <div className="prose prose-sm prose-invert max-w-none">
            {sections.map((section, index) => {
              // Check if it looks like a list item
              const isActionList = section.includes("Next 7 days") || section.includes("Action");
              
              if (isActionList || section.startsWith("-") || section.startsWith("•")) {
                return (
                  <div key={index} className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {section.split(":")[0] || "Action Items"}
                    </div>
                    <div className="text-sm text-foreground whitespace-pre-wrap">
                      {section.split(":").slice(1).join(":") || section}
                    </div>
                  </div>
                );
              }

              return (
                <p key={index} className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {section}
                </p>
              );
            })}
          </div>

          {/* New insight button */}
          <div className="pt-4 border-t border-border/50">
            <Button variant="outline" className="w-full gap-2" onClick={onNewInsight}>
              <RefreshCw className="w-4 h-4" />
              Get Another Insight
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
