export const API = "http://127.0.0.1:8000";

export const COLORS = {
  // Warm base — inspired by melinegobet.fr
  cream:        "#FAF8F5",
  creamDark:    "#F2EDE6",
  creamBorder:  "#E8E0D5",

  // Deep warm charcoal
  charcoal:     "#1C1C1A",
  charcoalMid:  "#3D3D38",
  charcoalLight:"#6B6B63",

  // Forest greens — VerdChain identity
  greenDeep:    "#1A3D2B",
  greenForest:  "#2D6A4F",
  greenSage:    "#52B788",
  greenMint:    "#95D5B2",
  greenPale:    "#D8F3DC",

  // Warm earth accents
  earth:        "#8B5E3C",
  earthLight:   "#C49A6C",
  earthPale:    "#F5E6D3",

  // Sand and stone
  sand:         "#E8DCC8",
  sandDark:     "#C4B49A",
  stone:        "#9E9E8E",

  // Status colors — warm versions
  amber:        "#D4860A",
  amberPale:    "#FDF3DC",
  red:          "#B94040",
  redPale:      "#FDEAEA",
  blue:         "#2B6CB0",
  bluePale:     "#EBF4FF",

  white:        "#FFFFFF",
  border:       "#E2D9CC",
  shadow:       "rgba(28, 28, 26, 0.08)",
};

export const FONTS = {
  serif:   "'Playfair Display', Georgia, serif",
  sans:    "'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
};

export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const GUARDIAN_POOL    = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
export const ECOSYSTEM_FUND   = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
export const INSURANCE_POOL   = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

export const GPS_PLOTS = [
  { id: "NODE_001", name: "Bhitarkanika North Plot", lat: "20.3974", lon: "86.7443" },
  { id: "NODE_002", name: "Bhitarkanika South Plot", lat: "20.4125", lon: "86.7891" },
  { id: "NODE_003", name: "Bhitarkanika East Plot",  lat: "20.3856", lon: "86.7612" },
];

export const MARQUEE_ITEMS = [
  { text: "Real-time MRV Tracking",           tag: "LIVE"      },
  { text: "On-Chain Carbon Audit Trail",       tag: "VERIFIED"  },
  { text: "ML Fraud Detection Active",         tag: "AI"        },
  { text: "Merkle Root Anchored",              tag: "CRYPTOGRAPHIC" },
  { text: "Guardian DePIN Payroll",            tag: "DEPIN"     },
  { text: "Parametric Insurance Pool",         tag: "ACTIVE"    },
  { text: "ERC-1155 Carbon Credits",           tag: "WEB3"      },
  { text: "Bhitarkanika Mangrove Reserve",     tag: "ODISHA"    },
  { text: "Zero Human Intermediaries",         tag: "AUTONOMOUS"},
  { text: "Isolation Forest Anomaly Model",    tag: "ML"        },
  { text: "Chainlink Oracle Consensus",        tag: "ORACLE"    },
  { text: "DAO Treasury Auto-Split",           tag: "60/30/10"  },
];

export const ARCHITECTURE_LAYERS = [
  {
    number:      "01",
    title:       "Zero-Trust IoT Sensor Network",
    description: "ESP32 nodes with HSM secure enclaves measure pH, salinity, soil moisture, and dissolved oxygen every hour. Every reading is ECDSA-signed before leaving the device. Physical tamper destroys the private key permanently.",
    tags:        ["ESP32", "HSM", "ECDSA", "LoRaWAN"],
    metric:      "3 Active Nodes",
    metricSub:   "Bhitarkanika Reserve",
    color:       "#2D6A4F",
  },
  {
    number:      "02",
    title:       "ML Anomaly Detection Engine",
    description: "Isolation Forest model trained on 500 synthetic baseline readings. Catches three attack vectors: sudden spike, slow drift, and neighbour spoofing. Every flagged node is quarantined instantly — no human override possible.",
    tags:        ["Isolation Forest", "Z-score 2.5σ", "NDVI Cross-check"],
    metric:      "6 Checks Per Reading",
    metricSub:   "Zero false negatives tolerated",
    color:       "#8B5E3C",
  },
  {
    number:      "03",
    title:       "Decentralized Oracle Consensus",
    description: "Chainlink DON cross-references sensor data against NOAA satellite imagery and government weather stations simultaneously. Supermajority agreement required before any data reaches the smart contract.",
    tags:        ["Chainlink", "NOAA", "Byzantine Fault Tolerant"],
    metric:      "Multi-source Consensus",
    metricSub:   "No single point of failure",
    color:       "#2B6CB0",
  },
  {
    number:      "04",
    title:       "ERC-1155 Carbon Credit Registry",
    description: "mint() is locked behind ORACLE_ROLE — no human wallet can call it. Each token carries GPS coordinates, vintage year, timestamp, and an Arweave content hash. retire() emits a permanent CarbonRetired event for ESG auditors.",
    tags:        ["ERC-1155", "OpenZeppelin", "ORACLE_ROLE", "Solidity 0.8.28"],
    metric:      "0 Human Mint Calls",
    metricSub:   "Fully autonomous issuance",
    color:       "#1A3D2B",
  },
  {
    number:      "05",
    title:       "Arweave + Merkle Proof Storage",
    description: "Sensor batches uploaded every 6 hours. Assembled into a SHA-256 Merkle tree off-chain. Only the 32-byte root stored on-chain. Any auditor can independently re-hash raw logs and verify — tampered data fails instantly.",
    tags:        ["Arweave", "SHA-256", "Merkle Tree", "Content-Addressable"],
    metric:      "32 Bytes On-Chain",
    metricSub:   "Full logs on Arweave",
    color:       "#6B4226",
  },
  {
    number:      "06",
    title:       "Autonomous Ecological Entity",
    description: "Carbon revenue hits the forest DAO treasury directly. Auto-splits instantly: 60% guardian payroll, 30% ecosystem fund, 10% parametric insurance pool. Parametric insurance fires mid-storm — payout in seconds, no claims adjuster.",
    tags:        ["DAO Treasury", "DePIN", "Parametric Insurance", "ReFi"],
    metric:      "60 / 30 / 10",
    metricSub:   "Guardian / Ecosystem / Insurance",
    color:       "#52B788",
  },
];

export const WHAT_WE_DO_SECTIONS = [
  {
    title:       "Measure",
    subtitle:    "Ground Truth From the Mud",
    description: "Traditional carbon MRV relies on ecologists visiting mangrove sites once a year with clipboards. Our ESP32 sensor nodes — hardened with HSM secure enclaves — sit in the coastal sediment and measure the ecosystem every single hour. Salinity, pH, soil moisture, dissolved oxygen. Each reading is cryptographically signed before it leaves the device. If someone physically cracks the casing, the node self-destructs its private key and the tamper is immediately visible in the data stream.",
    tags:        ["pH Monitoring", "Salinity Sensors", "Dissolved O₂", "Soil Moisture", "ECDSA Signing"],
    stat:        "8,760",
    statLabel:   "Verified readings per year vs 504 from manual surveys",
  },
  {
    title:       "Report",
    subtitle:    "Fraud-Proof Before It Reaches the Chain",
    description: "Raw sensor data enters our FastAPI ingestion pipeline where it faces five sequential checks before a single byte touches the blockchain. Signature verification, physical bounds rejection, realistic bounds flagging, Z-score analysis against a 30-day rolling baseline, and Isolation Forest anomaly scoring. A node reporting a 300% overnight spike in carbon sequestration gets quarantined instantly. No human can approve or override — the ML model is the last word, and every decision is logged with a timestamp.",
    tags:        ["Isolation Forest", "Z-score 2.5σ", "Signature Verification", "Physical Bounds", "Neighbour Spoofing Detection"],
    stat:        "~14%",
    statLabel:   "Anomaly detection rate across all injected fraud attempts",
  },
  {
    title:       "Verify",
    subtitle:    "Mathematical Proof, Not Human Trust",
    description: "Clean readings are batched every 6 hours, assembled into a SHA-256 Merkle tree, and only the 32-byte root is stored on-chain. The raw sensor logs go to Arweave — permanent, content-addressable, tamper-evident. Any institutional auditor anywhere in the world can run a single script: fetch the Merkle root from the smart contract, fetch the raw batch from Arweave, re-hash it, compare. If a single decimal point was altered after the fact, the verification fails. Carbon sequestration stops being self-reported. It becomes mathematically provable.",
    tags:        ["Merkle Tree", "SHA-256", "Arweave", "On-Chain Anchoring", "Deterministic Audit"],
    stat:        "32 bytes",
    statLabel:   "On-chain storage per batch of hundreds of readings",
  },
];

export const FAQ_ITEMS = [
  {
    question: "Why ERC-1155 instead of ERC-20 for carbon credits?",
    answer:   "Carbon is not immediately fungible. A tonne sequestered in Bhitarkanika in 2026 has a different risk profile and market value than one from a pine forest in Canada in 2020. ERC-1155 lets us mint each batch as a unique token carrying GPS coordinates, vintage year, and sensor hash — then fractionalize it into 1-tonne tradeable units. ERC-20 would collapse all that provenance information.",
  },
  {
    question: "What stops someone from submitting fake sensor readings?",
    answer:   "Three independent layers. First, every reading must carry a valid ECDSA signature from the device's HSM-burned private key — invalid signatures are dropped before touching the database. Second, the ML pipeline runs five sequential fraud checks including Isolation Forest scoring and Z-score analysis. Third, satellite NDVI cross-referencing catches any readings that are technically valid but inconsistent with what the European Space Agency's Sentinel-2 imagery shows for that GPS coordinate.",
  },
  {
    question: "How does a corporate buyer verify their retired credit is real?",
    answer:   "They run our open-source audit script. It fetches the Merkle root from the smart contract (immutable, on-chain), fetches the raw sensor batch from Arweave (permanent, content-addressable), re-hashes it locally, and compares. If the roots match, mathematical integrity is confirmed. The CarbonRetired event on-chain carries the buyer's wallet address, the ESG retirement reason, and a permanent timestamp — this is what their auditors read for CSRD and SEC climate disclosure compliance.",
  },
  {
    question: "Why Arweave instead of IPFS or AWS S3?",
    answer:   "Arweave guarantees permanent storage with a single upfront fee — the data exists as long as the network does, with no recurring subscription that could lapse. IPFS data can disappear if nobody pins it. AWS S3 is centralized and could be modified or deleted by whoever controls the account. For a carbon registry where the data must be retrievable by auditors in 2040, Arweave is the only honest answer.",
  },
  {
    question: "What is the DePIN guardian payroll system?",
    answer:   "Local coastal community members register their wallets via our mobile app using Account Abstraction (ERC-4337) — they never touch a private key or pay gas fees. They patrol the mangrove patches, log GPS check-ins, and upload geo-tagged photos. Three peer guardians must confirm each patrol report before the smart contract releases 25 USDC directly to the guardian's wallet. No manager, no payroll department, no local government intermediary.",
  },
  {
    question: "How does the parametric insurance work?",
    answer:   "The forest DAO treasury pays a monthly premium in USDC to a decentralized liquidity pool. Our oracle monitors wind speed, storm surge, and rainfall at the exact GPS coordinates continuously. If sustained winds exceed 130 mph, the insurance contract fires instantly — no claims adjuster, no site visit, no negotiation. The payout routes 50% to guardian wallets so they can buy emergency supplies immediately, and 50% to a replanting treasury for ecosystem restoration.",
  },
];