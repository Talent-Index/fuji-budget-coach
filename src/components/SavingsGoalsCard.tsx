import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { UserProfile, useCreateGoal } from "@/hooks/useProfile";

interface SavingsGoalsCardProps {
  profile: UserProfile | null | undefined;
}

export function SavingsGoalsCard({ profile }: SavingsGoalsCardProps) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [showForm, setShowForm] = useState(false);
  const createGoalMutation = useCreateGoal();

  if (!profile) return null;

  const goals = profile.savingsGoals || [];

  const handleCreate = async () => {
    if (!name.trim() || !target.trim()) {
      toast.error("Please fill in goal name and target amount");
      return;
    }
    const targetAmount = parseFloat(target);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }
    try {
      await createGoalMutation.mutateAsync({ name, targetAmount, currency });
      toast.success(`Created savings goal: ${name}`);
      setName("");
      setTarget("");
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create goal");
    }
  };

  return (
    <Card variant="gradient" className="w-full" data-testid="card-savings-goals">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PiggyBank className="w-4 h-4 text-primary" />
          Savings Goals
        </CardTitle>
        <CardDescription className="text-xs">
          Track your savings with x402 pay-per-check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground">
            Create your first savings goal to start tracking progress.
          </p>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {goals.map((goal) => {
              const pct = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);
              return (
                <div key={goal.id} className="space-y-1" data-testid={`goal-${goal.id}`}>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      {goal.name}
                      {goal.completed && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </span>
                    <span className="text-muted-foreground">
                      {goal.savedAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} {goal.currency}
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </div>
        )}

        {showForm ? (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <Input
              placeholder="Goal name (e.g., Emergency fund)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
              data-testid="input-goal-name"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Target amount"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                type="number"
                className="flex-1 text-sm"
                data-testid="input-goal-target"
              />
              <Input
                placeholder="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-20 text-sm"
                data-testid="input-goal-currency"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={createGoalMutation.isPending}
                className="flex-1"
                data-testid="button-create-goal"
              >
                {createGoalMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                Create Goal
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} data-testid="button-cancel-goal">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full"
            data-testid="button-new-goal"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Goal
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          Complete a goal to earn +30 BP bonus!
        </p>
      </CardContent>
    </Card>
  );
}
