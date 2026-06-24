import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import VerdChainLogo from "./VerdChainLogo";
import { usePipelineStats, useHealth } from "../../hooks/useApi";

function LiveMetricPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      style={{
        display:       "flex",
        alignItems:    "center",
        gap:           8,
        background:    "rgba(255,255,255,0.85)",
        backdropFilter:"blur(8px)",
        border:        "1px solid rgba(45,106,79,0.15)",
        borderRadius:  100,
        padding:       "6px 14px",
        fontSize:      13,
        fontWeight:    600,
        color:         "#1C1C1A",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", color, fontSize: 12 }}>{value}</span>
      <span style={{ color: "#6B6B63", fontWeight: 500, fontSize: 12 }}>{label}</span>
    </motion.div>
  );
}

function FloatingCard({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      style={{
        background:    "rgba(255,255,255,0.9)",
        backdropFilter:"blur(12px)",
        border:        "1px solid rgba(45,106,79,0.12)",
        borderRadius:  16,
        padding:       "20px 24px",
        boxShadow:     "0 4px 24px rgba(28,28,26,0.08)",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function PipelineStep({ step, label, active, delay }: { step: number; label: string; active: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1,  x: 0   }}
      transition={{ duration: 0.5, delay }}
      style={{ display: "flex", alignItems: "center", gap: 10 }}
    >
      <motion.div
        animate={active ? { scale: [1, 1.2, 1], backgroundColor: ["#2D6A4F", "#52B788", "#2D6A4F"] } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: step * 0.3 }}
        style={{
          width:        28,
          height:       28,
          borderRadius: "50%",
          background:   active ? "#2D6A4F" : "#E8E0D5",
          display:      "flex",
          alignItems:   "center",
          justifyContent:"center",
          fontSize:     11,
          fontWeight:   700,
          color:        active ? "#FAF8F5" : "#9E9E8E",
          flexShrink:   0,
          fontFamily:   "'JetBrains Mono', monospace",
        }}
      >
        {step}
      </motion.div>
      <span style={{ fontSize: 12, color: active ? "#1C1C1A" : "#9E9E8E", fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
      {active && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "#52B788", flexShrink: 0 }}
        />
      )}
    </motion.div>
  );
}

export default function Hero() {
  const navigate    = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: stats  } = usePipelineStats();
  const { data: health } = useHealth();

  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset:  ["start start", "end start"],
  });

  const bgY      = useTransform(scrollYProgress, [0, 1], ["0%",   "30%"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.8], [1,     0]);
  const textY    = useTransform(scrollYProgress, [0, 1], ["0px", "-60px"]);

  const isLive   = !!health;
  const readings = stats?.stats?.valid_readings      || 0;
  const anomalies = stats?.stats?.anomalies_detected || 0;
  const batches  = stats?.stats?.batches_created     || 0;

  return (
    <section
      ref={containerRef}
      style={{
        minHeight:  "100vh",
        position:   "relative",
        overflow:   "hidden",
        background: "linear-gradient(160deg, #FAF8F5 0%, #F0EDE6 40%, #E8F5EC 100%)",
        display:    "flex",
        flexDirection:"column",
      }}
    >
      {/* Animated background blobs */}
      <motion.div
        style={{ y: bgY, position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position:     "absolute",
            top:          "-10%",
            right:        "-5%",
            width:        600,
            height:       600,
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(82,183,136,0.15) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            position:     "absolute",
            bottom:       "10%",
            left:         "-10%",
            width:        500,
            height:       500,
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(45,106,79,0.12) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{
            position:     "absolute",
            top:          "40%",
            left:         "30%",
            width:        400,
            height:       400,
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(139,94,60,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Organic mesh lines */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M0,200 C200,150 400,300 600,250 C800,200 1000,350 1200,300 C1350,260 1440,280 1440,280"
            stroke="#2D6A4F"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,400 C300,350 500,500 700,450 C900,400 1100,550 1440,480"
            stroke="#2D6A4F"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.path
            d="M0,600 C250,550 450,700 650,650 C850,600 1050,720 1440,660"
            stroke="#52B788"
            strokeWidth="0.8"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, ease: "easeInOut", delay: 1 }}
          />
        </svg>
      </motion.div>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1,  y: 0   }}
        transition={{ duration: 0.6 }}
        style={{
          position:      "relative",
          zIndex:        10,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          padding:       "20px 48px",
          borderBottom:  "1px solid rgba(45,106,79,0.08)",
          background:    "rgba(250,248,245,0.8)",
          backdropFilter:"blur(12px)",
        }}
      >
        <VerdChainLogo size={38} animate={false} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["What We Do", "Architecture", "FAQ", "Contact"].map((item) => (
            <button
              key={item}
              onClick={() => {
                const el = document.getElementById(item.toLowerCase().replace(" ", "-"));
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                background:   "none",
                border:       "none",
                padding:      "6px 14px",
                fontSize:     14,
                fontWeight:   500,
                color:        "#3D3D38",
                cursor:       "pointer",
                borderRadius: 8,
                transition:   "all 0.2s",
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = "#2D6A4F"; (e.target as HTMLButtonElement).style.background = "rgba(45,106,79,0.06)"; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = "#3D3D38"; (e.target as HTMLButtonElement).style.background = "none"; }}
            >
              {item}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? "#52B788" : "#B94040" }}
            />
            <span style={{ fontSize: 12, color: "#6B6B63", fontFamily: "'JetBrains Mono', monospace" }}>
              {isLive ? "SYSTEM LIVE" : "OFFLINE"}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: "#1A3D2B" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/dashboard")}
            style={{
              background:   "#2D6A4F",
              color:        "#FAF8F5",
              border:       "none",
              borderRadius: 10,
              padding:      "9px 22px",
              fontSize:     14,
              fontWeight:   700,
              cursor:       "pointer",
              transition:   "background 0.2s",
            }}
          >
            Launch App
          </motion.button>
        </div>
      </motion.nav>

      {/* Main hero content */}
      <motion.div
        style={{ opacity, y: textY, flex: 1, display: "flex", alignItems: "center", position: "relative", zIndex: 5 }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", width: "100%", paddingTop: 60, paddingBottom: 80 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

            {/* Left column — text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1,  y: 0  }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}
              >
                <span style={{
                  background:   "#D8F3DC",
                  color:        "#1A3D2B",
                  fontSize:     11,
                  fontWeight:   700,
                  padding:      "4px 12px",
                  borderRadius: 100,
                  letterSpacing:"0.08em",
                  textTransform:"uppercase",
                  fontFamily:   "'JetBrains Mono', monospace",
                }}>
                  Biothon 2026
                </span>
                <span style={{
                  background:   "#F5E6D3",
                  color:        "#6B4226",
                  fontSize:     11,
                  fontWeight:   700,
                  padding:      "4px 12px",
                  borderRadius: 100,
                  letterSpacing:"0.08em",
                  textTransform:"uppercase",
                  fontFamily:   "'JetBrains Mono', monospace",
                }}>
                  Round 2
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1,  y: 0  }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize:      64,
                  fontWeight:    900,
                  lineHeight:    1.05,
                  color:         "#1C1C1A",
                  letterSpacing: "-0.03em",
                  marginBottom:  24,
                }}
              >
                Carbon sequestration
                <br />
                <span style={{ color: "#2D6A4F" }}>mathematically</span>
                <br />
                provable.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1,  y: 0  }}
                transition={{ duration: 0.7, delay: 0.5 }}
                style={{
                  fontSize:    18,
                  lineHeight:  1.7,
                  color:       "#3D3D38",
                  marginBottom:36,
                  maxWidth:    480,
                }}
              >
                VerdChain replaces manual MRV surveys with a tamper-proof pipeline —
                from a sensor in coastal mud to a legally-retired carbon credit on the blockchain.
                Zero human intermediaries. Zero trust required.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1,  y: 0  }}
                transition={{ duration: 0.6, delay: 0.7 }}
                style={{ display: "flex", gap: 12, marginBottom: 48 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -2, boxShadow: "0 12px 32px rgba(45,106,79,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/dashboard")}
                  style={{
                    background:   "#2D6A4F",
                    color:        "#FAF8F5",
                    border:       "none",
                    borderRadius: 12,
                    padding:      "14px 32px",
                    fontSize:     15,
                    fontWeight:   700,
                    cursor:       "pointer",
                    boxShadow:    "0 4px 16px rgba(45,106,79,0.2)",
                  }}
                >
                  Launch Dashboard
                </motion.button>
                <motion.a
                  href="https://github.com/Excalibur677/verdchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background:   "transparent",
                    color:        "#2D6A4F",
                    border:       "2px solid rgba(45,106,79,0.3)",
                    borderRadius: 12,
                    padding:      "14px 32px",
                    fontSize:     15,
                    fontWeight:   700,
                    cursor:       "pointer",
                    textDecoration:"none",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View on GitHub
                </motion.a>
              </motion.div>

              {/* Live metrics pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
              >
                <LiveMetricPill label="valid readings"   value={readings.toLocaleString()} color="#52B788" />
                <LiveMetricPill label="anomalies caught" value={anomalies.toLocaleString()} color="#D4860A" />
                <LiveMetricPill label="batches on-chain" value={batches.toLocaleString()}   color="#2B6CB0" />
              </motion.div>
            </div>

            {/* Right column — floating cards */}
            <div style={{ position: "relative", height: 520 }}>

              {/* Pipeline status card */}
              <FloatingCard delay={0.4} style={{ position: "absolute", top: 0, left: 0, right: 60, zIndex: 3 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#52B788", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 16 }}>
                  Live Pipeline Status
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { step: 1, label: "IoT sensor ECDSA signature",    active: isLive },
                    { step: 2, label: "ML anomaly detection",           active: readings > 0 },
                    { step: 3, label: "Oracle consensus",               active: batches > 0 },
                    { step: 4, label: "ERC-1155 mint (ORACLE_ROLE)",    active: batches > 0 },
                    { step: 5, label: "Merkle root anchored on-chain",  active: batches > 0 },
                  ].map((s, i) => (
                    <PipelineStep key={i} {...s} delay={0.6 + i * 0.1} />
                  ))}
                </div>
              </FloatingCard>

              {/* Contract card */}
              <FloatingCard delay={0.7} style={{ position: "absolute", bottom: 80, right: 0, width: 260, zIndex: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8B5E3C", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>
                  Smart Contract
                </div>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#6B6B63", wordBreak: "break-all", lineHeight: 1.6 }}>
                  {health?.contract_address || "0x5FbDB231...0aa3"}
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 10, background: "#D8F3DC", color: "#1A3D2B", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>ERC-1155</span>
                  <span style={{ fontSize: 10, background: "#F5E6D3", color: "#6B4226", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>Hardhat Local</span>
                </div>
              </FloatingCard>

              {/* Fraud detection card */}
              <FloatingCard delay={1.0} style={{ position: "absolute", bottom: 0, left: 20, width: 240, zIndex: 5 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#B94040", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>
                  Fraud Detection
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["Sudden Spike", "Slow Drift", "Neighbour Spoofing"].map(t => (
                    <span key={t} style={{ fontSize: 10, background: "#FDEAEA", color: "#B94040", padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: "#1C1C1A" }}>
                  {anomalies.toLocaleString()} <span style={{ fontWeight: 400, color: "#6B6B63", fontSize: 12 }}>anomalies blocked</span>
                </div>
              </FloatingCard>

              {/* GPS indicator */}
              <FloatingCard delay={0.9} style={{ position: "absolute", top: 20, right: 0, width: 180, zIndex: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#2B6CB0", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                  GPS Location
                </div>
                <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#3D3D38", lineHeight: 1.8 }}>
                  <div>20.3974° N</div>
                  <div>86.7443° E</div>
                </div>
                <div style={{ fontSize: 11, color: "#6B6B63", marginTop: 6 }}>Bhitarkanika, Odisha</div>
              </FloatingCard>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        style={{
          position:      "absolute",
          bottom:        32,
          left:          "50%",
          transform:     "translateX(-50%)",
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          gap:           8,
          zIndex:        10,
        }}
      >
        <span style={{ fontSize: 11, color: "#9E9E8E", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 1.5, height: 32, background: "linear-gradient(to bottom, #2D6A4F, transparent)", borderRadius: 2 }}
        />
      </motion.div>
    </section>
  );
}