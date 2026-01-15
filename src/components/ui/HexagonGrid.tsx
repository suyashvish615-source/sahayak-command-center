import { motion } from "framer-motion";

interface HexagonGridProps {
  className?: string;
}

const HexagonGrid = ({ className = "" }: HexagonGridProps) => {
  const hexagons = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexagons" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
              points="28,2 53,20 53,55 28,73 3,55 3,20"
              className="text-primary"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
      
      {hexagons.map((i) => (
        <motion.div
          key={i}
          className="absolute w-16 h-16"
          style={{
            left: `${(i % 6) * 18}%`,
            top: `${Math.floor(i / 6) * 28}%`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.02, 0.08, 0.02],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon 
              fill="hsl(var(--primary))" 
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              opacity="0.3"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default HexagonGrid;
