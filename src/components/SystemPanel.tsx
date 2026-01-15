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
  title, 
  subtitle, 
  children, 
  className, 
  headerAction,
  animate = true,
  delay = 0
}: SystemPanelProps) => {
  const content = (
    <div className={cn(
      "system-panel p-5 relative overflow-hidden group",
      "transition-all duration-300 hover:border-primary/30",
      className
    )}>
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            {title && (
              <h3 className="font-display font-semibold text-foreground text-sm tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      {content}
    </motion.div>
  );
};

export default SystemPanel;
