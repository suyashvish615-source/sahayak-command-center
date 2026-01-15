import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingOrbProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "success" | "warning" | "info";
  delay?: number;
}

const GlowingOrb = ({ className, size = "md", color = "primary", delay = 0 }: GlowingOrbProps) => {
  const sizes = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
    xl: "w-[500px] h-[500px]",
  };

  const colors = {
    primary: "from-primary/30 via-primary/10 to-transparent",
    success: "from-green-500/30 via-green-500/10 to-transparent",
    warning: "from-yellow-500/30 via-yellow-500/10 to-transparent",
    info: "from-blue-400/30 via-blue-400/10 to-transparent",
  };

  return (
    <motion.div
      className={cn(
        "absolute rounded-full bg-gradient-radial blur-3xl pointer-events-none",
        sizes[size],
        colors[color],
        className
      )}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
};

export default GlowingOrb;
