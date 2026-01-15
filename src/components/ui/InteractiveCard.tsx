import { ReactNode, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

const InteractiveCard = ({ children, className, glowOnHover = true }: InteractiveCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    setRotateX((-mouseY / rect.height) * 10);
    setRotateY((mouseX / rect.width) * 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative transition-shadow duration-300",
        glowOnHover && "hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.4)]",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

export default InteractiveCard;
