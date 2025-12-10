import {
  UserProfile,
  PublicProfile,
  InsightSnapshot,
  AutoBudget,
  UserNotification,
  DailyQuest,
  SavingsGoal,
  AvatarSkinId,
  NotificationType,
  computeAvatarLevel,
  createNewProfile,
} from "./avatarLevels.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function pushNotification(
  profile: UserProfile,
  type: NotificationType,
  message: string
): void {
  const notif: UserNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    message,
    createdAt: Date.now(),
    read: false,
  };
  profile.notifications.unshift(notif);
  if (profile.notifications.length > 20) {
    profile.notifications = profile.notifications.slice(0, 20);
  }
}

function unlockSkinsForReferrals(profile: UserProfile): void {
  const r = profile.referrals.length;
  const unlocked = new Set(profile.unlockedSkins);

  if (r >= 1) unlocked.add("bronze-aura");
  if (r >= 3) unlocked.add("neon-glow");
  if (r >= 5) unlocked.add("golden-tree");

  profile.unlockedSkins = Array.from(unlocked) as AvatarSkinId[];
}

export class UserStore {
  private profiles: Map<string, UserProfile> = new Map();
  private referralIndex: Map<string, string> = new Map();

  getOrCreateProfile(wallet: string): UserProfile {
    const key = wallet.toLowerCase();
    let profile = this.profiles.get(key);
    if (!profile) {
      profile = createNewProfile(key);
      this.profiles.set(key, profile);
      this.referralIndex.set(profile.referralCode, key);
    }
    if (!profile.notifications) profile.notifications = [];
    if (!profile.unlockedSkins) profile.unlockedSkins = ["default"];
    if (!profile.selectedSkin) profile.selectedSkin = "default";
    if (!profile.savingsGoals) profile.savingsGoals = [];
    return profile;
  }

  getPublicProfile(wallet: string): PublicProfile {
    const profile = this.getOrCreateProfile(wallet);
    const { insights, notifications, ...rest } = profile;
    return {
      ...rest,
      avatarLevel: computeAvatarLevel(profile),
      unreadNotifications: notifications.filter((n) => !n.read).length,
    };
  }

  getNotifications(wallet: string): UserNotification[] {
    const profile = this.getOrCreateProfile(wallet);
    return profile.notifications;
  }

  markNotificationsRead(wallet: string): void {
    const profile = this.getOrCreateProfile(wallet);
    profile.notifications.forEach((n) => (n.read = true));
  }

  rewardPaidInsight(params: {
    wallet: string;
    income: number;
    currency: string;
    location: string;
  }): PublicProfile {
    const profile = this.getOrCreateProfile(params.wallet);
    const now = Date.now();

    let streakIncreased = false;
    if (profile.lastInsightAt) {
      const daysSinceLast = Math.floor(
        (now - profile.lastInsightAt) / ONE_DAY_MS
      );
      if (daysSinceLast === 1) {
        profile.currentStreak += 1;
        streakIncreased = true;
      } else if (daysSinceLast > 1) {
        profile.currentStreak = 1;
      }
    } else {
      profile.currentStreak = 1;
    }

    if (profile.currentStreak > profile.bestStreak) {
      profile.bestStreak = profile.currentStreak;
    }

    let bpEarned = 10;
    if (streakIncreased) {
      bpEarned += 5;
      pushNotification(
        profile,
        "streak",
        `Streak bonus! You earned +5 extra BP for maintaining your ${profile.currentStreak}-day streak.`
      );
    }

    profile.totalInsights += 1;
    if (profile.totalInsights % 10 === 0) {
      bpEarned += 20;
      pushNotification(
        profile,
        "tree",
        `Milestone reached! ${profile.totalInsights} insights total. You earned +20 bonus BP!`
      );
    }

    profile.bp += bpEarned;
    profile.lastInsightAt = now;

    const snapshot: InsightSnapshot = {
      createdAt: now,
      income: params.income,
      currency: params.currency,
      location: params.location,
    };
    profile.insights.push(snapshot);

    if (profile.insights.length > 100) {
      profile.insights = profile.insights.slice(-100);
    }

    const { insights, notifications, ...rest } = profile;
    return {
      ...rest,
      avatarLevel: computeAvatarLevel(profile),
      unreadNotifications: notifications.filter((n) => !n.read).length,
    };
  }

  getInsightHistory(wallet: string, limit: number = 50): InsightSnapshot[] {
    const profile = this.getOrCreateProfile(wallet);
    return profile.insights.slice(-limit).reverse();
  }

  updateAutoBudget(
    wallet: string,
    budget: { Needs: number; Wants: number; Savings: number }
  ): AutoBudget {
    const profile = this.getOrCreateProfile(wallet);
    profile.autoBudget = { ...budget, fromSms: true };
    return profile.autoBudget;
  }

  getAutoBudget(wallet: string): AutoBudget | undefined {
    const profile = this.getOrCreateProfile(wallet);
    return profile.autoBudget;
  }

  getOrCreateDailyQuest(wallet: string): DailyQuest {
    const profile = this.getOrCreateProfile(wallet);
    const today = new Date().toISOString().slice(0, 10);

    if (profile.dailyQuest && profile.dailyQuest.date === today) {
      return profile.dailyQuest;
    }

    profile.dailyQuest = {
      date: today,
      description: "Categorize 3 transactions today to earn 20 BP",
      targetActions: 3,
      progress: 0,
      rewardBp: 20,
      completed: false,
    };

    return profile.dailyQuest;
  }

  incrementDailyQuest(
    wallet: string,
    actions: number
  ): { quest: DailyQuest; completedNow: boolean } {
    const profile = this.getOrCreateProfile(wallet);
    const quest = this.getOrCreateDailyQuest(wallet);

    if (quest.completed) {
      return { quest, completedNow: false };
    }

    quest.progress += actions;
    if (quest.progress >= quest.targetActions) {
      quest.completed = true;
      profile.bp += quest.rewardBp;
      pushNotification(
        profile,
        "quest",
        `Quest completed! You earned +${quest.rewardBp} BP for categorizing your transactions.`
      );
      return { quest, completedNow: true };
    }

    return { quest, completedNow: false };
  }

  setSelectedSkin(wallet: string, skin: AvatarSkinId): PublicProfile {
    const profile = this.getOrCreateProfile(wallet);
    if (!profile.unlockedSkins.includes(skin)) {
      return this.getPublicProfile(wallet);
    }
    profile.selectedSkin = skin;
    pushNotification(profile, "tree", `You equipped a new Money Tree skin: ${skin}.`);
    return this.getPublicProfile(wallet);
  }

  createSavingsGoal(
    wallet: string,
    params: { name: string; targetAmount: number; currency: string }
  ): SavingsGoal {
    const profile = this.getOrCreateProfile(wallet);
    const goal: SavingsGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: params.name,
      targetAmount: params.targetAmount,
      currency: params.currency,
      savedAmount: 0,
      createdAt: Date.now(),
      completed: false,
    };
    profile.savingsGoals.push(goal);
    pushNotification(
      profile,
      "goal",
      `New savings goal created: ${goal.name} (${goal.targetAmount} ${goal.currency}).`
    );
    return goal;
  }

  checkinSavingsGoal(wallet: string, goalId: string, amount: number): SavingsGoal | undefined {
    const profile = this.getOrCreateProfile(wallet);
    const goal = profile.savingsGoals.find((g) => g.id === goalId);
    if (!goal) return undefined;

    goal.savedAmount += amount;
    goal.lastCheckinAt = Date.now();

    if (!goal.completed && goal.savedAmount >= goal.targetAmount) {
      goal.completed = true;
      profile.bp += 30;
      pushNotification(
        profile,
        "goal",
        `Goal "${goal.name}" completed! You earned +30 BP for reaching your savings target.`
      );
    } else {
      pushNotification(
        profile,
        "goal",
        `You checked in ${amount} ${goal.currency} towards "${goal.name}".`
      );
    }

    return goal;
  }

  claimReferral(
    wallet: string,
    code: string
  ): { success: boolean; error?: string } {
    const claimerKey = wallet.toLowerCase();
    const claimer = this.getOrCreateProfile(wallet);

    if (claimer.referredBy) {
      return { success: false, error: "Already claimed a referral code" };
    }

    const codeUpper = code.toUpperCase();
    const referrerKey = this.referralIndex.get(codeUpper);

    if (!referrerKey) {
      return { success: false, error: "Invalid referral code" };
    }

    if (referrerKey === claimerKey) {
      return { success: false, error: "Cannot use your own referral code" };
    }

    const referrer = this.profiles.get(referrerKey);
    if (!referrer) {
      return { success: false, error: "Referrer not found" };
    }

    claimer.referredBy = referrerKey;
    claimer.bp += 50;

    referrer.referrals.push(claimerKey);
    referrer.bp += 50;

    unlockSkinsForReferrals(referrer);

    pushNotification(
      claimer,
      "quest",
      "Referral bonus claimed! You and your friend both earned +50 BP."
    );
    pushNotification(
      referrer,
      "quest",
      "Your referral joined! You unlocked bonus BP (and maybe a new avatar skin)!"
    );

    return { success: true };
  }
}

export const userStore = new UserStore();
