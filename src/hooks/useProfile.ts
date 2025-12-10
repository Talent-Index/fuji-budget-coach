import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";

export interface InsightSnapshot {
  createdAt: number;
  income: number;
  currency: string;
  location: string;
}

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
  avatarLevel: number;
}

export function useProfile() {
  const account = useActiveAccount();
  const wallet = account?.address;

  return useQuery<UserProfile>({
    queryKey: ["/api/profile", wallet],
    queryFn: async () => {
      if (!wallet) throw new Error("No wallet connected");
      const response = await fetch(`/api/profile/${wallet}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!wallet,
    staleTime: 30000,
  });
}

export function useHistory(limit = 50) {
  const account = useActiveAccount();
  const wallet = account?.address;

  return useQuery<{ insights: InsightSnapshot[] }>({
    queryKey: ["/api/history", wallet, limit],
    queryFn: async () => {
      if (!wallet) throw new Error("No wallet connected");
      const response = await fetch(`/api/history/${wallet}?limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch history");
      return response.json();
    },
    enabled: !!wallet,
    staleTime: 30000,
  });
}

export function useClaimReferral() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const wallet = account?.address;

  return useMutation({
    mutationFn: async (code: string) => {
      if (!wallet) throw new Error("No wallet connected");
      const response = await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, code }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to claim referral");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });
}
