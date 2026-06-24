import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { MARQUEE_ITEMS } from "../../lib/constants";
import { usePipelineStats } from "../../hooks/useApi";

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  LIVE:          { bg: "#D8F3DC", text: "#1A3D2B" },
  VERIFIED:      { bg: "#EBF4FF", text: "#2B6CB0" },
  AI:            { bg: "#F5E6D3", text: "#6B4226" },
  CRYPTOGRAPHIC: { bg: "#F0EDE6", text: "#3D3D38" },
  DEPIN:         { bg: "#D8F3DC", text: "#2D6A4F" },
  ACTIVE:        { bg: "#FDF3DC", text: "#D4860A" },
  WEB3:          { bg: "#EBF4FF", text: "#2B6CB0" },
  ODISHA:        { bg: "#F5E6D3", text: "#8B5E3C" },
  AUTONOMOUS:    { bg: "#D8F3DC", text: "#1A3D2B" },
  ML:            { bg: "#F5E6D3", text: "#6B4226" },
  ORACLE:        { bg: "#EBF4FF", text: "#2B6CB0" },
  "60/30/10":    { bg: "#FDF3DC", text: "#D4860A" },
};

function MarqueeItem({ text, tag }: { text: string; tag: string }) {
  const tagColor = TAG_COLORS[tag] || { bg: "#D8F3DC", text: "#1A3D2B" };

  return (
    <div
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        12,
        padding:    "0 40px",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {/* Dot separator */}
      <div style={{
        width:        5,
        height:       5,
        borderRadius: "50%",
        background:   "#C4B49A",
        flexShrink:   0,
      }} />

      {/* Tag */}
      <span style={{
        fontSize:      10,
        fontWeight:    700,
        fontFamily:    "'JetBrains Mono', monospace",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        background:    tagColor.bg,
        color:         tagColor.text,
        padding:       "3px 10px",
        borderRadius:  100,
        flexShrink:    0,
      }}>
        {tag}
      </span>

      {/* Text */}
      <span style={{
        fontSize:      15,
        fontWeight:    500,
        color:         "#3D3D38",
        whiteSpace:    "nowrap",
        letterSpacing: "-0.01em",
      }}>
        {text}
      </span>
    </div>
  );
}

function LiveStatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display:    "flex",
      alignItems: "center",
      gap:        12,
      padding:    "0 40px",
      flexShrink: 0,
      userSelect: "none",
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C4B49A", flexShrink: 0 }} />
      <motion.span
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          fontSize:      10,
          fontWeight:    700,
          fontFamily:    "'JetBrains Mono', monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          background:    "rgba(82,183,136,0.15)",
          color:         "#2D6A4F",
          padding:       "3px 10px",
          borderRadius:  100,
          flexShrink:    0,
        }}
      >
        LIVE
      </motion.span>
      <span style={{
        fontSize:      15,
        fontWeight:    600,
        color,
        fontFamily:    "'JetBrains Mono', monospace",
        whiteSpace:    "nowrap",
      }}>
        {value}
      </span>
      <span style={{
        fontSize:   14,
        fontWeight: 400,
        color:      "#6B6B63",
        whiteSpace: "nowrap",
      }}>
        {label}
      </span>
    </div>
  );
}

function InfiniteTrack({
  items,
  speed       = 40,
  direction   = 1,
  isPaused    = false,
}: {
  items:     React.ReactNode[];
  speed?:    number;
  direction?: 1 | -1;
  isPaused?: boolean;
}) {
  const x        = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    if (isPaused) return;
    const trackWidth = trackRef.current?.scrollWidth ?? 0;
    const half       = trackWidth / 2;
    if (half === 0) return;

    x.set(x.get() - (delta / 1000) * speed * direction);

    if (direction === 1  && x.get() < -half) x.set(x.get() + half);
    if (direction === -1 && x.get() > 0)     x.set(x.get() - half);
  });

  const doubled = [...items, ...items];

  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <motion.div
        ref={trackRef}
        style={{ x, display: "flex", alignItems: "center" }}
      >
        {doubled}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  const [isPaused, setIsPaused] = useState(false);
  const { data: stats } = usePipelineStats();

  const staticItems = MARQUEE_ITEMS.map((item, i) => (
    <MarqueeItem key={`static-${i}`} {...item} />
  ));

  const liveItems = [
    <LiveStatItem
      key="readings"
      label="sensor readings verified"
      value={(stats?.stats?.valid_readings ?? 0).toLocaleString()}
      color="#2D6A4F"
    />,
    <LiveStatItem
      key="anomalies"
      label="fraud attempts blocked"
      value={(stats?.stats?.anomalies_detected ?? 0).toLocaleString()}
      color="#D4860A"
    />,
    <LiveStatItem
      key="batches"
      label="batches anchored on-chain"
      value={(stats?.stats?.batches_created ?? 0).toLocaleString()}
      color="#2B6CB0"
    />,
    <LiveStatItem
      key="tonnes"
      label="tCO₂e verified"
      value={Number(stats?.stats?.tonnes_verified ?? 0).toFixed(4)}
      color="#52B788"
    />,
    ...MARQUEE_ITEMS.slice(0, 4).map((item, i) => (
      <MarqueeItem key={`live-extra-${i}`} {...item} />
    )),
  ];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position:   "relative",
        overflow:   "hidden",
        background: "#F2EDE6",
        borderTop:  "1px solid #E8E0D5",
        borderBottom:"1px solid #E8E0D5",
      }}
    >
      {/* Top track — static feature items */}
      <div style={{
        padding:       "18px 0",
        borderBottom:  "1px solid rgba(232,224,213,0.6)",
        position:      "relative",
      }}>
        {/* Left fade */}
        <div style={{
          position:   "absolute",
          left:       0,
          top:        0,
          bottom:     0,
          width:      120,
          background: "linear-gradient(to right, #F2EDE6, transparent)",
          zIndex:     2,
          pointerEvents:"none",
        }} />
        {/* Right fade */}
        <div style={{
          position:   "absolute",
          right:      0,
          top:        0,
          bottom:     0,
          width:      120,
          background: "linear-gradient(to left, #F2EDE6, transparent)",
          zIndex:     2,
          pointerEvents:"none",
        }} />

        <InfiniteTrack items={staticItems} speed={35} direction={1} isPaused={isPaused} />
      </div>

      {/* Bottom track — live stats, moves right to left (reversed) */}
      <div style={{ padding: "18px 0", position: "relative" }}>
        {/* Left fade */}
        <div style={{
          position:   "absolute",
          left:       0,
          top:        0,
          bottom:     0,
          width:      120,
          background: "linear-gradient(to right, #F2EDE6, transparent)",
          zIndex:     2,
          pointerEvents:"none",
        }} />
        {/* Right fade */}
        <div style={{
          position:   "absolute",
          right:      0,
          top:        0,
          bottom:     0,
          width:      120,
          background: "linear-gradient(to left, #F2EDE6, transparent)",
          zIndex:     2,
          pointerEvents:"none",
        }} />

        <InfiniteTrack items={liveItems} speed={28} direction={-1} isPaused={isPaused} />
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position:      "absolute",
            right:         20,
            top:           "50%",
            transform:     "translateY(-50%)",
            fontSize:      10,
            fontFamily:    "'JetBrains Mono', monospace",
            color:         "#9E9E8E",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            zIndex:        3,
          }}
        >
          PAUSED
        </motion.div>
      )}
    </section>
  );
}