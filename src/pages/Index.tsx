import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BudgetForm } from "@/components/BudgetForm";
import { PaymentFlow, PaymentStatus } from "@/components/PaymentFlow";
import { InsightDisplay } from "@/components/InsightDisplay";
import { requestBudgetInsight } from "@/lib/api";

const Index = () => {
  // Wallet state (simulated for now - replace with actual thirdweb connection)
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>();

  // Payment flow state
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentError, setPaymentError] = useState<string>();
  const [pendingRequest, setPendingRequest] = useState<{
    text: string;
    monthlyIncome: number;
    currency: string;
    location: string;
  } | null>(null);

  // Insight state
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Wallet handlers
  const handleConnect = useCallback(() => {
    // Simulate wallet connection - replace with actual thirdweb
    setIsConnected(true);
    setWalletAddress("0x1234...5678");
    toast.success("Wallet connected!", {
      description: "Connected to Avalanche Fuji testnet",
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(undefined);
    toast.info("Wallet disconnected");
  }, []);

  // Budget form submission
  const handleSubmit = useCallback(
    async (data: { text: string; monthlyIncome: number; currency: string; location: string }) => {
      setIsLoading(true);
      setPaymentStatus("requesting");
      setPendingRequest(data);

      try {
        // First request - expect payment required
        const response = await requestBudgetInsight({
          text: data.text,
          monthlyIncome: data.monthlyIncome,
          currency: data.currency,
          location: data.location,
        });

        if (response.error === "Payment Required") {
          // Show payment UI
          setPaymentStatus("awaiting_payment");
        } else if (response.success) {
          // Somehow got response without payment (shouldn't happen in prod)
          const insightText =
            response.task?.status?.message?.parts
              ?.filter((p: any) => p.kind === "text")
              .map((p: any) => p.text)
              .join("\n") || "No insight received";
          setInsight(insightText);
          setPaymentStatus("success");
        } else {
          throw new Error(response.error || "Unknown error");
        }
      } catch (error: any) {
        console.error("Request error:", error);
        setPaymentError(error.message || "Failed to connect to server");
        setPaymentStatus("error");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Payment handlers
  const handlePay = useCallback(async () => {
    if (!pendingRequest) return;

    setPaymentStatus("processing");

    try {
      // Simulate payment creation (replace with actual x402 payment)
      // In real implementation:
      // 1. Create x402 payment payload using thirdweb
      // 2. Sign the EIP-3009 transferWithAuthorization
      // 3. Send to backend with payment payload

      // For demo, simulate a brief delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock payment payload - replace with actual x402 implementation
      const mockPaymentPayload = {
        // This would be the actual signed EIP-3009 authorization
        signature: "0x...",
        nonce: Date.now(),
      };

      // Retry request with payment
      const response = await requestBudgetInsight({
        text: pendingRequest.text,
        monthlyIncome: pendingRequest.monthlyIncome,
        currency: pendingRequest.currency,
        location: pendingRequest.location,
        paymentPayload: mockPaymentPayload,
      });

      if (response.success) {
        const insightText =
          response.task?.status?.message?.parts
            ?.filter((p: any) => p.kind === "text")
            .map((p: any) => p.text)
            .join("\n") || "Budget insight received!";
        setInsight(insightText);
        setPaymentStatus("success");
        toast.success("Payment successful!", {
          description: "Your budget insight is ready",
        });
      } else {
        throw new Error(response.error || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentError(error.message || "Payment failed");
      setPaymentStatus("error");
      toast.error("Payment failed", {
        description: error.message,
      });
    }
  }, [pendingRequest]);

  const handleCancelPayment = useCallback(() => {
    setPaymentStatus("idle");
    setPaymentError(undefined);
    setPendingRequest(null);
    
    if (paymentStatus === "success" && insight) {
      // Just close modal, keep insight
      setPaymentStatus("idle");
    }
  }, [paymentStatus, insight]);

  const handleNewInsight = useCallback(() => {
    setInsight(null);
    setPaymentStatus("idle");
    setPendingRequest(null);
  }, []);

  return (
    <div className="min-h-screen noise-bg">
      <Header
        isConnected={isConnected}
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <HeroSection />

        <div className="max-w-xl mx-auto mt-8 space-y-8">
          {insight ? (
            <InsightDisplay insight={insight} onNewInsight={handleNewInsight} />
          ) : (
            <BudgetForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isConnected={isConnected}
            />
          )}
        </div>
      </main>

      {/* Payment modal */}
      <AnimatePresence>
        {paymentStatus !== "idle" && paymentStatus !== "success" && (
          <PaymentFlow
            status={paymentStatus}
            error={paymentError}
            onPay={handlePay}
            onCancel={handleCancelPayment}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-8 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="text-primary">x402</span> • Built on{" "}
            <span className="text-primary">Avalanche Fuji</span>
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            This is a demo. No financial advice provided.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
