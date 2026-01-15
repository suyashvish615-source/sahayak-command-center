import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActionTileProps {
  icon: ReactNode;
  title: string;
  description: string;
  status?: "active" | "warning" | "critical" | "idle";
  onClick?: () => void;
  className?: string;
}

const ActionTile = ({ icon, title, description, status = "idle", onClick, className }: ActionTileProps) => {
  const statusColors = {
    active: "border-primary/50 bg-primary/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    critical: "border-red-500/30 bg-red-500/5",
    idle: "border-panel-border bg-panel-elevated"
  };

  const iconColors = {
    active: "text-primary",
    warning: "text-yellow-400",
    critical: "text-red-400",
    idle: "text-muted-foreground"
  };

  const glowColors = {
    active: "0 0 40px -10px hsl(var(--primary) / 0.5)",
    warning: "0 0 40px -10px hsl(45 93% 47% / 0.5)",
    critical: "0 0 40px -10px hsl(0 72% 51% / 0.5)",
    idle: "0 0 30px -10px hsl(var(--primary) / 0.3)"
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "action-tile p-6 text-left w-full group relative overflow-hidden",
        statusColors[status],
        className
      )}
      whileHover={{ 
        scale: 1.02,
        boxShadow: glowColors[status],
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />
      
      {/* Pulse effect when active */}
      {status !== "idle" && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: status === "active" 
              ? "radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)"
              : status === "warning"
              ? "radial-gradient(circle at center, hsl(45 93% 47% / 0.1) 0%, transparent 70%)"
              : "radial-gradient(circle at center, hsl(0 72% 51% / 0.1) 0%, transparent 70%)"
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <motion.div 
        className={cn("mb-4 transition-colors relative z-10", iconColors[status])}
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
      >
        {icon}
      </motion.div>
      
      <h4 className="font-display font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors relative z-10">
        {title}
      </h4>
      
      <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
        {description}
      </p>

      {/* Corner accent */}
      <motion.div 
        className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <div className={cn(
          "absolute top-3 right-3 w-2 h-2 rounded-full",
          status === "active" && "bg-primary",
          status === "warning" && "bg-yellow-400",
          status === "critical" && "bg-red-400",
          status === "idle" && "bg-muted-foreground/50"
        )} />
      </motion.div>
    </motion.button>
  );
};

export default ActionTile;
