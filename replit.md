# Fuji Budget Coach

AI-powered budgeting app with x402 microtransactions on Avalanche Fuji.

## Overview

Fuji Budget Coach is a web application that provides personalized budgeting advice through AI. Users pay per insight using USDC on the Avalanche Fuji testnet via the x402 payment protocol.

## Architecture

### Frontend (Vite + React)
- **Port**: 5000 (development)
- **Framework**: React 18 with TypeScript
- **UI**: Shadcn/ui components with Tailwind CSS
- **State**: TanStack Query for server state
- **Wallet**: thirdweb for Web3 connectivity

### Backend (Express + TypeScript)
- **Port**: 3001 (development)
- **Framework**: Express.js
- **Payment**: x402 protocol implementation
- **AI**: OpenAI for budget insights and SMS parsing

## Key Features

1. **x402 Payment Flow**: Micropayments ($0.02 USDC) per insight
2. **Avatar Engine**: "Money Tree" gamification with levels 0-5
3. **Budget Points (BP)**: Reward system with streaks and milestones
4. **Referral System**: Earn 50 BP for referring friends, unlock skins at 1/3/5/10 referrals
5. **Trends Dashboard**: Track insight history
6. **SMS Import**: Parse bank SMS notifications to extract transactions
7. **Daily Quests**: Categorize transactions to earn BP, resets at midnight UTC
8. **Notifications**: "Wilting tree" warnings, referral alerts, quest/goal notifications
9. **Avatar Skins**: Unlock bronze-aura, neon-glow, golden-tree with referrals
10. **Savings Goals**: Track goals with x402 pay-per-check-in for micro-commitments

## Project Structure

```
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities and API
│   └── pages/              # Page components
├── server/                 # Backend source
│   └── src/
│       ├── server.ts       # Express server
│       ├── UserStore.ts    # User profile management
│       ├── avatarLevels.ts # Avatar level logic
│       ├── ExampleService.ts   # Budget insight generation
│       └── ImportService.ts    # SMS transaction parsing
└── public/                 # Static assets
```

## Environment Variables

### Required
- `PAY_TO_ADDRESS`: Your Core wallet address on Fuji to receive payments
- `OPENAI_API_KEY`: For AI-powered insights (optional, demo mode works without it)

### Optional
- `VITE_THIRDWEB_CLIENT_ID`: thirdweb client ID for wallet connection
- `NETWORK`: Network name (default: "avalanche-fuji")
- `PRICE_USDC`: Price per insight in USDC (default: "0.02")
- `SERVICE_URL`: Public URL for the /process endpoint

## API Endpoints

### Payment
- `POST /process` - Get budget insight (returns 402 if payment required)
- `GET /health` - Service health check

### User Management
- `GET /api/profile/:wallet` - Get user profile with avatar level
- `GET /api/history/:wallet` - Get insight history
- `POST /api/referral/claim` - Claim a referral code
- `POST /api/profile/skin` - Set avatar skin

### Gamification
- `GET /api/notifications/:wallet` - Get user notifications
- `POST /api/notifications/read` - Mark notifications as read
- `POST /api/goals` - Create or check-in to savings goal

### Import
- `POST /api/import/sms` - Parse SMS messages for transactions (also advances daily quest)

## Running Locally

```bash
npm run dev          # Start both frontend and backend
npm run dev:client   # Start frontend only
npm run dev:server   # Start backend only
```

## Deployment

The application is configured for static deployment:
- Build: `npm run build`
- Output: `dist/` directory

## Recent Changes

- **Dec 10, 2025**: Initial x402 payment flow implementation
- **Dec 10, 2025**: Added Avatar Engine with BP and streak system
- **Dec 10, 2025**: Added referral system and trends dashboard
- **Dec 10, 2025**: Added SMS transaction import feature
- **Dec 10, 2025**: Upgraded SMS Import with category colors, heatmap, and auto-budget
- **Dec 10, 2025**: Enhanced ExampleService with Money Tree narrative in AI responses
- **Dec 10, 2025**: Fixed reward timing - BP/streak only granted after successful insight
- **Dec 10, 2025**: Integrated SMS auto-budget into AI insights - AI now references real spending patterns
- **Dec 10, 2025**: Added full gamification system - Daily Quests, Notifications, Avatar Skins, Savings Goals
