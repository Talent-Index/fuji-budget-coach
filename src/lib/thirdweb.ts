import { createThirdwebClient, defineChain } from "thirdweb";

// Client ID for thirdweb - you can get one at https://thirdweb.com/dashboard
// For demo purposes, using a placeholder - replace with your actual client ID
const CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "demo";

export const client = createThirdwebClient({
  clientId: CLIENT_ID,
});

// Avalanche Fuji Testnet
export const avalancheFuji = defineChain({
  id: 43113,
  name: "Avalanche Fuji",
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18,
  },
  rpc: "https://api.avax-test.network/ext/bc/C/rpc",
  blockExplorers: [
    {
      name: "SnowTrace",
      url: "https://testnet.snowtrace.io",
    },
  ],
  testnet: true,
});

// USDC on Avalanche Fuji (testnet address)
export const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";

// Price per insight in USDC (matching backend)
export const PRICE_USDC = 0.02;
