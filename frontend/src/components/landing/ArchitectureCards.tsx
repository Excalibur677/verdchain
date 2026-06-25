import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ARCHITECTURE_LAYERS } from "../../lib/constants";

function LayerIcon({ number, color }: { number: string; color: string }) {
  return (
    <div style={{
      width:          48,
      height:         48,
      borderRadius:   12,
      background:     `${color}15`,
      border:         `1.5px solid ${color}30`,
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      flexShrink:     0,
    }}>
      <span style={{
        fontSize:      16,
        fontWeight:    800,
        fontFamily:    "'JetBrains Mono', monospace",
        color,
        letterSpacing: "-0.02em",
      }}>
        {number}
      </span>
    </div>
  );
}

function TagChip({ tag, color }: { tag: string; color: string }) {
  return (
    <span style={{
      fontSize:      10,
      fontWeight:    600,
      fontFamily:    "'JetBrains Mono', monospace",
      letterSpacing: "0.04em",
      background:    `${color}12`,
      color,
      padding:       "3px 10px",
      borderRadius:  100,
      border:        `1px solid ${color}25`,
      whiteSpace:    "nowrap",
    }}>
      {tag}
    </span>
  );
}

function ArchCard({
  layer,
  index,
}: {
  layer: typeof ARCHITECTURE_LAYERS[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay:    index * 0.1,
        ease:     [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={()  => setHovered(false)}
      style={{
        background:   "#FFFFFF",
        borderRadius: 20,
        border:       `1.5px solid ${hovered ? layer.color + "40" : "#E8E0D5"}`,
        padding:      "28px 28px 24px",
        cursor:       "default",
        position:     "relative",
        overflow:     "hidden",
        boxShadow:    hovered
          ? `0 20px 48px rgba(28,28,26,0.12), 0 0 0 1px ${layer.color}20`
          : "0 2px 12px rgba(28,28,26,0.06)",
        transition:   "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Top glow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position:     "absolute",
          top:          0,
          left:         0,
          right:        0,
          height:       3,
          background:   `linear-gradient(90deg, transparent, ${layer.color}, transparent)`,
          borderRadius: "20px 20px 0 0",
        }}
      />

      {/* Background pattern */}
      <div style={{
        position:     "absolute",
        top:          0,
        right:        0,
        width:        160,
        height:       160,
        background:   `radial-gradient(circle at 80% 20%, ${layer.color}08 0%, transparent 70%)`,
        pointerEvents:"none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
        <LayerIcon number={layer.number} color={layer.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize:      10,
            fontWeight:    700,
            fontFamily:    "'JetBrains Mono', monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color:         layer.color,
            marginBottom:  4,
            opacity:       0.8,
          }}>
            Layer {layer.number}
          </div>
          <h3 style={{
            fontSize:      16,
            fontWeight:    700,
            color:         "#1C1C1A",
            lineHeight:    1.3,
            letterSpacing: "-0.01em",
          }}>
            {layer.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize:     13,
        lineHeight:   1.75,
        color:        "#6B6B63",
        marginBottom: 20,
      }}>
        {layer.description}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {layer.tags.map(tag => (
          <TagChip key={tag} tag={tag} color={layer.color} />
        ))}
      </div>

      {/* Metric footer */}
      <div style={{
        borderTop:  "1px solid #F0EDE6",
        paddingTop: 16,
        display:    "flex",
        alignItems: "baseline",
        gap:        8,
      }}>
        <span style={{
          fontSize:      20,
          fontWeight:    800,
          color:         layer.color,
          letterSpacing: "-0.02em",
          fontFamily:    "'Inter', system-ui, sans-serif",
        }}>
          {layer.metric}
        </span>
        <span style={{
          fontSize:   12,
          color:      "#9E9E8E",
          lineHeight: 1.4,
        }}>
          {layer.metricSub}
        </span>
      </div>

      {/* Hover connector line */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position:        "absolute",
          bottom:          0,
          left:            28,
          right:           28,
          height:          2,
          background:      `linear-gradient(90deg, transparent, ${layer.color}60, transparent)`,
          transformOrigin: "center",
        }}
      />
    </motion.div>
  );
}

function ConnectorLine({ index }: { index: number }) {
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  if (index >= ARCHITECTURE_LAYERS.length - 1) return null;
  if ((index + 1) % 3 === 0) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
      style={{
        position:        "absolute",
        top:             "50%",
        right:           -20,
        width:           40,
        height:          1.5,
        background:      "linear-gradient(90deg, #E8E0D5, #C4B49A, #E8E0D5)",
        transformOrigin: "left",
        zIndex:          10,
      }}
    />
  );
}

export default function ArchitectureCards() {
  const titleRef    = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" });

  return (
    <section
      id="architecture"
      style={{
        background: "#F2EDE6",
        padding:    "100px 48px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Section header */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: 64 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{
              fontSize:      11,
              fontWeight:    700,
              fontFamily:    "'JetBrains Mono', monospace",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color:         "#52B788",
            }}>
              Technical Architecture
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #E8E0D5, transparent)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "end" }}>
            <div>
              <h2 style={{
                fontSize:      52,
                fontWeight:    900,
                color:         "#1C1C1A",
                letterSpacing: "-0.03em",
                lineHeight:    1.1,
                marginBottom:  0,
              }}>
                Six layers.<br />
                <span style={{ color: "#2D6A4F" }}>Zero trust.</span>
              </h2>
            </div>
            <div>
              <p style={{
                fontSize:   16,
                lineHeight: 1.8,
                color:      "#6B6B63",
              }}>
                Each layer in the VerdChain pipeline is cryptographically dependent
                on the one before it. No single layer can be faked without breaking
                the chain — making the entire system tamper-evident by design,
                not by policy.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap:                 24,
          position:            "relative",
        }}>
          {ARCHITECTURE_LAYERS.map((layer, index) => (
            <div key={layer.number} style={{ position: "relative" }}>
              <ArchCard layer={layer} index={index} />
              <ConnectorLine index={index} />
            </div>
          ))}
        </div>

        {/* Bottom pipeline flow indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            marginTop:     48,
            background:    "#FFFFFF",
            borderRadius:  16,
            border:        "1px solid #E8E0D5",
            padding:       "20px 32px",
            display:       "flex",
            alignItems:    "center",
            gap:           0,
            overflowX:     "auto",
            boxShadow:     "0 2px 12px rgba(28,28,26,0.04)",
          }}
        >
          <div style={{
            fontSize:      11,
            fontWeight:    700,
            fontFamily:    "'JetBrains Mono', monospace",
            color:         "#9E9E8E",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginRight:   24,
            flexShrink:    0,
          }}>
            Data Flow
          </div>

          {ARCHITECTURE_LAYERS.map((layer, i) => (
            <div key={layer.number} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            8,
                  background:     `${layer.color}10`,
                  border:         `1px solid ${layer.color}25`,
                  borderRadius:   8,
                  padding:        "6px 14px",
                  cursor:         "default",
                }}
              >
                <span style={{
                  fontSize:   10,
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  color:      layer.color,
                }}>
                  {layer.number}
                </span>
                <span style={{
                  fontSize:   11,
                  fontWeight: 600,
                  color:      "#3D3D38",
                  whiteSpace: "nowrap",
                }}>
                  {layer.title.split(" ")[0]}
                </span>
              </motion.div>

              {i < ARCHITECTURE_LAYERS.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
                  <svg width="16" height="10" viewBox="0 0 16 10">
                    <path d="M0 5 L12 5 M8 1 L12 5 L8 9" stroke="#C4B49A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          <div style={{ marginLeft: "auto", flexShrink: 0, paddingLeft: 24 }}>
            <span style={{
              fontSize:      10,
              fontWeight:    700,
              fontFamily:    "'JetBrains Mono', monospace",
              background:    "#D8F3DC",
              color:         "#1A3D2B",
              padding:       "4px 12px",
              borderRadius:  100,
              letterSpacing: "0.06em",
            }}>
              FULLY AUTONOMOUS
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}