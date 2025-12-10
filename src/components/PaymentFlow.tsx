import { motion } from "framer-motion";
import { AlertCircle, Check, CreditCard, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICE_USDC } from "@/lib/thirdweb";

export type PaymentStatus = "idle" | "requesting" | "awaiting_payment" | "processing" | "success" | "error";

interface PaymentFlowProps {
  status: PaymentStatus;
  error?: string;
  onPay: () => void;
  onCancel: () => void;
  paymentAddress?: string;
}

export function PaymentFlow({ status, error, onPay, onCancel, paymentAddress }: PaymentFlowProps) {
  if (status === "idle") return null;

  const steps = [
    { id: "requesting", label: "Request insight", icon: CreditCard },
    { id: "awaiting_payment", label: "Pay with USDC", icon: CreditCard },
    { id: "processing", label: "Processing", icon: Loader2 },
    { id: "success", label: "Complete", icon: Check },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <Card variant="gradient" className="w-full max-w-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        
        <CardHeader className="relative z-10 text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "error" ? (
              <>
                <AlertCircle className="w-5 h-5 text-destructive" />
                Payment Failed
              </>
            ) : status === "success" ? (
              <>
                <Check className="w-5 h-5 text-success" />
                Payment Complete
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-primary" />
                x402 Payment
              </>
            )}
          </CardTitle>
          <CardDescription>
            {status === "error"
              ? error || "Something went wrong"
              : status === "success"
              ? "Your insight is ready!"
              : `Pay ${PRICE_USDC.toFixed(2)} USDC on Avalanche Fuji`}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {status !== "error" && status !== "success" && (
            <>
              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {steps.slice(0, -1).map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const isComplete = index < currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isComplete
                            ? "bg-success text-success-foreground"
                            : isActive
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isComplete ? (
                          <Check className="w-5 h-5" />
                        ) : isActive && status === "processing" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-xs text-center ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Payment Details */}
              {status === "awaiting_payment" && (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-mono font-semibold text-foreground">
                      {PRICE_USDC.toFixed(2)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <span className="text-sm text-foreground">Avalanche Fuji</span>
                  </div>
                  {paymentAddress && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">To</span>
                      <span className="text-xs font-mono text-foreground truncate max-w-[150px]">
                        {paymentAddress}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {status === "awaiting_payment" && (
              <>
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button variant="hero" className="flex-1" onClick={onPay}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
              </>
            )}

            {status === "error" && (
              <Button variant="outline" className="w-full" onClick={onCancel}>
                Try Again
              </Button>
            )}

            {status === "success" && (
              <Button variant="hero" className="w-full" onClick={onCancel}>
                View Insight
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
