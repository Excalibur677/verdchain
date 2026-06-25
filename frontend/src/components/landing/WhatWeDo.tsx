import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { WHAT_WE_DO_SECTIONS } from "../../lib/constants";

function StatHighlight({ stat, label }: { stat: string; label: string }) {
  return (
    <div style={{
      background:   "rgba(45,106,79,0.06)",
      border:       "1px solid rgba(45,106,79,0.15)",
      borderRadius: 12,
      padding:      "16px 20px",
      marginTop:    24,
    }}>
      <div style={{
        fontSize:      36,
        fontWeight:    900,
        color:         "#2D6A4F",
        letterSpacing: "-0.03em",
        lineHeight:    1,
        fontFamily:    "'Inter', system-ui, sans-serif",
      }}>
        {stat}
      </div>
      <div style={{
        fontSize:   13,
        color:      "#6B6B63",
        marginTop:  8,
        lineHeight: 1.5,
        maxWidth:   280,
      }}>
        {label}
      </div>
    </div>
  );
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span style={{
      fontSize:      11,
      fontWeight:    600,
      fontFamily:    "'JetBrains Mono', monospace",
      letterSpacing: "0.04em",
      background:    "#F0EDE6",
      color:         "#3D3D38",
      padding:       "4px 12px",
      borderRadius:  100,
      border:        "1px solid #E8E0D5",
      whiteSpace:    "nowrap",
    }}>
      {tag}
    </span>
  );
}

function SectionPanel({
  section,
  index,
}: {
  section: typeof WHAT_WE_DO_SECTIONS[0];
  index:   number;
}) {
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isEven   = index % 2 === 0;

  const visualContent = [
    // Measure — sensor network visualization
    <div key="measure" style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 400 320" style={{ width: "100%", maxWidth: 400 }}>
        {/* Background grid */}
        {[0,1,2,3,4,5].map(row =>
          [0,1,2,3,4,5].map(col => (
            <circle key={`${row}-${col}`} cx={40 + col * 64} cy={30 + row * 52} r="1.5" fill="#E8E0D5" opacity="0.5" />
          ))
        )}

        {/* Mangrove silhouette */}
        <motion.path
          d="M200 280 L200 200 M200 220 L170 190 M200 230 L230 190 M200 210 L155 175 M200 215 L245 175 M170 190 L150 165 M170 190 L185 160 M230 190 L215 160 M230 190 L250 165"
          stroke="#2D6A4F"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Sensor nodes */}
        {[
          { cx: 120, cy: 200, label: "NODE_001", delay: 0.5 },
          { cx: 280, cy: 180, label: "NODE_002", delay: 0.8 },
          { cx: 200, cy: 120, label: "NODE_003", delay: 1.1 },
        ].map((node) => (
          <g key={node.label}>
            <motion.circle
              cx={node.cx} cy={node.cy} r="16"
              fill="rgba(45,106,79,0.1)"
              stroke="#2D6A4F"
              strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: node.delay, type: "spring" }}
            />
            <motion.circle
              cx={node.cx} cy={node.cy} r="6"
              fill="#2D6A4F"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.4, delay: node.delay + 0.1 }}
            />
            <motion.circle
              cx={node.cx} cy={node.cy} r="24"
              fill="none"
              stroke="#52B788"
              strokeWidth="1"
              opacity="0.4"
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: [0, 1.5, 1.5], opacity: [0, 0.4, 0] } : {}}
              transition={{ duration: 2, delay: node.delay + 0.3, repeat: Infinity }}
            />
            <motion.text
              x={node.cx} y={node.cy + 32}
              textAnchor="middle"
              fontSize="9"
              fill="#6B6B63"
              fontFamily="JetBrains Mono, monospace"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: node.delay + 0.4 }}
            >
              {node.label}
            </motion.text>
          </g>
        ))}

        {/* Data streams */}
        {[
          { x1: 120, y1: 200, x2: 200, y2: 280, delay: 1.4 },
          { x1: 280, y1: 180, x2: 200, y2: 280, delay: 1.6 },
          { x1: 200, y1: 120, x2: 200, y2: 280, delay: 1.8 },
        ].map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke="#52B788"
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
            transition={{ duration: 0.8, delay: line.delay }}
          />
        ))}

        {/* Central collector */}
        <motion.rect
          x="170" y="260" width="60" height="32" rx="6"
          fill="#1A3D2B"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 2.0 }}
        />
        <motion.text
          x="200" y="280"
          textAnchor="middle"
          fontSize="8"
          fill="#95D5B2"
          fontFamily="JetBrains Mono, monospace"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.2 }}
        >
          BACKEND API
        </motion.text>

        {/* Metric labels */}
        {[
          { x: 50,  y: 240, label: "pH 7.4",     color: "#2D6A4F" },
          { x: 310, y: 220, label: "Sal 32ppt",   color: "#8B5E3C" },
          { x: 170, y: 90,  label: "DO 7.2mg/L",  color: "#2B6CB0" },
        ].map((metric, i) => (
          <motion.g key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.2 + i * 0.2 }}
          >
            <rect x={metric.x - 28} y={metric.y - 12} width={56} height={18} rx="4" fill="white" stroke="#E8E0D5" strokeWidth="1" />
            <text x={metric.x} y={metric.y + 2} textAnchor="middle" fontSize="8" fill={metric.color} fontFamily="JetBrains Mono, monospace" fontWeight="600">
              {metric.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>,

    // Report — ML pipeline visualization
    <div key="report" style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 400 320" style={{ width: "100%", maxWidth: 400 }}>
        {/* Pipeline stages */}
        {[
          { x: 40,  y: 140, label: "RAW DATA",    color: "#E8E0D5", textColor: "#6B6B63", delay: 0.2 },
          { x: 120, y: 140, label: "SIG VERIFY",  color: "#D8F3DC", textColor: "#1A3D2B", delay: 0.5 },
          { x: 200, y: 140, label: "PHYS BOUNDS", color: "#D8F3DC", textColor: "#1A3D2B", delay: 0.8 },
          { x: 280, y: 140, label: "Z-SCORE",     color: "#D8F3DC", textColor: "#1A3D2B", delay: 1.1 },
          { x: 360, y: 140, label: "ISO FOREST",  color: "#D8F3DC", textColor: "#1A3D2B", delay: 1.4 },
        ].map((stage) => (
          <g key={stage.label}>
            <motion.rect
              x={stage.x - 34} y={stage.y - 20} width={68} height={40} rx="6"
              fill={stage.color}
              stroke={stage.textColor === "#1A3D2B" ? "#52B788" : "#E8E0D5"}
              strokeWidth="1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: stage.delay }}
            />
            <motion.text
              x={stage.x} y={stage.y + 4}
              textAnchor="middle"
              fontSize="7"
              fill={stage.textColor}
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: stage.delay + 0.2 }}
            >
              {stage.label}
            </motion.text>
          </g>
        ))}

        {/* Arrows between stages */}
        {[80, 160, 240, 320].map((x, i) => (
          <motion.path
            key={x}
            d={`M${x} 140 L${x + 6} 140`}
            stroke="#2D6A4F"
            strokeWidth="1.5"
            markerEnd="url(#arrow)"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 + i * 0.3 }}
          />
        ))}

        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#2D6A4F" />
          </marker>
        </defs>

        {/* Anomaly branch */}
        <motion.path
          d="M280 120 L280 60 L360 60"
          stroke="#B94040"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
          transition={{ duration: 0.8, delay: 1.5 }}
        />
        <motion.rect
          x="326" y="42" width="68" height="36" rx="6"
          fill="#FDEAEA"
          stroke="#B94040"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.8 }}
        />
        <motion.text
          x="360" y="60"
          textAnchor="middle"
          fontSize="7"
          fill="#B94040"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="700"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.0 }}
        >
          QUARANTINE
        </motion.text>

        {/* Clean path continues */}
        <motion.path
          d="M394 140 L394 220 L200 220"
          stroke="#2D6A4F"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.0, delay: 1.8 }}
        />
        <motion.rect
          x="166" y="202" width="68" height="36" rx="6"
          fill="#1A3D2B"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.2 }}
        />
        <motion.text
          x="200" y="224"
          textAnchor="middle"
          fontSize="7"
          fill="#95D5B2"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="700"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.4 }}
        >
          ORACLE READY
        </motion.text>

        {/* Stats overlays */}
        {[
          { x: 60,  y: 220, text: "6 checks",       color: "#2D6A4F" },
          { x: 200, y: 80,  text: "2.5σ threshold", color: "#8B5E3C" },
          { x: 330, y: 200, text: "~14% blocked",   color: "#B94040" },
        ].map((stat, i) => (
          <motion.g key={i}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 2.2 + i * 0.2 }}
          >
            <rect x={stat.x - 36} y={stat.y - 12} width={72} height={18} rx="9" fill="white" stroke="#E8E0D5" />
            <text x={stat.x} y={stat.y + 2} textAnchor="middle" fontSize="8" fill={stat.color} fontFamily="JetBrains Mono, monospace" fontWeight="600">
              {stat.text}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>,

    // Verify — Merkle tree visualization
    <div key="verify" style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 400 320" style={{ width: "100%", maxWidth: 400 }}>
        {/* Merkle tree structure */}
        {/* Root */}
        <motion.rect x="150" y="20" width="100" height="44" rx="8"
          fill="#1A3D2B" stroke="#2D6A4F" strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
        <motion.text x="200" y="38" textAnchor="middle" fontSize="8" fill="#95D5B2" fontFamily="JetBrains Mono, monospace" fontWeight="700"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>
          MERKLE ROOT
        </motion.text>
        <motion.text x="200" y="54" textAnchor="middle" fontSize="7" fill="#52B788" fontFamily="JetBrains Mono, monospace"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}>
          32 bytes on-chain
        </motion.text>

        {/* Level 1 */}
        {[
          { x: 80,  label: "HASH_L",  color: "#2D6A4F", delay: 0.7 },
          { x: 320, label: "HASH_R",  color: "#2D6A4F", delay: 0.9 },
        ].map((node) => (
          <g key={node.label}>
            <motion.line x1="200" y1="64" x2={node.x} y2="114" stroke="#52B788" strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: node.delay - 0.1 }} />
            <motion.rect x={node.x - 44} y="114" width="88" height="36" rx="6"
              fill="#D8F3DC" stroke="#52B788" strokeWidth="1.5"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: node.delay }}
            />
            <motion.text x={node.x} y="136" textAnchor="middle" fontSize="8" fill="#1A3D2B" fontFamily="JetBrains Mono, monospace" fontWeight="700"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: node.delay + 0.1 }}>
              {node.label}
            </motion.text>
          </g>
        ))}

        {/* Level 2 — leaf nodes */}
        {[
          { x: 40,  parent: 80,  label: "R_001", color: "#F0EDE6", delay: 1.2 },
          { x: 120, parent: 80,  label: "R_002", color: "#F0EDE6", delay: 1.3 },
          { x: 280, parent: 320, label: "R_003", color: "#F0EDE6", delay: 1.4 },
          { x: 360, parent: 320, label: "R_004", color: "#F0EDE6", delay: 1.5 },
        ].map((leaf) => (
          <g key={leaf.label}>
            <motion.line x1={leaf.parent} y1="150" x2={leaf.x} y2="196" stroke="#C4B49A" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: leaf.delay - 0.1 }} />
            <motion.rect x={leaf.x - 34} y="196" width="68" height="30" rx="6"
              fill={leaf.color} stroke="#E8E0D5" strokeWidth="1"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: leaf.delay }}
            />
            <motion.text x={leaf.x} y="215" textAnchor="middle" fontSize="7" fill="#6B6B63" fontFamily="JetBrains Mono, monospace"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: leaf.delay + 0.1 }}>
              {leaf.label}
            </motion.text>
          </g>
        ))}

        {/* Raw readings at bottom */}
        {[40, 120, 200, 280, 360].map((x, i) => (
          <g key={x}>
            <motion.line x1={i === 2 ? 200 : [40,120,280,360][i > 2 ? i-1 : i]} y1={i === 2 ? 196 : 226} x2={x} y2="258"
              stroke="#E8E0D5" strokeWidth="1" strokeDasharray="3 3"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.6 } : {}} transition={{ delay: 1.8 }}
            />
            <motion.circle cx={x} cy="268" r="12" fill="#FAF8F5" stroke="#E8E0D5" strokeWidth="1.5"
              initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 1.8 + i * 0.08, type: "spring" }}
            />
            <motion.text x={x} y="272" textAnchor="middle" fontSize="7" fill="#6B6B63" fontFamily="JetBrains Mono, monospace"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.0 + i * 0.08 }}>
              r{i+1}
            </motion.text>
          </g>
        ))}

        {/* Arweave badge */}
        <motion.rect x="130" y="295" width="140" height="22" rx="11"
          fill="#F5E6D3" stroke="#C49A6C" strokeWidth="1"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.3 }}
        />
        <motion.text x="200" y="310" textAnchor="middle" fontSize="8" fill="#8B5E3C" fontFamily="JetBrains Mono, monospace" fontWeight="700"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.4 }}>
          STORED ON ARWEAVE — PERMANENT
        </motion.text>

        {/* Verification arrow */}
        <motion.path
          d="M340 42 C380 42 390 160 340 200"
          stroke="#2B6CB0"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          fill="none"
          markerEnd="url(#arrow-blue)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.7 } : {}}
          transition={{ duration: 1.2, delay: 2.5 }}
        />
        <defs>
          <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#2B6CB0" />
          </marker>
        </defs>
        <motion.text x="392" y="120" textAnchor="middle" fontSize="7" fill="#2B6CB0" fontFamily="JetBrains Mono, monospace"
          style={{ writingMode: "vertical-rl" }}
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.8 }}>
          AUDIT PATH
        </motion.text>
      </svg>
    </div>,
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display:       "grid",
        gridTemplateColumns: isEven ? "1fr 1fr" : "1fr 1fr",
        gap:           80,
        alignItems:    "center",
        padding:       "80px 0",
        borderBottom:  "1px solid #E8E0D5",
      }}
    >
      {/* Text side */}
      <div style={{ order: isEven ? 1 : 2 }}>
        <motion.div
          initial={{ opacity: 0, x: isEven ? -20 : 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div style={{
            fontSize:      11,
            fontWeight:    700,
            fontFamily:    "'JetBrains Mono', monospace",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "#52B788",
            marginBottom:  12,
          }}>
            0{index + 1} — {section.title}
          </div>

          <h2 style={{
            fontSize:      42,
            fontWeight:    800,
            color:         "#1C1C1A",
            letterSpacing: "-0.02em",
            lineHeight:    1.15,
            marginBottom:  16,
          }}>
            {section.subtitle}
          </h2>

          <p style={{
            fontSize:   16,
            lineHeight: 1.8,
            color:      "#3D3D38",
            marginBottom: 24,
          }}>
            {section.description}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {section.tags.map(tag => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>

          <StatHighlight stat={section.stat} label={section.statLabel} />
        </motion.div>
      </div>

      {/* Visual side */}
      <motion.div
        style={{
          order:         isEven ? 2 : 1,
          background:    "#FFFFFF",
          borderRadius:  20,
          border:        "1px solid #E8E0D5",
          padding:       32,
          minHeight:     360,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          boxShadow:     "0 4px 24px rgba(28,28,26,0.06)",
        }}
        initial={{ opacity: 0, x: isEven ? 20 : -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        whileHover={{ boxShadow: "0 8px 40px rgba(28,28,26,0.10)" }}
      >
        {visualContent[index]}
      </motion.div>
    </motion.div>
  );
}

export default function WhatWeDo() {
  const titleRef    = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" });

  return (
    <section
      id="what-we-do"
      style={{
        background: "#FAF8F5",
        padding:    "0 48px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Section header */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{
            textAlign:  "center",
            padding:    "80px 0 40px",
          }}
        >
          <div style={{
            fontSize:      11,
            fontWeight:    700,
            fontFamily:    "'JetBrains Mono', monospace",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "#52B788",
            marginBottom:  16,
          }}>
            The Pipeline
          </div>
          <h2 style={{
            fontSize:      52,
            fontWeight:    900,
            color:         "#1C1C1A",
            letterSpacing: "-0.03em",
            lineHeight:    1.1,
            marginBottom:  20,
          }}>
            What We Do
          </h2>
          <p style={{
            fontSize:   18,
            color:      "#6B6B63",
            maxWidth:   560,
            margin:     "0 auto",
            lineHeight: 1.7,
          }}>
            An unbroken chain from coastal sediment to corporate balance sheet.
            Every step cryptographically dependent on the one before it.
          </p>
        </motion.div>

        {/* Section panels */}
        {WHAT_WE_DO_SECTIONS.map((section, index) => (
          <SectionPanel key={section.title} section={section} index={index} />
        ))}
      </div>
    </section>
  );
}