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
  const borderColors = {
    active: "border-primary/40 hover:border-primary/60",
    warning: "border-system-warning/30 hover:border-system-warning/50",
    critical: "border-system-critical/30 hover:border-system-critical/50",
    idle: "border-border hover:border-primary/30"
  };

  const glowColors = {
    active: "shadow-[0_0_40px_-12px_hsl(var(--primary)/0.3)]",
    warning: "shadow-[0_0_40px_-12px_hsl(var(--system-warning)/0.3)]",
    critical: "shadow-[0_0_40px_-12px_hsl(var(--system-critical)/0.3)]",
    idle: ""
  };

  const iconColors = {
    active: "text-primary",
    warning: "text-system-warning",
    critical: "text-system-critical",
    idle: "text-muted-foreground group-hover:text-primary"
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 text-left w-full group transition-all duration-300",
        borderColors[status],
        status !== "idle" && glowColors[status],
        className
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn("mb-4 transition-colors duration-200", iconColors[status])}>
        {icon}
      </div>
      <h4 className="font-semibold text-foreground text-sm mb-1.5 group-hover:text-primary transition-colors">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

      {status !== "idle" && (
        <div className="absolute top-4 right-4">
          <span className={cn(
            "w-2 h-2 rounded-full block",
            status === "active" && "bg-primary",
            status === "warning" && "bg-system-warning",
            status === "critical" && "bg-system-critical",
          )} />
        </div>
      )}
    </motion.button>
  );
};

export default ActionTile;
