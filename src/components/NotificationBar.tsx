import { Bell } from "lucide-react";
import { UserProfile } from "@/hooks/useProfile";

interface NotificationBarProps {
  profile: UserProfile | null | undefined;
}

export function NotificationBar({ profile }: NotificationBarProps) {
  if (!profile) return null;

  const daysSinceLast = profile.lastInsightAt
    ? Math.floor((Date.now() - profile.lastInsightAt) / (24 * 60 * 60 * 1000))
    : null;

  let message: string | null = null;

  if (daysSinceLast !== null && daysSinceLast >= 3) {
    message = "Your Money Tree is wilting... come back for a quick check-in to water it!";
  } else if (profile.unreadNotifications > 0) {
    message = `You have ${profile.unreadNotifications} new update(s) - your tree or goals might have changed.`;
  }

  if (!message) return null;

  return (
    <div
      className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200 flex items-center gap-2"
      data-testid="notification-bar"
    >
      <Bell className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
    </div>
  );
}
