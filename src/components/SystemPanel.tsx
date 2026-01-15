import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SystemPanelProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

const SystemPanel = ({ title, subtitle, children, className, headerAction }: SystemPanelProps) => {
  return (
    <div className={cn("system-panel p-5", className)}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4">
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
      {children}
    </div>
  );
};

export default SystemPanel;
