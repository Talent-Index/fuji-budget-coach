import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Users, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useClaimReferral } from "@/hooks/useProfile";

export function ReferralCard() {
  const { data: profile, isLoading } = useProfile();
  const claimReferral = useClaimReferral();
  const [referralInput, setReferralInput] = useState("");
  const [copied, setCopied] = useState(false);

  if (isLoading || !profile) {
    return null;
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleClaimReferral = async () => {
    if (!referralInput.trim()) {
      toast.error("Please enter a referral code");
      return;
    }
    try {
      await claimReferral.mutateAsync(referralInput.trim());
      toast.success("Referral claimed! +50 BP");
      setReferralInput("");
    } catch (error: any) {
      toast.error(error.message || "Failed to claim referral");
    }
  };

  return (
    <Card variant="gradient" className="w-full" data-testid="card-referral">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Referrals
        </CardTitle>
        <CardDescription>
          Share your code and earn 50 BP for each friend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded-md bg-secondary/50 border border-border font-mono text-center" data-testid="text-referral-code">
            {profile.referralCode}
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={handleCopyCode}
            data-testid="button-copy-code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{profile.referrals.length} referrals</span>
        </div>

        {!profile.referredBy && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <p className="text-sm text-muted-foreground">Have a friend's code?</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                maxLength={8}
                className="font-mono uppercase"
                data-testid="input-referral-code"
              />
              <Button
                onClick={handleClaimReferral}
                disabled={claimReferral.isPending}
                data-testid="button-claim-referral"
              >
                {claimReferral.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Claim"
                )}
              </Button>
            </div>
          </div>
        )}

        {profile.referredBy && (
          <Badge variant="secondary" className="w-full justify-center">
            Referred by a friend
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
