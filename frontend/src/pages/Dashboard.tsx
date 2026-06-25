import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VerdChainLogo from "../components/landing/VerdChainLogo";
import App from "../App";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5" }}>
      {/* Dashboard topbar */}
      <div style={{
        position:      "sticky",
        top:           0,
        zIndex:        100,
        background:    "rgba(250,248,245,0.95)",
        backdropFilter:"blur(12px)",
        borderBottom:  "1px solid #E8E0D5",
        padding:       "12px 32px",
        display:       "flex",
        alignItems:    "center",
        justifyContent:"space-between",
      }}>
        <VerdChainLogo size={32} animate={false} />
        <button
          onClick={() => navigate("/")}
          style={{
            background:   "transparent",
            border:       "1.5px solid #E8E0D5",
            borderRadius: 8,
            padding:      "7px 18px",
            fontSize:     13,
            fontWeight:   600,
            color:        "#3D3D38",
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Landing
        </button>
      </div>
      <App />
    </div>
  );
}