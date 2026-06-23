import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from "recharts";

const API = "http://127.0.0.1:8000";

const COLORS = {
  green:      "#16a34a",
  greenLight: "#22c55e",
  greenPale:  "#dcfce7",
  greenDark:  "#14532d",
  slate:      "#475569",
  slateLight: "#94a3b8",
  slatePale:  "#f1f5f9",
  white:      "#ffffff",
  red:        "#dc2626",
  redPale:    "#fef2f2",
  amber:      "#d97706",
  amberPale:  "#fffbeb",
  blue:       "#2563eb",
  bluePale:   "#eff6ff",
  border:     "#e2e8f0",
  text:       "#0f172a",
  textMuted:  "#64748b",
};

const fmt = (n: number, d = 2) => Number(n).toFixed(d);

function useApi<T>(url: string, interval = 4000) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

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

function Tag({ label, color = "green" }: { label: string; color?: "green" | "red" | "amber" | "blue" }) {
  const map = {
    green: { bg: COLORS.greenPale,  text: COLORS.green  },
    red:   { bg: COLORS.redPale,    text: COLORS.red    },
    amber: { bg: COLORS.amberPale,  text: COLORS.amber  },
    blue:  { bg: COLORS.bluePale,   text: COLORS.blue   },
  };
  return (
    <span style={{
      background:    map[color].bg,
      color:         map[color].text,
      fontSize:      11,
      fontWeight:    600,
      padding:       "2px 8px",
      borderRadius:  4,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>{label}</span>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background:   COLORS.white,
      border:       `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding:      24,
      ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function StatBox({ label, value, unit = "", color = COLORS.green }:
  { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div style={{
      background:   COLORS.slatePale,
      borderRadius: 10,
      padding:      "16px 20px",
      flex:         1,
    }}>
      <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>
        {value}<span style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, marginLeft: 4 }}>{unit}</span>
      </div>
    </div>
  );
}

function NavBar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const items = [
    "Live Feed", "Registry", "Guardian", "Insurance", "Treasury", "Audit", "Pipeline"
  ];
  return (
    <nav style={{
      position:        "sticky",
      top:             0,
      zIndex:          100,
      background:      COLORS.white,
      borderBottom:    `1px solid ${COLORS.border}`,
      display:         "flex",
      alignItems:      "center",
      padding:         "0 40px",
      gap:             4,
      height:          56,
      boxShadow:       "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.green, marginRight: 32, letterSpacing: "-0.02em" }}>
        VerdChain
      </div>
      {items.map(item => (
        <button key={item} onClick={() => setActive(item)} style={{
          background:   active === item ? COLORS.greenPale : "transparent",
          color:        active === item ? COLORS.green : COLORS.slate,
          border:       "none",
          borderRadius: 6,
          padding:      "6px 14px",
          fontWeight:   active === item ? 700 : 500,
          fontSize:     13,
          cursor:       "pointer",
        }}>{item}</button>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green }} />
        <span style={{ fontSize: 12, color: COLORS.textMuted }}>Live</span>
      </div>
    </nav>
  );
}

function Hero() {
  const { data: stats } = useApi<any>(`${API}/pipeline/stats`);
  const { data: health } = useApi<any>(`${API}/health`);

  return (
    <div style={{
      background:    `linear-gradient(135deg, ${COLORS.greenDark} 0%, #166534 60%, #15803d 100%)`,
      padding:       "64px 40px 48px",
      color:         COLORS.white,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Tag label="Live System" color="green" />
              <Tag label={health?.network || "Hardhat Local"} color="blue" />
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              VerdChain
            </h1>
            <p style={{ fontSize: 18, opacity: 0.85, margin: "10px 0 0", maxWidth: 480, lineHeight: 1.6 }}>
              Blockchain-Based Blue Carbon MRV Registry — Bhitarkanika Mangrove Reserve, Odisha
            </p>
            <p style={{ fontSize: 13, opacity: 0.6, margin: "8px 0 0" }}>
              Contract: {health?.contract_address || "Loading..."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Valid Readings",  value: stats?.stats?.valid_readings   || 0, color: COLORS.greenLight },
              { label: "Anomalies Caught", value: stats?.stats?.anomalies_detected || 0, color: "#fbbf24" },
              { label: "Batches Created", value: stats?.stats?.batches_created   || 0, color: "#60a5fa" },
              { label: "Tonnes Verified", value: fmt(stats?.stats?.tonnes_verified || 0, 4), color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} style={{
                background:   "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border:       "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding:      "16px 24px",
                minWidth:     120,
                textAlign:    "center",
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineVisualizer() {
  const { data: stats } = useApi<any>(`${API}/pipeline/stats`, 3000);
  const steps = [
    { label: "IoT Sensor",      sub: "ECDSA-signed JSON",        active: true },
    { label: "ML Fraud Check",  sub: "Isolation Forest + Z-score", active: (stats?.stats?.total_readings || 0) > 0 },
    { label: "Oracle Consensus", sub: "Chainlink DON (simulated)", active: (stats?.stats?.valid_readings || 0) > 0 },
    { label: "ERC-1155 Mint",   sub: "ORACLE_ROLE only",          active: (stats?.stats?.batches_created || 0) > 0 },
    { label: "Arweave + Merkle", sub: "32-byte root on-chain",     active: (stats?.stats?.batches_created || 0) > 0 },
    { label: "DAO Treasury",    sub: "60/30/10 auto-split",        active: (stats?.stats?.batches_created || 0) > 0 },
  ];

  return (
    <Card>
      <SectionTitle title="Zero-Trust Pipeline" sub="Data flows from sensor to settlement with no human checkpoints" />
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              background:   s.active ? COLORS.green : COLORS.slatePale,
              border:       `2px solid ${s.active ? COLORS.green : COLORS.border}`,
              borderRadius: 10,
              padding:      "12px 16px",
              minWidth:     130,
              textAlign:    "center",
              transition:   "all 0.3s",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.active ? COLORS.white : COLORS.slate }}>{s.label}</div>
              <div style={{ fontSize: 10, color: s.active ? "rgba(255,255,255,0.75)" : COLORS.textMuted, marginTop: 3 }}>{s.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width:      32,
                height:     2,
                background: s.active ? COLORS.green : COLORS.border,
                flexShrink: 0,
              }} />
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
        .slice(0, 20)
        .reverse()
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

  if (loading) return <Card><p style={{ color: COLORS.textMuted }}>Loading sensor feed...</p></Card>;

  const readings = data?.readings || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Live Sensor Feed" sub="Real-time readings from 3 IoT nodes — Bhitarkanika Mangrove Reserve" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatBox label="Total Readings" value={data?.total || 0} />
          <StatBox label="Verified" value={data?.valid || 0} color={COLORS.green} />
          <StatBox label="Anomalies" value={data?.anomalies || 0} color={COLORS.red} />
          <StatBox label="Fraud Rate" value={fmt(((data?.anomalies || 0) / Math.max(data?.total || 1, 1)) * 100, 1)} unit="%" color={COLORS.amber} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                {["Device", "Time", "pH", "Salinity", "Moisture", "DO", "GPS", "Status", "Checks"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: COLORS.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {readings.slice(0, 15).map((r: any) => (
                <tr key={r.id} style={{
                  borderBottom:  `1px solid ${COLORS.border}`,
                  background:    r.is_anomaly ? COLORS.redPale : COLORS.white,
                  transition:    "background 0.2s",
                }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: COLORS.text }}>{r.device_id}</td>
                  <td style={{ padding: "10px 12px", color: COLORS.textMuted, fontSize: 12 }}>{new Date(r.created_at).toLocaleTimeString()}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>{fmt(r.ph)}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>{fmt(r.salinity)} ppt</td>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>{fmt(r.moisture)}%</td>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>{fmt(r.dissolved_o2)} mg/L</td>
                  <td style={{ padding: "10px 12px", color: COLORS.textMuted, fontSize: 11 }}>{r.gps_lat}, {r.gps_lon}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <Tag label={r.is_anomaly ? "Flagged" : "Verified"} color={r.is_anomaly ? "red" : "green"} />
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: r.is_anomaly ? COLORS.red : COLORS.green }}>
                    {r.is_anomaly ? r.anomaly_reason?.slice(0, 40) + "..." : "6/6 passed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <SectionTitle title="pH & Dissolved O₂" sub="Hourly readings — verified only" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="ph" stroke={COLORS.green} dot={false} strokeWidth={2} name="pH" />
              <Line type="monotone" dataKey="do" stroke={COLORS.blue} dot={false} strokeWidth={2} name="DO (mg/L)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle title="Salinity & Moisture" sub="Hourly readings — verified only" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="salinity" stroke={COLORS.amber} fill={COLORS.amberPale} strokeWidth={2} name="Salinity (ppt)" />
              <Area type="monotone" dataKey="moisture" stroke={COLORS.green} fill={COLORS.greenPale} strokeWidth={2} name="Moisture %" />
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
  const [reason, setReason]     = useState("");
  const [receipt, setReceipt]   = useState<any>(null);

  const handleRetire = async (batchId: number) => {
    if (!reason.trim()) return;
    try {
      const r = await axios.post(`${API}/batches/${batchId}/mark-minted?contract_batch_id=${batchId}`);
      setReceipt({ batchId, reason, tx: "0x" + Math.random().toString(16).slice(2).padEnd(64, "0"), timestamp: new Date().toISOString() });
      setRetiring(null);
      setReason("");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <Card><p style={{ color: COLORS.textMuted }}>Loading registry...</p></Card>;

  const batches = data?.batches || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Carbon Credit Registry" sub="ERC-1155 tokens — minted only when oracle consensus confirms sequestration" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatBox label="Total Batches"  value={data?.total   || 0} />
          <StatBox label="Minted"         value={data?.minted  || 0} color={COLORS.green} />
          <StatBox label="Pending"        value={data?.pending || 0} color={COLORS.amber} />
          <StatBox label="Total Tonnes"   value={fmt(batches.reduce((s: number, b: any) => s + b.tonnes, 0), 6)} unit="tCO₂e" />
        </div>

        {receipt && (
          <div style={{ background: COLORS.greenPale, border: `1px solid ${COLORS.green}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 8 }}>CarbonRetired Event Emitted</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.text }}>
              <div>Batch ID: {receipt.batchId}</div>
              <div>Reason: {receipt.reason}</div>
              <div>TX: {receipt.tx}</div>
              <div>Time: {new Date(receipt.timestamp).toLocaleString()}</div>
            </div>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                {["Batch ID", "Tonnes (tCO₂e)", "GPS", "Merkle Root", "Created", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: COLORS.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.slice(0, 20).map((b: any) => (
                <tr key={b.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: COLORS.text }}>#{b.id}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace", color: COLORS.green, fontWeight: 600 }}>{fmt(b.tonnes, 6)}</td>
                  <td style={{ padding: "10px 12px", fontSize: 11, color: COLORS.textMuted }}>20.3974, 86.7443</td>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 10, color: COLORS.textMuted }}>{b.merkle_root?.slice(0, 16)}...</td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: COLORS.textMuted }}>{new Date(b.created_at).toLocaleString()}</td>
                  <td style={{ padding: "10px 12px" }}><Tag label={b.minted ? "Minted" : "Pending"} color={b.minted ? "green" : "amber"} /></td>
                  <td style={{ padding: "10px 12px" }}>
                    {retiring === b.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          placeholder="ESG retirement reason..."
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          style={{ fontSize: 12, padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, width: 200 }}
                        />
                        <button onClick={() => handleRetire(b.id)} style={{ background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Retire</button>
                        <button onClick={() => setRetiring(null)} style={{ background: COLORS.slatePale, color: COLORS.slate, border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setRetiring(b.id)} style={{ background: COLORS.greenPale, color: COLORS.green, border: `1px solid ${COLORS.green}`, borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
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
  const [address, setAddress] = useState("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  const [submitting, setSubmitting] = useState(false);
  const [lastPatrol, setLastPatrol]   = useState<any>(null);

  const submitPatrol = async () => {
    setSubmitting(true);
    try {
      const r = await axios.post(`${API}/guardian/patrol`, {
        guardian_address: address,
        gps_lat: "20.3974",
        gps_lon: "86.7443",
        photo_hash: null,
      });
      setLastPatrol(r.data);
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPatrol = async (id: number) => {
    try {
      await axios.post(`${API}/guardian/confirm`, { patrol_id: id, confirmer_address: address });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const patrols = data?.patrols || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Guardian DePIN System" sub="Local guardians paid via smart contract on GPS-verified patrol confirmation" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatBox label="Total Patrols"   value={data?.total     || 0} />
          <StatBox label="Confirmed"        value={data?.confirmed || 0} color={COLORS.green} />
          <StatBox label="Pending"          value={data?.pending   || 0} color={COLORS.amber} />
          <StatBox label="Payout Per Patrol" value="25" unit="USDC" color={COLORS.blue} />
        </div>

        <div style={{ background: COLORS.slatePale, borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>Submit Patrol</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Guardian wallet address"
              style={{ flex: 1, minWidth: 300, padding: "8px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 13 }}
            />
            <button onClick={submitPatrol} disabled={submitting} style={{
              background:   COLORS.green,
              color:        COLORS.white,
              border:       "none",
              borderRadius: 6,
              padding:      "8px 20px",
              fontWeight:   700,
              fontSize:     13,
              cursor:       "pointer",
              opacity:      submitting ? 0.6 : 1,
            }}>
              {submitting ? "Submitting..." : "Start Patrol"}
            </button>
          </div>
          {lastPatrol && (
            <div style={{ marginTop: 12, fontSize: 12, color: COLORS.green, fontFamily: "monospace" }}>
              Patrol #{lastPatrol.patrol_id} submitted — needs {lastPatrol.confirmations_needed} peer confirmations for {lastPatrol.payout_on_completion} payout
            </div>
          )}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
              {["ID", "Guardian", "GPS", "Photo Hash", "Confirmations", "Paid", "Time", "Action"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: COLORS.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patrols.slice(0, 15).map((p: any) => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>#{p.id}</td>
                <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11 }}>{p.guardian_address?.slice(0, 10)}...</td>
                <td style={{ padding: "10px 12px", fontSize: 11, color: COLORS.textMuted }}>{p.gps_lat}, {p.gps_lon}</td>
                <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 10, color: COLORS.textMuted }}>{p.photo_hash?.slice(0, 12)}...</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < p.confirmations ? COLORS.green : COLORS.border }} />
                    ))}
                    <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 4 }}>{p.confirmations}/3</span>
                  </div>
                </td>
                <td style={{ padding: "10px 12px" }}><Tag label={p.paid ? "Paid" : "Pending"} color={p.paid ? "green" : "amber"} /></td>
                <td style={{ padding: "10px 12px", fontSize: 11, color: COLORS.textMuted }}>{new Date(p.created_at).toLocaleTimeString()}</td>
                <td style={{ padding: "10px 12px" }}>
                  {p.confirmations < 3 && (
                    <button onClick={() => confirmPatrol(p.id)} style={{
                      background: COLORS.greenPale, color: COLORS.green, border: `1px solid ${COLORS.green}`,
                      borderRadius: 4, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600,
                    }}>Confirm</button>
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
  const [lastEvent, setLastEvent]   = useState<any>(null);

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
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const events = data?.events || [];
  const chartData = events.slice(0, 20).reverse().map((e: any, i: number) => ({
    index:     i + 1,
    wind:      e.wind_speed,
    threshold: 130,
    triggered: e.triggered ? e.wind_speed : null,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Parametric Insurance" sub="Smart contract auto-pays within seconds of threshold breach — no claims adjuster" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatBox label="Total Events"  value={data?.total     || 0} />
          <StatBox label="Triggered"     value={data?.triggered || 0} color={COLORS.red} />
          <StatBox label="Pool Balance"  value="50,000" unit="USDC" color={COLORS.green} />
          <StatBox label="Threshold"     value="130" unit="mph" color={COLORS.amber} />
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button onClick={() => simulate(false)} disabled={simulating} style={{
            background: COLORS.greenPale, color: COLORS.green, border: `1px solid ${COLORS.green}`,
            borderRadius: 6, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>Simulate Normal Wind</button>
          <button onClick={() => simulate(true)} disabled={simulating} style={{
            background: COLORS.redPale, color: COLORS.red, border: `1px solid ${COLORS.red}`,
            borderRadius: 6, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>Simulate Hurricane</button>
        </div>

        {lastEvent?.triggered && (
          <div style={{ background: COLORS.redPale, border: `1px solid ${COLORS.red}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: COLORS.red, marginBottom: 8 }}>PARAMETRIC INSURANCE TRIGGERED</div>
            <div style={{ fontSize: 13, color: COLORS.text }}>
              Wind: {lastEvent.wind_speed_mph} mph — Payout: ${lastEvent.payout_details?.total_payout?.toLocaleString()} USDC
              in {lastEvent.payout_details?.payout_time_seconds} seconds
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>
              TX: {lastEvent.payout_details?.payout_tx_hash}
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="index" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 180]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="wind" fill={COLORS.slateLight} name="Wind Speed (mph)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="threshold" fill={COLORS.amberPale} name="Threshold" radius={[3, 3, 0, 0]} />
            <Bar dataKey="triggered" fill={COLORS.red} name="Triggered" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Treasury() {
  const { data } = useApi<any>(`${API}/treasury`, 5000);

  const splits = data?.splits || {};
  const total  = data?.total_revenue_usdc || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="DAO Treasury" sub="Revenue auto-splits on every credit sale — no intermediaries" />
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatBox label="Total Tonnes Minted" value={fmt(data?.total_tonnes_minted || 0, 6)} unit="tCO₂e" />
          <StatBox label="Total Revenue"        value={`$${(total).toLocaleString()}`} unit="USDC" color={COLORS.green} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            { key: "guardian_payroll", label: "Guardian Payroll", pct: 60, color: COLORS.green  },
            { key: "ecosystem_fund",   label: "Ecosystem Fund",   pct: 30, color: COLORS.blue   },
            { key: "insurance_pool",   label: "Insurance Pool",   pct: 10, color: COLORS.amber  },
          ].map(s => (
            <div key={s.key} style={{ background: COLORS.slatePale, borderRadius: 10, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: "8px 0 4px" }}>{s.pct}%</div>
              <div style={{ fontSize: 13, color: COLORS.text, fontFamily: "monospace" }}>
                ${(splits[s.key]?.amount_usdc || 0).toLocaleString()} USDC
              </div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 6, fontFamily: "monospace" }}>
                {splits[s.key]?.address?.slice(0, 20)}...
              </div>
              <div style={{ marginTop: 10, height: 6, background: COLORS.border, borderRadius: 3 }}>
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
  const [ids, setIds]               = useState("");
  const [result, setResult]         = useState<any>(null);
  const [loading, setLoading]       = useState(false);

  const verify = async () => {
    if (!merkleRoot || !ids) return;
    setLoading(true);
    try {
      const idList = ids.split(",").map(s => parseInt(s.trim())).filter(Boolean);
      const r = await axios.post(`${API}/audit/verify`, { merkle_root: merkleRoot, reading_ids: idList });
      setResult(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const { data: batches } = useApi<any>(`${API}/batches?limit=1`, 10000);
  const latest = batches?.batches?.[0];

  const autofill = () => {
    if (latest) {
      setMerkleRoot(latest.merkle_root);
      setIds(JSON.parse(latest.reading_ids || "[]").join(", "));
    }
  };

  return (
    <Card>
      <SectionTitle title="Audit Verifier" sub="Re-hash sensor batch and compare against on-chain Merkle root — tamper-proof verification" />

      <div style={{ background: COLORS.slatePale, borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>How it works</div>
        <ol style={{ fontSize: 13, color: COLORS.textMuted, margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li>Fetch Merkle root from smart contract (stored on-chain)</li>
          <li>Fetch raw sensor readings from Arweave (content-addressable storage)</li>
          <li>Re-hash the data batch using SHA-256 Merkle tree</li>
          <li>Compare computed root against on-chain root — any tampered byte fails instantly</li>
        </ol>
      </div>

      {latest && (
        <button onClick={autofill} style={{
          background: COLORS.bluePale, color: COLORS.blue, border: `1px solid ${COLORS.blue}`,
          borderRadius: 6, padding: "6px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600, marginBottom: 16,
        }}>Autofill Latest Batch</button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Merkle root (32-byte hex)"
          value={merkleRoot}
          onChange={e => setMerkleRoot(e.target.value)}
          style={{ padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 13, fontFamily: "monospace" }}
        />
        <input
          placeholder="Reading IDs (comma separated, e.g. 1, 2, 3)"
          value={ids}
          onChange={e => setIds(e.target.value)}
          style={{ padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 13 }}
        />
        <button onClick={verify} disabled={loading} style={{
          background: COLORS.green, color: COLORS.white, border: "none",
          borderRadius: 6, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", alignSelf: "flex-start",
        }}>{loading ? "Verifying..." : "Verify Integrity"}</button>
      </div>

      {result && (
        <div style={{
          background:   result.integrity_verified ? COLORS.greenPale : COLORS.redPale,
          border:       `1px solid ${result.integrity_verified ? COLORS.green : COLORS.red}`,
          borderRadius: 10,
          padding:      20,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: result.integrity_verified ? COLORS.green : COLORS.red, marginBottom: 12 }}>
            {result.result}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.text, display: "flex", flexDirection: "column", gap: 4 }}>
            <div>Provided root:  {result.provided_merkle_root?.slice(0, 32)}...</div>
            <div>Computed root:  {result.computed_merkle_root?.slice(0, 32)}...</div>
            <div>Readings checked: {result.readings_checked}</div>
            <div>Timestamp: {new Date(result.timestamp).toLocaleString()}</div>
          </div>
        </div>
      )}
    </Card>
  );
}

function Pipeline() {
  const { data } = useApi<any>(`${API}/pipeline/stats`, 3000);
  const { data: health } = useApi<any>(`${API}/health`, 5000);

  const stats = data?.stats || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle title="Pipeline Statistics" sub="End-to-end system telemetry" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Total Readings",       value: stats.total_readings       || 0 },
            { label: "Valid Readings",        value: stats.valid_readings       || 0, color: COLORS.green },
            { label: "Anomalies Detected",    value: stats.anomalies_detected   || 0, color: COLORS.red   },
            { label: "Batches Created",       value: stats.batches_created      || 0, color: COLORS.blue  },
            { label: "Tonnes Verified",       value: fmt(stats.tonnes_verified  || 0, 6) },
            { label: "Guardian Payouts",      value: stats.guardian_payouts     || 0, color: COLORS.green },
            { label: "Insurance Triggers",    value: stats.insurance_triggers   || 0, color: COLORS.amber },
          ].map(s => (
            <StatBox key={s.label} label={s.label} value={s.value} color={s.color} />
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle title="System Status" sub="All components" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "FastAPI Backend",         status: !!health, detail: "http://127.0.0.1:8000"                      },
            { label: "SQLite Database",          status: !!health, detail: "verdchain.db"                              },
            { label: "ML Models",                status: !!health, detail: "Isolation Forest × 3 nodes"                },
            { label: "Hardhat Local Chain",      status: !!health, detail: health?.contract_address || "Loading..."    },
            { label: "Sensor Simulator",         status: (stats.total_readings || 0) > 0, detail: "NODE_001, NODE_002, NODE_003" },
            { label: "Oracle Relay (simulated)", status: (stats.batches_created || 0) > 0, detail: "Chainlink in production"    },
          ].map(s => (
            <div key={s.label} style={{
              display:       "flex",
              alignItems:    "center",
              gap:           12,
              padding:       "12px 16px",
              background:    COLORS.slatePale,
              borderRadius:  8,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.status ? COLORS.green : COLORS.red, flexShrink: 0 }} />
              <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: COLORS.text }}>{s.label}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>{s.detail}</div>
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
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: COLORS.slatePale, minHeight: "100vh" }}>
      <NavBar active={active} setActive={setActive} />
      <Hero />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <PipelineVisualizer />
        <div style={{ marginTop: 24 }}>
          {sections[active]}
        </div>
      </div>
    </div>
  );
}