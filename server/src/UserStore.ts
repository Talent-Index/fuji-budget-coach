import {
  UserProfile,
  PublicProfile,
  InsightSnapshot,
  computeAvatarLevel,
  createNewProfile,
} from "./avatarLevels.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
    return profile;
  }

  getPublicProfile(wallet: string): PublicProfile {
    const profile = this.getOrCreateProfile(wallet);
    return {
      ...profile,
      avatarLevel: computeAvatarLevel(profile),
    };
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
    }

    profile.totalInsights += 1;
    if (profile.totalInsights % 10 === 0) {
      bpEarned += 20;
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

    return {
      ...profile,
      avatarLevel: computeAvatarLevel(profile),
    };
  }

  getInsightHistory(wallet: string, limit: number = 50): InsightSnapshot[] {
    const profile = this.getOrCreateProfile(wallet);
    return profile.insights.slice(-limit).reverse();
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

    return { success: true };
  }
}

export const userStore = new UserStore();
