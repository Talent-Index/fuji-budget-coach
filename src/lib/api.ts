// API configuration for the x402 Budget Coach backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export interface Message {
  messageId: string;
  role: "user" | "agent";
  parts: Array<{ kind: "text"; text: string }>;
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
    status: { state: string; message?: Message };
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
  if (!API_BASE_URL) {
    console.error("VITE_API_URL is not set – cannot reach backend.");
    return {
      success: false,
      error:
        "Backend is not configured. Please set VITE_API_URL to your Budget Coach API URL.",
    };
  }

  const message: Message = {
    messageId: `msg-${Date.now()}`,
    role: "user",
    parts: [{ kind: "text", text: request.text }],
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

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch (err) {
    console.error("Network error calling /process:", err);
    return {
      success: false,
      error:
        "Could not reach the Budget Coach service. Check your API URL or network.",
    };
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON response from /process:", {
      status: response.status,
      bodyPreview: text.slice(0, 300),
    });

    return {
      success: false,
      error:
        "The Budget Coach service returned an unexpected response. This usually means the backend is not deployed or is misconfigured.",
    };
  }

  let data: any;
  try {
    data = await response.json();
  } catch (err) {
    console.error("Failed to parse JSON from /process:", err);
    return {
      success: false,
      error:
        "Could not parse response from Budget Coach service. Check server logs.",
    };
  }

  if (
    response.status === 402 ||
    data.task?.metadata?.["x402.payment.status"] === "payment-required"
  ) {
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
  payment: { address: string; network: string; price: string };
}> {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_API_URL is not set – cannot call /health. Configure it in your environment."
    );
  }

  const response = await fetch(`${API_BASE_URL}/health`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON response from /health:", text.slice(0, 300));
    throw new Error("Unexpected response from health endpoint.");
  }

  return response.json();
}
