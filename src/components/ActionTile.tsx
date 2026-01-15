import { ReactNode } from "react";
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

  return (
    <button
      onClick={onClick}
      className={cn(
        "action-tile p-6 text-left w-full group",
        statusColors[status],
        className
      )}
    >
      <div className={cn("mb-4 transition-colors", iconColors[status])}>
        {icon}
      </div>
      <h4 className="font-display font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
        {title}
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </button>
  );
};

export default ActionTile;
