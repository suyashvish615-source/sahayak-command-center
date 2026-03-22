import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SystemPanelProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  animate?: boolean;
  delay?: number;
}

const SystemPanel = ({ 
  title, subtitle, children, className, headerAction, animate = true, delay = 0
}: SystemPanelProps) => {
  const content = (
    <div className={cn(
      "rounded-xl border border-border bg-card p-5",
      className
    )}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="font-semibold text-foreground text-sm">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {content}
    </motion.div>
  );
};

export default SystemPanel;
