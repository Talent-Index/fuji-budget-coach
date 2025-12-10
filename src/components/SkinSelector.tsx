import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserProfile, AvatarSkinId, useSetSkin } from "@/hooks/useProfile";

interface SkinSelectorProps {
  profile: UserProfile | null | undefined;
}

const skinLabels: Record<AvatarSkinId, string> = {
  default: "Classic",
  "bronze-aura": "Bronze Aura",
  "neon-glow": "Neon Glow",
  "golden-tree": "Golden Tree",
};

const skinRequirements: Record<AvatarSkinId, string> = {
  default: "Default",
  "bronze-aura": "1 referral",
  "neon-glow": "3 referrals",
  "golden-tree": "5 referrals",
};

export function SkinSelector({ profile }: SkinSelectorProps) {
  const setSkinMutation = useSetSkin();

  if (!profile) return null;

  const { unlockedSkins = [], selectedSkin } = profile;
  const allSkins: AvatarSkinId[] = ["default", "bronze-aura", "neon-glow", "golden-tree"];

  const handleSelect = async (skin: AvatarSkinId) => {
    if (skin === selectedSkin) return;
    if (!unlockedSkins.includes(skin)) {
      toast.error(`Unlock this skin by getting ${skinRequirements[skin]}`);
      return;
    }
    try {
      await setSkinMutation.mutateAsync(skin);
      toast.success(`Equipped ${skinLabels[skin]} skin!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to change skin");
    }
  };

  return (
    <Card variant="gradient" className="w-full" data-testid="card-skin-selector">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-4 h-4 text-primary" />
          Money Tree Skins
        </CardTitle>
        <CardDescription className="text-xs">
          Unlock new skins by inviting friends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {allSkins.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin);
            const isSelected = skin === selectedSkin;

            return (
              <Button
                key={skin}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                disabled={setSkinMutation.isPending || (!isUnlocked && !isSelected)}
                onClick={() => handleSelect(skin)}
                className={`text-xs ${!isUnlocked ? "opacity-50" : ""}`}
                data-testid={`button-skin-${skin}`}
              >
                {setSkinMutation.isPending && setSkinMutation.variables === skin ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : null}
                {skinLabels[skin]}
                {!isUnlocked && (
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    Locked
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Referrals: {profile.referrals?.length || 0} | Next unlock: {
            profile.referrals.length < 1 ? "Bronze Aura (1 ref)" :
            profile.referrals.length < 3 ? "Neon Glow (3 refs)" :
            profile.referrals.length < 5 ? "Golden Tree (5 refs)" :
            "All unlocked!"
          }
        </p>
      </CardContent>
    </Card>
  );
}
