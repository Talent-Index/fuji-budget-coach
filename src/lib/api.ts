// API configuration for the x402 Budget Coach backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Message {
  messageId: string;
  role: "user" | "agent";
  parts: Array<{
    kind: "text";
    text: string;
  }>;
  metadata?: Record<string, unknown>;
}

export interface BudgetRequest {
  text: string;
  monthlyIncome?: number;
  currency?: string;
  location?: string;
  paymentPayload?: unknown;
}

export interface ProcessResponse {
  success: boolean;
  error?: string;
  task?: {
    id: string;
    status: {
      state: string;
      message?: Message;
    };
    metadata?: Record<string, unknown>;
  };
  events?: unknown[];
  settlement?: {
    success: boolean;
    transaction?: string;
    errorReason?: string;
  };
}

export interface PaymentRequiredInfo {
  payTo: string;
  amount: string;
  asset: string;
  network: string;
  validUntil?: number;
}

export async function requestBudgetInsight(
  request: BudgetRequest
): Promise<ProcessResponse> {
  const message: Message = {
    messageId: `msg-${Date.now()}`,
    role: "user",
    parts: [
      {
        kind: "text",
        text: request.text,
      },
    ],
    metadata: {
      "budget.monthlyIncome": request.monthlyIncome,
      "budget.currency": request.currency || "USD",
      "budget.location": request.location,
      ...(request.paymentPayload
        ? {
            "x402.payment.payload": request.paymentPayload,
            "x402.payment.status": "payment-submitted",
          }
        : {}),
    },
  };

  const response = await fetch(`${API_BASE_URL}/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  // Check if payment is required
  if (response.status === 402 || data.task?.metadata?.["x402.payment.status"] === "payment-required") {
    return {
      success: false,
      error: "Payment Required",
      task: data.task,
    };
  }

  return data;
}

export async function checkHealth(): Promise<{
  status: string;
  service: string;
  payment: {
    address: string;
    network: string;
    price: string;
  };
}> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}
