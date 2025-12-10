import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UserProfile } from "@/hooks/useProfile";

interface DailyQuestCardProps {
  profile: UserProfile | null | undefined;
}

export function DailyQuestCard({ profile }: DailyQuestCardProps) {
  if (!profile || !profile.dailyQuest) return null;

  const q = profile.dailyQuest;
  const pct = Math.min(100, (q.progress / q.targetActions) * 100);

  return (
    <Card variant="gradient" className="w-full" data-testid="card-daily-quest">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="w-4 h-4 text-primary" />
          Daily Quest
          {q.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{q.description}</p>
        <Progress value={pct} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Progress: {q.progress}/{q.targetActions}
          </span>
          <span>
            Reward: {q.rewardBp} BP {q.completed && "(Claimed!)"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
