import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, TreePine, Sparkles } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const AVATAR_LEVELS = [
  { name: "Seed", icon: "🌱", minBp: 0, color: "text-gray-400" },
  { name: "Sprout", icon: "🌿", minBp: 10, color: "text-green-400" },
  { name: "Sapling", icon: "🌳", minBp: 50, color: "text-green-500" },
  { name: "Tree", icon: "🌲", minBp: 150, color: "text-green-600" },
  { name: "Grove", icon: "🏞️", minBp: 400, color: "text-emerald-500" },
  { name: "Forest", icon: "🌲🌳🌲", minBp: 1000, color: "text-emerald-600" },
];

function getNextLevelInfo(level: number, bp: number) {
  if (level >= 5) return { nextBp: 1000, progress: 100 };
  const current = AVATAR_LEVELS[level];
  const next = AVATAR_LEVELS[level + 1];
  const progress = Math.min(100, ((bp - current.minBp) / (next.minBp - current.minBp)) * 100);
  return { nextBp: next.minBp, progress };
}

export function MoneyTreeAvatar() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <Card variant="gradient" className="w-full">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading profile...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return null;
  }

  const level = profile.avatarLevel;
  const avatarInfo = AVATAR_LEVELS[level];
  const { nextBp, progress } = getNextLevelInfo(level, profile.bp);

  return (
    <Card variant="gradient" className="w-full" data-testid="card-money-tree">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-primary" />
            <span>Money Tree</span>
          </div>
          <Badge variant="outline" className={avatarInfo.color}>
            Level {level}: {avatarInfo.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center text-6xl py-4" data-testid="text-avatar-icon">
          {avatarInfo.icon}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Points</span>
            <span className="font-semibold" data-testid="text-bp-value">{profile.bp} BP</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bp" />
          {level < 5 && (
            <p className="text-xs text-muted-foreground text-right">
              {nextBp - profile.bp} BP to next level
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap text-sm">
          <div className="flex items-center gap-1" data-testid="text-streak">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{profile.currentStreak}-day streak</span>
          </div>
          <div className="flex items-center gap-1" data-testid="text-insights">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{profile.totalInsights} insights</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
