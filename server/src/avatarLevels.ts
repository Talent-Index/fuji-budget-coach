export interface AutoBudget {
  Needs: number;
  Wants: number;
  Savings: number;
  fromSms: boolean;
}

export type NotificationType = "streak" | "tree" | "quest" | "goal";

export interface UserNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: number;
  read: boolean;
}

export interface DailyQuest {
  date: string;
  description: string;
  targetActions: number;
  progress: number;
  rewardBp: number;
  completed: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currency: string;
  savedAmount: number;
  createdAt: number;
  lastCheckinAt?: number;
  completed: boolean;
}

export type AvatarSkinId = "default" | "bronze-aura" | "neon-glow" | "golden-tree";

export interface UserProfile {
  wallet: string;
  bp: number;
  totalInsights: number;
  lastInsightAt: number | null;
  currentStreak: number;
  bestStreak: number;
  referrals: string[];
  referredBy: string | null;
  referralCode: string;
  insights: InsightSnapshot[];
  autoBudget?: AutoBudget;
  notifications: UserNotification[];
  dailyQuest?: DailyQuest;
  unlockedSkins: AvatarSkinId[];
  selectedSkin: AvatarSkinId;
  savingsGoals: SavingsGoal[];
}

export interface InsightSnapshot {
  createdAt: number;
  income: number;
  currency: string;
  location: string;
}

export interface PublicProfile extends Omit<UserProfile, "insights" | "notifications"> {
  avatarLevel: number;
  unreadNotifications: number;
}

export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function computeAvatarLevel(profile: UserProfile): number {
  const { bp, currentStreak, referrals } = profile;
  
  let level = 0;
  
  if (bp >= 10) level = 1;
  if (bp >= 50) level = 2;
  if (bp >= 150 && currentStreak >= 3) level = 3;
  if (bp >= 400 && currentStreak >= 7 && referrals.length >= 1) level = 4;
  if (bp >= 1000 && currentStreak >= 14 && referrals.length >= 3) level = 5;
  
  return level;
}

export function createNewProfile(wallet: string): UserProfile {
  return {
    wallet: wallet.toLowerCase(),
    bp: 0,
    totalInsights: 0,
    lastInsightAt: null,
    currentStreak: 0,
    bestStreak: 0,
    referrals: [],
    referredBy: null,
    referralCode: generateReferralCode(),
    insights: [],
    notifications: [],
    unlockedSkins: ["default"],
    selectedSkin: "default",
    savingsGoals: [],
  };
}
