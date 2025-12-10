import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles, Zap } from "lucide-react";
import { PRICE_USDC } from "@/lib/thirdweb";

export function HeroSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Personalized budget advice",
    },
    {
      icon: Zap,
      title: "Instant",
      description: "No signup, just pay & go",
    },
    {
      icon: Shield,
      title: "Privacy-First",
      description: "No data stored, ever",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative py-12 sm:py-16"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center space-y-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">x402 Payments on Avalanche</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
        >
          Your AI{" "}
          <span className="text-gradient">Budget Coach</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Get personalized budgeting insights powered by AI.
          <br className="hidden sm:block" />
          Pay only <span className="text-foreground font-semibold">${PRICE_USDC.toFixed(2)} USDC</span> per insight. No subscription.
        </motion.p>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pt-8"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Start below</span>
            <ArrowRight className="w-4 h-4 animate-bounce" style={{ animationDirection: "alternate" }} />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
