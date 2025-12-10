import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ConnectButton } from "thirdweb/react";
import { client, avalancheFuji } from "@/lib/thirdweb";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Fuji Budget</h1>
            <p className="text-xs text-muted-foreground">AI Coach • x402</p>
          </div>
        </div>

        {/* Network Badge + Wallet */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Avalanche Fuji</span>
          </div>

          <ConnectButton
            client={client}
            chain={avalancheFuji}
            connectButton={{
              label: "Connect Wallet",
              style: {
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, hsl(12, 100%, 62%), hsl(18, 100%, 55%))",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 500,
              },
            }}
            detailsButton={{
              style: {
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                background: "hsl(240, 10%, 10%)",
                border: "1px solid hsl(240, 5%, 20%)",
                fontSize: "0.875rem",
              },
            }}
          />
        </div>
      </div>
    </motion.header>
  );
}
