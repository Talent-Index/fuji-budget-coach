
🌋 Fuji Budget Coach

AI-powered budgeting, SMS transaction parsing, x402 micropayments & gamified financial growth.

Fuji Budget Coach is a mobile-first personal finance application that helps users understand, manage, and improve their financial habits. Built for mobile-money economies and modern fintech users alike, the app transforms raw SMS transaction messages into clear, actionable insights using AI, while leveraging x402 micropayments on Avalanche Fuji for premium pay-per-insight features.

Through a growing seedling-to-forest gamification system, Fuji encourages positive financial behavior and long-term engagement.

⸻

📌 Features

1. AI Budget Insights (OpenAI + x402)
	•	Ask any budgeting question in natural language
	•	Get personalized insights, recommendations, and category analysis
	•	Premium insights require a small x402 micropayment in USDC on Avalanche Fuji
	•	No subscriptions — pay only for what you use

2. SMS Transaction Parsing
	•	Paste raw SMS alerts from mobile money or bank providers
	•	Fuji automatically extracts:
	•	Dates
	•	Amounts
	•	Merchants
	•	Categories
	•	Generates weekly summaries, category totals, and optimized budget allocations

3. Gamified Financial Growth
	•	Users begin with a seedling that grows into a forest
	•	Earn Growth Points (GP) by:
	•	Importing SMS
	•	Checking insights
	•	Completing daily quests
	•	Maintaining streaks
	•	Achieving savings milestones
	•	Unlock advanced tree forms and future cosmetic skins

4. Wallet & Blockchain Integrations
	•	thirdweb for wallet connection, network handling, and transaction preparation
	•	Core Wallet (Avalanche) for intuitive user signing and payment flows
	•	x402 protocol for pay-per-insight execution
	•	Supports Avalanche Fuji testnet

5. Modern, Mobile-First UI
	•	Built with Vite + React + TypeScript
	•	Smooth UX optimized for small screens
	•	Dark theme with Avalanche-red accents
	•	Multiple screens: Dashboard, Insights, SMS Import, Parsing Results, Gamification, Savings Goals

⸻

🧱 Tech Stack

Frontend
	•	Vite + React + TypeScript
	•	React Query (TanStack) for data fetching & mutations
	•	thirdweb React SDK for wallet authentication
	•	Core Wallet integration for Avalanche transactions
	•	Hosted on Vercel

Backend
	•	Node.js + Express + TypeScript
	•	OpenAI API for insights & transaction interpretation
	•	SMS parsing logic (AI-powered)
	•	x402 payment validation
	•	Hosted on Render

Blockchain
	•	Avalanche Fuji network
	•	x402 micropayments for premium AI actions
	•	thirdweb for transaction preparation and signing
	•	Core Wallet for user-facing payments

⸻

🔧 Project Architecture

┌───────────────────────────┐
│         Frontend          │
│  (Vite + React + TS)      │
│                           │
│ - AI chat interface       │
│ - SMS importer UI         │
│ - Gamification screens    │
│ - Wallet via thirdweb     │
│ - Calls backend APIs      │
└───────────────┬───────────┘
                │ HTTP (JSON)
┌───────────────▼───────────┐
│          Backend           │
│  (Node.js + Express)       │
│                           │
│ /process → AI + x402 flow │
│ /api/import/sms           │
│ /health                   │
│                           │
│ - Calls OpenAI            │
│ - Parses SMS text         │
│ - Validates x402 payments │
│ - Returns structured JSON │
└───────────────┬───────────┘
                │
                ▼
     ┌───────────────────────┐
     │  Avalanche Fuji       │
     │  x402 micropayments   │
     │  Core Wallet signing  │
     └───────────────────────┘


⸻

🚀 Getting Started

Prerequisites
	•	Node.js 18+
	•	npm or yarn
	•	OpenAI API key
	•	Avalanche Fuji wallet (Core Wallet recommended)
	•	USDC test tokens on Fuji
	•	Deployed backend URL

⸻

1. Clone the Repository

git clone https://github.com/your-username/fuji-budget-coach.git
cd fuji-budget-coach


⸻

2. Environment Variables

Frontend (.env)

VITE_API_URL=https://<your-backend>.onrender.com

Backend (.env)

OPENAI_API_KEY=your_key_here
PAY_TO_ADDRESS=your_fuji_wallet_address
PRICE_USDC=0.02
NETWORK=avalanche-fuji


⸻

3. Install Dependencies

Frontend

cd frontend
npm install
npm run dev

Backend

cd server
npm install
npm run build
npm start


⸻

📡 API Endpoints

POST /process

Processes AI insights and validates payments.

POST /api/import/sms

Parses SMS messages into structured financial data.

GET /health

Returns payment pricing, wallet information, and service status.

⸻

🌱 Gamification System Overview
	•	Growth Points (GP)
Earn GP by performing financial tasks.
	•	Growth Stages
Seed → Sprout → Small Tree → Mature Tree → Forest
	•	Daily Quests
Simple recurring tasks to improve financial behavior.
	•	Streak Rewards
Additional bonuses for consistency.

⸻

🌍 Why Fuji Budget Coach Matters
	•	Built for mobile-money economies, where SMS is the primary financial record
	•	Uses AI to democratize financial intelligence
	•	Replaces subscriptions with micropayments, making budgeting more accessible
	•	Introduces gamification to create healthy financial habits
	•	Fully aligned with the Avalanche ecosystem and future consumer payments

⸻

🔮 Future Roadmap

In Development
	•	Savings Goals dashboard
	•	Fuji Savings Vault (on-chain)
	•	Tree Skin Marketplace (unlockables)
	•	Advanced forecasting (AI-powered)
	•	Subscription tracking
	•	Shared budgets & household mode

Long-Term Vision

To become the world’s first AI-driven Financial Wellness OS, powered by Web3 and optimized for the real spending behaviors of emerging-market users.

⸻

🤝 Contributions Welcome

We welcome contributions on:
	•	UI components
	•	AI prompt engineering
	•	SMS parsing logic
	•	Blockchain integrations
	•	Gamification expansion

Open issues or submit a PR to get involved.

⸻

🛡️ License

MIT License.

⸻

🌋 Final Note

Fuji Budget Coach represents a new category of fintech—
an AI budgeting companion that grows with you, paid only when you need it, rooted in Web3 transparency, and designed for real people managing real money.

