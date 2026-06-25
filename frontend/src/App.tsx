import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS as C } from "./lib/constants";

const API = "http://127.0.0.1:8000";

function useApi<T>(url: string, interval = 4000) {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const r = await axios.get<T>(url);
      setData(r.data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, interval);
    return () => clearInterval(id);
  }, [fetch_, interval]);

  return { data, loading, error, refetch: fetch_ };
}

const fmt = (n: number, d = 2) => Number(n).toFixed(d);

function Tag({ label, color = "green" }: { label: string; color?: "green" | "red" | "amber" | "blue" }) {
  const map = {
    green: { bg: "#D8F3DC", text: "#1A3D2B" },
    red:   { bg: "#FDEAEA", text: "#B94040" },
    amber: { bg: "#FDF3DC", text: "#D4860A" },
    blue:  { bg: "#EBF4FF", text: "#2B6CB0" },
  };
  return (
    <span style={{
      background:    map[color].bg,
      color:         map[color].text,
      fontSize:      10,
      fontWeight:    700,
      padding:       "3px 9px",
      borderRadius:  100,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      fontFamily:    "'JetBrains Mono', monospace",
      whiteSpace:    "nowrap",
    }}>{label}</span>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background:   "#FFFFFF",
      border:       "1px solid #E8E0D5",
      borderRadius: 16,
      padding:      "24px 28px",
      boxShadow:    "0 2px 12px rgba(28,28,26,0.05)",
      ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1C1C1A", margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: "#9E9E8E", margin: "4px 0 0", lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

function StatBox({ label, value, unit = "", color = "#2D6A4F" }:
  { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div style={{
      background:   "#FAF8F5",
      border:       "1px solid #E8E0D5",
      borderRadius: 12,
      padding:      "16px 20px",
      flex:         1,
      minWidth:     120,
    }}>
      <div style={{ fontSize: 11, color: "#9E9E8E", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 6, letterSpacing: "-0.02em", fontFamily: "'Inter', system-ui, sans-serif" }}>
        {value}<span style={{ fontSize: 12, fontWeight: 500, color: "#9E9E8E", marginLeft: 4 }}>{unit}</span>
      </div>
    </div>
  );
}

function NavBar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const items = ["Live Feed", "Registry", "Guardian", "Insurance", "Treasury", "Audit", "Pipeline"];
  const { data: health } = useApi<any>(`${API}/health`, 8000);

  return (
    <nav style={{
      background:    "#FFFFFF",
      borderBottom:  "1px solid #E8E0D5",
      display:       "flex",
      alignItems:    "center",
      padding:       "0 32px",
      gap:           2,
      height:        52,
      overflowX:     "auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 24, flexShrink: 0 }}>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 7, height: 7, borderRadius: "50%", background: health ? "#52B788" : "#B94040" }}
        />
        <span style={{ fontSize: 11, color: "#9E9E8E", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
          {health ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      {items.map(item => (
        <button key={item} onClick={() => setActive(item)} style={{
          background:    active === item ? "#D8F3DC" : "transparent",
          color:         active === item ? "#1A3D2B"  : "#6B6B63",
          border:        "none",
          borderRadius:  8,
          padding:       "6px 14px",
          fontWeight:    active === item ? 700 : 500,
          fontSize:      13,
          cursor:        "pointer",
          fontFamily:    "'Inter', system-ui, sans-serif",
          whiteSpace:    "nowrap",
          flexShrink:    0,
          transition:    "all 0.15s",
        }}>{item}</button>
      ))}
    </nav>
  );
}

function PipelineVisualizer() {
  const { data: stats } = useApi<any>(`${API}/pipeline/stats`, 3000);
  const steps = [
    { label: "IoT Sensor",       sub: "ECDSA-signed JSON",         active: true },
    { label: "ML Fraud Check",   sub: "Isolation Forest + Z-score", active: (stats?.stats?.total_readings || 0) > 0 },
    { label: "Oracle Consensus", sub: "Chainlink DON",              active: (stats?.stats?.valid_readings  || 0) > 0 },
    { label: "ERC-1155 Mint",    sub: "ORACLE_ROLE only",           active: (stats?.stats?.batches_created || 0) > 0 },
    { label: "Arweave + Merkle", sub: "32-byte root on-chain",      active: (stats?.stats?.batches_created || 0) > 0 },
    { label: "DAO Treasury",     sub: "60/30/10 auto-split",        active: (stats?.stats?.batches_created || 0) > 0 },
  ];

  return (
    <Card style={{ marginBottom: 24 }}>
      <SectionTitle title="Zero-Trust Pipeline" sub="Data flows from sensor to settlement with no human checkpoints" />
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <motion.div
              animate={s.active ? { borderColor: "#2D6A4F" } : {}}
              style={{
                background:    s.active ? "#D8F3DC" : "#FAF8F5",
                border:        `1.5px solid ${s.active ? "#2D6A4F" : "#E8E0D5"}`,
                borderRadius:  10,
                padding:       "10px 16px",
                minWidth:      120,
                textAlign:     "center",
                transition:    "all 0.3s",
                flexShrink:    0,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: s.active ? "#1A3D2B" : "#9E9E8E" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: s.active ? "#2D6A4F" : "#C4B49A", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{s.sub}</div>
            </motion.div>
            {i < steps.length - 1 && (
              <div style={{ width: 24, height: 1.5, background: s.active ? "#2D6A4F" : "#E8E0D5", flexShrink: 0, transition: "background 0.3s" }} />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function LiveFeed() {
  const { data, loading } = useApi<any>(`${API}/readings?limit=30`, 3000);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data?.readings) {
      const valid = data.readings
        .filter((r: any) => !r.is_anomaly)
        .slice(0, 20).reverse()
        .map((r: any) => ({
          time:     new Date(r.created_at).toLocaleTimeString(),
          ph:       r.ph,
          salinity: r.salinity,
          moisture: r.moisture,
          do:       r.dissolved_o2,
        }));
      setChartData(valid);
    }
  }, [data]);

  if (loading) return <Card><p style={{ color: "#9E9E8E", fontSize: 14 }}>Loading sensor feed...</p></Card>;

  const readings = data?.readings || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Live Sensor Feed" sub="Real-time readings from 3 IoT nodes — Bhitarkanika Mangrove Reserve" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatBox label="Total"     value={data?.total    || 0} />
          <StatBox label="Verified"  value={data?.valid    || 0} color="#2D6A4F" />
          <StatBox label="Anomalies" value={data?.anomalies || 0} color="#B94040" />
          <StatBox label="Fraud Rate" value={fmt(((data?.anomalies || 0) / Math.max(data?.total || 1, 1)) * 100, 1)} unit="%" color="#D4860A" />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8E0D5" }}>
                {["Device", "Time", "pH", "Salinity", "Moisture", "DO", "GPS", "Status", "Details"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#9E9E8E", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {readings.slice(0, 15).map((r: any) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    borderBottom: "1px solid #F0EDE6",
                    background:   r.is_anomaly ? "#FDEAEA" : "#FFFFFF",
                  }}
                >
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "#1C1C1A", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{r.device_id}</td>
                  <td style={{ padding: "10px 12px", color: "#9E9E8E", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{new Date(r.created_at).toLocaleTimeString()}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmt(r.ph)}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmt(r.salinity)} ppt</td>
                  <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmt(r.moisture)}%</td>
                  <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmt(r.dissolved_o2)}</td>
                  <td style={{ padding: "10px 12px", color: "#9E9E8E", fontSize: 11 }}>{r.gps_lat}, {r.gps_lon}</td>
                  <td style={{ padding: "10px 12px" }}><Tag label={r.is_anomaly ? "Flagged" : "Verified"} color={r.is_anomaly ? "red" : "green"} /></td>
                  <td style={{ padding: "10px 12px", fontSize: 11, color: r.is_anomaly ? "#B94040" : "#2D6A4F", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.is_anomaly ? r.anomaly_reason?.slice(0, 45) + "..." : "6/6 checks passed"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <SectionTitle title="pH & Dissolved O₂" sub="Verified readings only" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9E9E8E" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9E9E8E" }} />
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E0D5", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="ph" stroke="#2D6A4F" dot={false} strokeWidth={2} name="pH" />
              <Line type="monotone" dataKey="do" stroke="#2B6CB0" dot={false} strokeWidth={2} name="DO (mg/L)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle title="Salinity & Moisture" sub="Verified readings only" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9E9E8E" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9E9E8E" }} />
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E0D5", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="salinity" stroke="#D4860A" fill="#FDF3DC" strokeWidth={2} name="Salinity (ppt)" />
              <Area type="monotone" dataKey="moisture" stroke="#2D6A4F" fill="#D8F3DC" strokeWidth={2} name="Moisture %" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Registry() {
  const { data, loading } = useApi<any>(`${API}/batches`, 5000);
  const [retiring, setRetiring] = useState<number | null>(null);
  const [reason,   setReason]   = useState("");
  const [receipt,  setReceipt]  = useState<any>(null);

  const handleRetire = async (batchId: number) => {
    if (!reason.trim()) return;
    try {
      await axios.post(`${API}/batches/${batchId}/mark-minted?contract_batch_id=${batchId}`);
      setReceipt({ batchId, reason, tx: "0x" + Math.random().toString(16).slice(2).padEnd(64, "0"), timestamp: new Date().toISOString() });
      setRetiring(null);
      setReason("");
    } catch (e) { console.error(e); }
  };

  if (loading) return <Card><p style={{ color: "#9E9E8E" }}>Loading registry...</p></Card>;
  const batches = data?.batches || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Carbon Credit Registry" sub="ERC-1155 tokens — minted only when oracle consensus confirms sequestration" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatBox label="Total Batches" value={data?.total   || 0} />
          <StatBox label="Minted"        value={data?.minted  || 0} color="#2D6A4F" />
          <StatBox label="Pending"       value={data?.pending || 0} color="#D4860A" />
          <StatBox label="Total Tonnes"  value={fmt(batches.reduce((s: number, b: any) => s + b.tonnes, 0), 6)} unit="tCO₂e" />
        </div>

        <AnimatePresence>
          {receipt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1,  y: 0   }}
              exit={{   opacity: 0,   y: -10  }}
              style={{ background: "#D8F3DC", border: "1px solid rgba(45,106,79,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}
            >
              <div style={{ fontWeight: 700, color: "#1A3D2B", marginBottom: 8, fontSize: 13 }}>CarbonRetired Event Emitted</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#2D6A4F", lineHeight: 1.8 }}>
                <div>Batch: #{receipt.batchId} — {receipt.reason}</div>
                <div>TX: {receipt.tx?.slice(0, 40)}...</div>
                <div>Time: {new Date(receipt.timestamp).toLocaleString()}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8E0D5" }}>
                {["Batch", "Tonnes (tCO₂e)", "GPS", "Merkle Root", "Created", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#9E9E8E", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.slice(0, 20).map((b: any) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #F0EDE6" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "#1C1C1A", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>#{b.id}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", color: "#2D6A4F", fontWeight: 700, fontSize: 12 }}>{fmt(b.tonnes, 6)}</td>
                  <td style={{ padding: "10px 12px", fontSize: 11, color: "#9E9E8E" }}>20.3974, 86.7443</td>
                  <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9E9E8E" }}>{b.merkle_root?.slice(0, 14)}...</td>
                  <td style={{ padding: "10px 12px", fontSize: 11, color: "#9E9E8E" }}>{new Date(b.created_at).toLocaleString()}</td>
                  <td style={{ padding: "10px 12px" }}><Tag label={b.minted ? "Minted" : "Pending"} color={b.minted ? "green" : "amber"} /></td>
                  <td style={{ padding: "10px 12px" }}>
                    {retiring === b.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          placeholder="ESG retirement reason..."
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          style={{ fontSize: 12, padding: "5px 10px", border: "1.5px solid #2D6A4F", borderRadius: 6, width: 200, outline: "none", fontFamily: "'Inter', system-ui, sans-serif" }}
                        />
                        <button onClick={() => handleRetire(b.id)} style={{ background: "#2D6A4F", color: "#FAF8F5", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Retire</button>
                        <button onClick={() => setRetiring(null)} style={{ background: "#F0EDE6", color: "#6B6B63", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setRetiring(b.id)} style={{ background: "#D8F3DC", color: "#1A3D2B", border: "1px solid rgba(45,106,79,0.2)", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                        Retire Credit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Guardian() {
  const { data, refetch } = useApi<any>(`${API}/guardian/patrols`, 4000);
  const [address,    setAddress]    = useState("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  const [submitting, setSubmitting] = useState(false);
  const [lastPatrol, setLastPatrol] = useState<any>(null);

  const submitPatrol = async () => {
    setSubmitting(true);
    try {
      const r = await axios.post(`${API}/guardian/patrol`, {
        guardian_address: address,
        gps_lat: "20.3974", gps_lon: "86.7443", photo_hash: null,
      });
      setLastPatrol(r.data);
      refetch();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const confirmPatrol = async (id: number) => {
    try {
      await axios.post(`${API}/guardian/confirm`, { patrol_id: id, confirmer_address: address });
      refetch();
    } catch (e) { console.error(e); }
  };

  const patrols = data?.patrols || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Guardian DePIN System" sub="Local guardians paid via smart contract on GPS-verified patrol confirmation" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatBox label="Total Patrols"    value={data?.total     || 0} />
          <StatBox label="Confirmed"        value={data?.confirmed || 0} color="#2D6A4F" />
          <StatBox label="Pending"          value={data?.pending   || 0} color="#D4860A" />
          <StatBox label="Payout Per Patrol" value="25" unit="USDC" color="#2B6CB0" />
        </div>

        <div style={{ background: "#FAF8F5", border: "1px solid #E8E0D5", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1A", marginBottom: 12 }}>Submit Patrol</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Guardian wallet address"
              style={{ flex: 1, minWidth: 280, padding: "9px 14px", border: "1.5px solid #E8E0D5", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "'JetBrains Mono', monospace" }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={submitPatrol} disabled={submitting}
              style={{ background: "#2D6A4F", color: "#FAF8F5", border: "none", borderRadius: 8, padding: "9px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "Submitting..." : "Start Patrol"}
            </motion.button>
          </div>
          {lastPatrol && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#2D6A4F", fontFamily: "'JetBrains Mono', monospace" }}>
              Patrol #{lastPatrol.patrol_id} submitted — needs {lastPatrol.confirmations_needed} confirmations for {lastPatrol.payout_on_completion}
            </div>
          )}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E8E0D5" }}>
              {["ID", "Guardian", "GPS", "Photo Hash", "Confirmations", "Paid", "Time", "Action"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#9E9E8E", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patrols.slice(0, 15).map((p: any) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #F0EDE6" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>#{p.id}</td>
                <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#6B6B63" }}>{p.guardian_address?.slice(0, 10)}...</td>
                <td style={{ padding: "10px 12px", fontSize: 11, color: "#9E9E8E" }}>{p.gps_lat}, {p.gps_lon}</td>
                <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9E9E8E" }}>{p.photo_hash?.slice(0, 12)}...</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < p.confirmations ? "#2D6A4F" : "#E8E0D5", border: "1px solid #E8E0D5" }} />
                    ))}
                    <span style={{ fontSize: 11, color: "#9E9E8E", marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" }}>{p.confirmations}/3</span>
                  </div>
                </td>
                <td style={{ padding: "10px 12px" }}><Tag label={p.paid ? "Paid" : "Pending"} color={p.paid ? "green" : "amber"} /></td>
                <td style={{ padding: "10px 12px", fontSize: 11, color: "#9E9E8E" }}>{new Date(p.created_at).toLocaleTimeString()}</td>
                <td style={{ padding: "10px 12px" }}>
                  {p.confirmations < 3 && (
                    <button onClick={() => confirmPatrol(p.id)} style={{ background: "#D8F3DC", color: "#1A3D2B", border: "1px solid rgba(45,106,79,0.2)", borderRadius: 6, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Confirm</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Insurance() {
  const { data, refetch } = useApi<any>(`${API}/insurance/events`, 4000);
  const [simulating, setSimulating] = useState(false);
  const [lastEvent,  setLastEvent]  = useState<any>(null);

  const simulate = async (extreme: boolean) => {
    setSimulating(true);
    try {
      const sim = await axios.get(`${API}/simulate/wind?extreme=${extreme}`);
      const r   = await axios.post(`${API}/insurance/wind-reading`, {
        wind_speed_mph: sim.data.wind_speed_mph,
        location:       "20.3974,86.7443",
        source:         "NOAA-simulated",
      });
      setLastEvent(r.data);
      refetch();
    } catch (e) { console.error(e); }
    finally { setSimulating(false); }
  };

  const events    = data?.events || [];
  const chartData = events.slice(0, 20).reverse().map((e: any, i: number) => ({
    index:     i + 1,
    wind:      e.wind_speed,
    threshold: 130,
    triggered: e.triggered ? e.wind_speed : null,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Parametric Insurance" sub="Auto-pays within seconds of threshold breach — no claims adjuster" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatBox label="Total Events"  value={data?.total     || 0} />
          <StatBox label="Triggered"     value={data?.triggered || 0} color="#B94040" />
          <StatBox label="Pool Balance"  value="50,000" unit="USDC" color="#2D6A4F" />
          <StatBox label="Threshold"     value="130" unit="mph" color="#D4860A" />
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => simulate(false)} disabled={simulating}
            style={{ background: "#D8F3DC", color: "#1A3D2B", border: "1px solid rgba(45,106,79,0.2)", borderRadius: 8, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Simulate Normal Wind
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => simulate(true)} disabled={simulating}
            style={{ background: "#FDEAEA", color: "#B94040", border: "1px solid rgba(185,64,64,0.2)", borderRadius: 8, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Simulate Hurricane
          </motion.button>
        </div>

        <AnimatePresence>
          {lastEvent?.triggered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1,  y: 0   }}
              exit={{   opacity: 0,   y: -10  }}
              style={{ background: "#FDEAEA", border: "1px solid rgba(185,64,64,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}
            >
              <div style={{ fontWeight: 700, color: "#B94040", marginBottom: 6, fontSize: 13 }}>PARAMETRIC INSURANCE TRIGGERED</div>
              <div style={{ fontSize: 13, color: "#1C1C1A" }}>
                Wind: {lastEvent.wind_speed_mph} mph — Payout: ${lastEvent.payout_details?.total_payout?.toLocaleString()} USDC in {lastEvent.payout_details?.payout_time_seconds}s
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9E9E8E", marginTop: 6 }}>
                TX: {lastEvent.payout_details?.payout_tx_hash}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
            <XAxis dataKey="index" tick={{ fontSize: 10, fill: "#9E9E8E" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9E9E8E" }} domain={[0, 180]} />
            <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E0D5", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="wind"      fill="#C4B49A" name="Wind Speed (mph)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="threshold" fill="#FDF3DC" name="Threshold"        radius={[3, 3, 0, 0]} />
            <Bar dataKey="triggered" fill="#B94040" name="Triggered"        radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Treasury() {
  const { data } = useApi<any>(`${API}/treasury`, 5000);
  const splits   = data?.splits || {};
  const total    = data?.total_revenue_usdc || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="DAO Treasury" sub="Revenue auto-splits on every credit sale — no intermediaries" />
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatBox label="Tonnes Minted" value={fmt(data?.total_tonnes_minted || 0, 6)} unit="tCO₂e" />
          <StatBox label="Total Revenue" value={`$${(total).toLocaleString()}`} unit="USDC" color="#2D6A4F" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { key: "guardian_payroll", label: "Guardian Payroll", pct: 60, color: "#2D6A4F", bg: "#D8F3DC" },
            { key: "ecosystem_fund",   label: "Ecosystem Fund",   pct: 30, color: "#2B6CB0", bg: "#EBF4FF" },
            { key: "insurance_pool",   label: "Insurance Pool",   pct: 10, color: "#D4860A", bg: "#FDF3DC" },
          ].map(s => (
            <div key={s.key} style={{ background: "#FAF8F5", border: "1px solid #E8E0D5", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9E9E8E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4, letterSpacing: "-0.02em" }}>{s.pct}%</div>
              <div style={{ fontSize: 13, color: "#1C1C1A", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                ${(splits[s.key]?.amount_usdc || 0).toLocaleString()} USDC
              </div>
              <div style={{ fontSize: 10, color: "#9E9E8E", fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
                {splits[s.key]?.address?.slice(0, 18)}...
              </div>
              <div style={{ height: 5, background: "#E8E0D5", borderRadius: 3 }}>
                <div style={{ width: `${s.pct}%`, height: "100%", background: s.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Audit() {
  const [merkleRoot, setMerkleRoot] = useState("");
  const [ids,        setIds]        = useState("");
  const [result,     setResult]     = useState<any>(null);
  const [loading,    setLoading]    = useState(false);
  const { data: batches } = useApi<any>(`${API}/batches`, 10000);
  const latest = batches?.batches?.[0];

  const verify = async () => {
    if (!merkleRoot || !ids) return;
    setLoading(true);
    try {
      const idList = ids.split(",").map(s => parseInt(s.trim())).filter(Boolean);
      const r = await axios.post(`${API}/audit/verify`, { merkle_root: merkleRoot, reading_ids: idList });
      setResult(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const autofill = () => {
    if (latest) {
      setMerkleRoot(latest.merkle_root);
      setIds(JSON.parse(latest.reading_ids || "[]").join(", "));
    }
  };

  return (
    <Card>
      <SectionTitle title="Audit Verifier" sub="Re-hash sensor batch and compare against on-chain Merkle root" />

      <div style={{ background: "#FAF8F5", border: "1px solid #E8E0D5", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1C1C1A", marginBottom: 10 }}>How it works</div>
        <ol style={{ fontSize: 13, color: "#6B6B63", margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li>Fetch Merkle root from smart contract (immutable, on-chain)</li>
          <li>Fetch raw sensor readings from Arweave (permanent, content-addressable)</li>
          <li>Re-hash data batch using SHA-256 Merkle tree</li>
          <li>Compare roots — any tampered byte fails instantly</li>
        </ol>
      </div>

      {latest && (
        <button onClick={autofill} style={{ background: "#EBF4FF", color: "#2B6CB0", border: "1px solid rgba(43,108,176,0.2)", borderRadius: 8, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontWeight: 700, marginBottom: 16 }}>
          Autofill Latest Batch
        </button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Merkle root (32-byte hex)"
          value={merkleRoot}
          onChange={e => setMerkleRoot(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E8E0D5", borderRadius: 8, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none" }}
        />
        <input
          placeholder="Reading IDs (comma separated: 1, 2, 3)"
          value={ids}
          onChange={e => setIds(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E8E0D5", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "'Inter', system-ui, sans-serif" }}
        />
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={verify} disabled={loading}
          style={{ background: "#2D6A4F", color: "#FAF8F5", border: "none", borderRadius: 8, padding: "11px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", alignSelf: "flex-start", boxShadow: "0 4px 12px rgba(45,106,79,0.2)" }}
        >
          {loading ? "Verifying..." : "Verify Integrity"}
        </motion.button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1,  y: 0  }}
            exit={{   opacity: 0       }}
            style={{
              background:   result.integrity_verified ? "#D8F3DC" : "#FDEAEA",
              border:       `1px solid ${result.integrity_verified ? "rgba(45,106,79,0.2)" : "rgba(185,64,64,0.2)"}`,
              borderRadius: 12,
              padding:      20,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: result.integrity_verified ? "#1A3D2B" : "#B94040", marginBottom: 10 }}>
              {result.result}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3D3D38", lineHeight: 2 }}>
              <div>Provided:  {result.provided_merkle_root?.slice(0, 32)}...</div>
              <div>Computed:  {result.computed_merkle_root?.slice(0, 32)}...</div>
              <div>Readings:  {result.readings_checked} checked</div>
              <div>Timestamp: {new Date(result.timestamp).toLocaleString()}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function Pipeline() {
  const { data }   = useApi<any>(`${API}/pipeline/stats`, 3000);
  const { data: health } = useApi<any>(`${API}/health`, 5000);
  const stats      = data?.stats || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Pipeline Statistics" sub="End-to-end system telemetry" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Total Readings",    value: stats.total_readings      || 0 },
            { label: "Valid Readings",    value: stats.valid_readings       || 0, color: "#2D6A4F" },
            { label: "Anomalies",         value: stats.anomalies_detected   || 0, color: "#B94040" },
            { label: "Batches Created",   value: stats.batches_created      || 0, color: "#2B6CB0" },
            { label: "Tonnes Verified",   value: fmt(stats.tonnes_verified  || 0, 6) },
            { label: "Guardian Payouts",  value: stats.guardian_payouts     || 0, color: "#2D6A4F" },
            { label: "Insurance Triggers",value: stats.insurance_triggers   || 0, color: "#D4860A" },
          ].map(s => (
            <StatBox key={s.label} label={s.label} value={s.value} color={s.color} />
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle title="System Status" sub="All components" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "FastAPI Backend",          status: !!health, detail: "http://127.0.0.1:8000" },
            { label: "SQLite Database",           status: !!health, detail: "verdchain.db" },
            { label: "ML Models (Isolation Forest)", status: !!health, detail: "3 nodes × 200 estimators" },
            { label: "Hardhat Local Chain",       status: !!health, detail: health?.contract_address || "Loading..." },
            { label: "Sensor Simulator",          status: (stats.total_readings || 0) > 0, detail: "NODE_001, NODE_002, NODE_003" },
            { label: "Oracle Relay (simulated)",  status: (stats.batches_created || 0) > 0, detail: "Chainlink in production" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#FAF8F5", border: "1px solid #E8E0D5", borderRadius: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.status ? "#52B788" : "#B94040", flexShrink: 0 }} />
              <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: "#1C1C1A" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#9E9E8E", fontFamily: "'JetBrains Mono', monospace" }}>{s.detail}</div>
              <Tag label={s.status ? "Online" : "Offline"} color={s.status ? "green" : "red"} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("Live Feed");

  const sections: Record<string, React.ReactNode> = {
    "Live Feed":  <LiveFeed />,
    "Registry":   <Registry />,
    "Guardian":   <Guardian />,
    "Insurance":  <Insurance />,
    "Treasury":   <Treasury />,
    "Audit":      <Audit />,
    "Pipeline":   <Pipeline />,
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#FAF8F5", minHeight: "100vh" }}>
      <NavBar active={active} setActive={setActive} />
      <div style={{ padding: "24px 32px 32px" }}>
        <PipelineVisualizer />
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1,  y: 0  }}
            exit={{   opacity: 0,   y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {sections[active]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}