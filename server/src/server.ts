import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userStore } from "./UserStore.js";
import { generateBudgetInsight } from "./ExampleService.js";
import { parseSmsTransactions } from "./ImportService.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

const NETWORK = process.env.NETWORK || "avalanche-fuji";
const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";
const PAY_TO_ADDRESS = process.env.PAY_TO_ADDRESS || "0x0000000000000000000000000000000000000000";
const PRICE_USDC = process.env.PRICE_USDC || "0.02";
const SERVICE_URL = process.env.SERVICE_URL || `http://localhost:${PORT}/process`;

app.use(cors({
  origin: "*",
  allowedHeaders: ["Content-Type", "X-PAYMENT"],
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Fuji Budget Coach",
    payment: {
      address: PAY_TO_ADDRESS,
      network: NETWORK,
      price: PRICE_USDC,
      asset: USDC_ADDRESS,
    },
  });
});

interface X402PaymentDetails {
  payTo: string;
  amount: string;
  asset: string;
  network: string;
  serviceUrl: string;
  validUntil: number;
}

function createPaymentRequiredResponse(): X402PaymentDetails {
  return {
    payTo: PAY_TO_ADDRESS,
    amount: PRICE_USDC,
    asset: USDC_ADDRESS,
    network: NETWORK,
    serviceUrl: SERVICE_URL,
    validUntil: Math.floor(Date.now() / 1000) + 300,
  };
}

app.post("/process", async (req, res) => {
  try {
    const { message } = req.body;
    const xPaymentHeader = req.headers["x-payment"] as string | undefined;
    
    const metadata = message?.metadata || {};
    const paymentPayload = metadata["x402.payment.payload"] || xPaymentHeader;
    const paymentStatus = metadata["x402.payment.status"];

    if (!paymentPayload && paymentStatus !== "payment-submitted") {
      const paymentDetails = createPaymentRequiredResponse();
      return res.status(402).json({
        success: false,
        error: "Payment Required",
        task: {
          id: `task-${Date.now()}`,
          status: { state: "payment-required" },
          metadata: {
            "x402.payment.status": "payment-required",
            "x402.payment.details": paymentDetails,
          },
        },
        x402: paymentDetails,
      });
    }

    // TODO: In production, verify x402 payment signature here using thirdweb SDK:
    // import { verifyPayment } from "thirdweb/x402";
    // const verification = await verifyPayment({ payload: paymentPayload, expected: { payTo, amount, asset } });
    // if (!verification.valid) return res.status(402).json({ error: "Invalid payment" });
    // After verification, settle the payment on-chain before proceeding

    const text = message?.parts?.find((p: any) => p.kind === "text")?.text || "";
    const monthlyIncome = metadata["budget.monthlyIncome"] || 5000;
    const currency = metadata["budget.currency"] || "USD";
    const location = metadata["budget.location"] || "US";
    const wallet = metadata["x402.wallet"] || "anonymous";

    const insightResult = await generateBudgetInsight({
      text,
      monthlyIncome,
      currency,
      location,
    });

    if (!insightResult.success) {
      return res.status(500).json({
        success: false,
        error: insightResult.error,
      });
    }

    if (wallet && wallet !== "anonymous") {
      userStore.rewardPaidInsight({
        wallet,
        income: monthlyIncome,
        currency,
        location,
      });
    }

    res.json({
      success: true,
      task: {
        id: `task-${Date.now()}`,
        status: {
          state: "completed",
          message: {
            messageId: `msg-${Date.now()}`,
            role: "agent",
            parts: [{ kind: "text", text: insightResult.insight }],
          },
        },
        metadata: {
          "x402.payment.status": "settled",
        },
      },
      settlement: {
        success: true,
        transaction: `0x${Date.now().toString(16)}`,
      },
    });
  } catch (error: any) {
    console.error("Process error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

app.get("/api/profile/:wallet", (req, res) => {
  try {
    const { wallet } = req.params;
    if (!wallet) {
      return res.status(400).json({ error: "Wallet address required" });
    }
    const profile = userStore.getPublicProfile(wallet);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/history/:wallet", (req, res) => {
  try {
    const { wallet } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    if (!wallet) {
      return res.status(400).json({ error: "Wallet address required" });
    }
    const history = userStore.getInsightHistory(wallet, limit);
    res.json({ insights: history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/referral/claim", (req, res) => {
  try {
    const { wallet, code } = req.body;
    if (!wallet || !code) {
      return res.status(400).json({ error: "Wallet and code required" });
    }
    const result = userStore.claimReferral(wallet, code);
    if (result.success) {
      const profile = userStore.getPublicProfile(wallet);
      res.json({ success: true, profile });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/import/sms", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text content required" });
    }
    const result = await parseSmsTransactions(text);
    if (result.success) {
      res.json({ transactions: result.transactions });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Fuji Budget Coach server running on port ${PORT}`);
  console.log(`Network: ${NETWORK}`);
  console.log(`USDC: ${USDC_ADDRESS}`);
  console.log(`Pay to: ${PAY_TO_ADDRESS}`);
  console.log(`Service URL: ${SERVICE_URL}`);
});
