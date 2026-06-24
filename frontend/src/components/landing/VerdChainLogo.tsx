import { motion } from "framer-motion";

interface VerdChainLogoProps {
  size?:      number;
  showText?:  boolean;
  animate?:   boolean;
  className?: string;
}

export default function VerdChainLogo({
  size      = 48,
  showText  = true,
  animate   = true,
  className = "",
}: VerdChainLogoProps) {
  const iconSize = size;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        initial={animate ? { opacity: 0, rotate: -10 } : false}
        animate={animate ? { opacity: 1, rotate: 0  } : false}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ width: iconSize, height: iconSize, flexShrink: 0 }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
        >
          {/* Outer hexagon ring */}
          <motion.path
            d="M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z"
            stroke="#2D6A4F"
            strokeWidth="2.5"
            fill="none"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={animate ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          />

          {/* Inner hexagon */}
          <motion.path
            d="M50 18 L76 33 L76 67 L50 82 L24 67 L24 33 Z"
            stroke="#52B788"
            strokeWidth="1.5"
            fill="rgba(82, 183, 136, 0.06)"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={animate ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Tree trunk */}
          <motion.path
            d="M50 78 L50 55"
            stroke="#1A3D2B"
            strokeWidth="3"
            strokeLinecap="round"
            initial={animate ? { pathLength: 0 } : false}
            animate={animate ? { pathLength: 1 } : false}
            transition={{ duration: 0.6, delay: 0.8 }}
          />

          {/* Tree roots */}
          <motion.path
            d="M50 78 L38 88 M50 78 L62 88 M50 78 L50 90"
            stroke="#1A3D2B"
            strokeWidth="2"
            strokeLinecap="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={animate ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.8, delay: 1.0 }}
          />

          {/* Main branches */}
          <motion.path
            d="M50 55 L35 42 M50 55 L65 42 M50 62 L30 52 M50 62 L70 52"
            stroke="#2D6A4F"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={animate ? { pathLength: 0 } : false}
            animate={animate ? { pathLength: 1 } : false}
            transition={{ duration: 0.8, delay: 1.0 }}
          />

          {/* Sub branches */}
          <motion.path
            d="M35 42 L26 32 M35 42 L40 30 M65 42 L74 32 M65 42 L60 30"
            stroke="#52B788"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={animate ? { pathLength: 0 } : false}
            animate={animate ? { pathLength: 1 } : false}
            transition={{ duration: 0.6, delay: 1.3 }}
          />

          {/* DNA helix strand 1 */}
          <motion.path
            d="M42 22 C38 26 46 30 42 34 C38 38 46 42 42 46"
            stroke="#95D5B2"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={animate ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.0, delay: 1.4 }}
          />

          {/* DNA helix strand 2 */}
          <motion.path
            d="M58 22 C62 26 54 30 58 34 C62 38 54 42 58 46"
            stroke="#8B5E3C"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={animate ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 1.0, delay: 1.4 }}
          />

          {/* DNA crossbars */}
          {[26, 30, 34, 38, 42].map((y, i) => (
            <motion.line
              key={y}
              x1="42" y1={y} x2="58" y2={y}
              stroke="#D8F3DC"
              strokeWidth="1"
              initial={animate ? { opacity: 0, scaleX: 0 } : false}
              animate={animate ? { opacity: 0.7, scaleX: 1 } : false}
              transition={{ duration: 0.3, delay: 1.6 + i * 0.08 }}
              style={{ transformOrigin: "50px center" }}
            />
          ))}

          {/* Blockchain nodes */}
          {[
            { cx: 20, cy: 50, delay: 1.8 },
            { cx: 80, cy: 50, delay: 1.9 },
            { cx: 50, cy: 18, delay: 2.0 },
            { cx: 50, cy: 82, delay: 2.1 },
          ].map((node, i) => (
            <motion.circle
              key={i}
              cx={node.cx}
              cy={node.cy}
              r="4"
              fill="#2D6A4F"
              stroke="#95D5B2"
              strokeWidth="1.5"
              initial={animate ? { scale: 0, opacity: 0 } : false}
              animate={animate ? { scale: 1, opacity: 1 } : false}
              transition={{ duration: 0.4, delay: node.delay, type: "spring" }}
            />
          ))}

          {/* Node connectors */}
          <motion.path
            d="M24 50 L10 27 M76 50 L90 27 M24 50 L10 73 M76 50 L90 73"
            stroke="#95D5B2"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            opacity="0.5"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={animate ? { pathLength: 1, opacity: 0.5 } : false}
            transition={{ duration: 1.0, delay: 2.0 }}
          />

          {/* Leaf nodes at branch tips */}
          {[
            { cx: 26, cy: 32 },
            { cx: 40, cy: 30 },
            { cx: 74, cy: 32 },
            { cx: 60, cy: 30 },
          ].map((leaf, i) => (
            <motion.circle
              key={i}
              cx={leaf.cx}
              cy={leaf.cy}
              r="3"
              fill="#52B788"
              initial={animate ? { scale: 0 } : false}
              animate={animate ? { scale: 1 } : false}
              transition={{ duration: 0.3, delay: 1.6 + i * 0.1, type: "spring", stiffness: 200 }}
            />
          ))}

          {/* Center core glow */}
          <motion.circle
            cx="50"
            cy="50"
            r="6"
            fill="#2D6A4F"
            initial={animate ? { scale: 0, opacity: 0 } : false}
            animate={animate ? { scale: 1, opacity: 1 } : false}
            transition={{ duration: 0.5, delay: 1.2, type: "spring" }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="3"
            fill="#95D5B2"
            initial={animate ? { scale: 0 } : false}
            animate={animate ? { scale: 1 } : false}
            transition={{ duration: 0.3, delay: 1.4, type: "spring" }}
          />
        </svg>
      </motion.div>

      {showText && (
        <motion.div
          initial={animate ? { opacity: 0, x: -10 } : false}
          animate={animate ? { opacity: 1, x: 0     } : false}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col"
        >
          <span
            style={{
              fontFamily:    "'Inter', system-ui, sans-serif",
              fontSize:      size * 0.42,
              fontWeight:    800,
              color:         "#1A3D2B",
              letterSpacing: "-0.03em",
              lineHeight:    1,
            }}
          >
            VerdChain
          </span>
          <span
            style={{
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:      size * 0.18,
              fontWeight:    500,
              color:         "#52B788",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              lineHeight:    1.4,
            }}
          >
            Ecological Provenance
          </span>
        </motion.div>
      )}
    </div>
  );
}