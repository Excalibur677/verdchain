const { ethers } = require("ethers");
const axios      = require("axios");
require("dotenv").config();

// ── Configuration ──────────────────────────────────────────────
const BACKEND_URL        = "http://127.0.0.1:8000";
const HARDHAT_RPC        = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS   = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DEPLOYER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const MINT_THRESHOLD_TONNES = 0.000001;
const POLL_INTERVAL_MS   = 30000;
const GPS_LAT            = "20.3974";
const GPS_LON            = "86.7443";
const VINTAGE            = "2026";

// ── VerdChain ABI — only the functions we need ─────────────────
const VERDCHAIN_ABI = [
  "function mint(address to, string memory gpsLat, string memory gpsLon, uint256 tonnes, string memory arweaveHash, string memory vintage) external",
  "function storeMerkleRoot(uint256 batchId, bytes32 merkleRoot) external",
  "function retire(uint256 batchId, string memory retirementReason) external",
  "function getAllBatchIds() external view returns (uint256[])",
  "function getBatch(uint256 batchId) external view returns (tuple(uint256 batchId, string gpsLat, string gpsLon, uint256 tonnes, uint256 timestamp, string arweaveHash, string vintage, bool retired, address retiredBy, string retirementReason))",
  "function nextBatchId() external view returns (uint256)",
  "event CarbonMinted(uint256 indexed batchId, string gpsLat, string gpsLon, uint256 tonnes, string arweaveHash, string vintage, uint256 timestamp)",
  "event CarbonRetired(uint256 indexed batchId, address indexed retiredBy, uint256 tonnes, string retirementReason, uint256 timestamp)",
  "event MerkleRootStored(uint256 indexed batchId, bytes32 merkleRoot, uint256 timestamp)",
];

// ── State ───────────────────────────────────────────────────────
let provider;
let signer;
let contract;
let isRunning      = false;
let totalMinted    = 0;
let totalTonnes    = 0;
let cycleCount     = 0;
let lastMintedAt   = null;

// ── Logger ──────────────────────────────────────────────────────
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix    = {
    INFO:    "\x1b[32m[INFO]\x1b[0m",
    WARN:    "\x1b[33m[WARN]\x1b[0m",
    ERROR:   "\x1b[31m[ERROR]\x1b[0m",
    MINT:    "\x1b[36m[MINT]\x1b[0m",
    ORACLE:  "\x1b[35m[ORACLE]\x1b[0m",
    MERKLE:  "\x1b[34m[MERKLE]\x1b[0m",
  }[level] || "[LOG]";

  console.log(`${prefix} ${timestamp} — ${message}`);
  if (data) console.log("         ", JSON.stringify(data, null, 2));
}

// ── Connect to blockchain ───────────────────────────────────────
async function connect() {
  try {
    provider = new ethers.JsonRpcProvider(HARDHAT_RPC);
    signer   = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, VERDCHAIN_ABI, signer);

    const network    = await provider.getNetwork();
    const balance    = await provider.getBalance(signer.address);
    const nextBatch  = await contract.nextBatchId();

    log("INFO", `Connected to blockchain`, {
      network:       network.chainId.toString(),
      oracle:        signer.address,
      balance:       ethers.formatEther(balance) + " ETH",
      contract:      CONTRACT_ADDRESS,
      nextBatchId:   nextBatch.toString(),
    });

    return true;
  } catch (err) {
    log("ERROR", `Blockchain connection failed: ${err.message}`);
    return false;
  }
}

// ── Fetch pending batches from backend ─────────────────────────
async function fetchPendingBatches() {
  try {
    const response = await axios.get(`${BACKEND_URL}/batches/pending`, { timeout: 10000 });
    return response.data.pending_batches || [];
  } catch (err) {
    log("WARN", `Failed to fetch pending batches: ${err.message}`);
    return [];
  }
}

// ── Check backend health ────────────────────────────────────────
async function checkBackendHealth() {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    return response.data.status === "healthy";
  } catch {
    return false;
  }
}

// ── Convert hex merkle root to bytes32 ─────────────────────────
function toBytes32(hexString) {
  if (!hexString) return ethers.ZeroHash;
  const clean = hexString.startsWith("0x") ? hexString : `0x${hexString}`;
  return ethers.zeroPadValue(clean, 32);
}

// ── Convert tonnes float to uint256 (scaled by 1e6) ────────────
function tonnesToUint(tonnes) {
  return BigInt(Math.round(tonnes * 1_000_000));
}

// ── Mint a carbon credit batch ─────────────────────────────────
async function mintBatch(batch) {
  const { id, tonnes, merkle_root } = batch;

  if (tonnes < MINT_THRESHOLD_TONNES) {
    log("WARN", `Batch #${id} below threshold`, {
      tonnes,
      threshold: MINT_THRESHOLD_TONNES,
    });
    return false;
  }

  log("ORACLE", `Processing batch #${id}`, {
    tonnes,
    merkleRoot: merkle_root?.slice(0, 20) + "...",
    gps:        `${GPS_LAT}, ${GPS_LON}`,
  });

  try {
    // Step 1 — Simulate Chainlink oracle consensus
    log("ORACLE", `Simulating oracle consensus for batch #${id}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    log("ORACLE", `Supermajority consensus reached — proceeding to mint`);

    // Step 2 — Call mint() on smart contract
    const tonnageUint    = tonnesToUint(tonnes);
    const arweaveHashSim = `ar://${merkle_root?.slice(0, 16)}...${id}`;

    log("MINT", `Calling mint() on contract for batch #${id}...`);

    const mintTx = await contract.mint(
      signer.address,
      GPS_LAT,
      GPS_LON,
      tonnageUint,
      arweaveHashSim,
      VINTAGE,
      { gasLimit: 500000 }
    );

    log("MINT", `Mint transaction submitted`, { txHash: mintTx.hash });

    const mintReceipt = await mintTx.wait();
    log("MINT", `Mint confirmed in block #${mintReceipt.blockNumber}`, {
      txHash:    mintTx.hash,
      gasUsed:   mintReceipt.gasUsed.toString(),
      batchId:   id,
      tonnes,
    });

    // Step 3 — Store Merkle root on-chain
    if (merkle_root) {
      try {
        const bytes32Root     = toBytes32(merkle_root);
        const nextId          = await contract.nextBatchId();
        const contractBatchId = Number(nextId) - 1;
        const currentNonce    = await provider.getTransactionCount(signer.address, "latest");

        log("MERKLE", `Storing Merkle root for contract batch #${contractBatchId}...`);

        const merkleTx = await contract.storeMerkleRoot(
        contractBatchId,
        bytes32Root,
        { gasLimit: 200000, nonce: currentNonce }
        );

        const merkleReceipt = await merkleTx.wait();
        log("MERKLE", `Merkle root anchored on-chain`, {
          txHash:      merkleTx.hash,
          blockNumber: merkleReceipt.blockNumber,
          root:        merkle_root.slice(0, 20) + "...",
        });

      } catch (merkleErr) {
        log("WARN", `Merkle root storage failed (non-critical): ${merkleErr.message}`);
      }
    }

    // Step 4 — Notify backend
    try {
      const nextId          = await contract.nextBatchId();
      const contractBatchId = Number(nextId) - 1;

      await axios.post(
        `${BACKEND_URL}/batches/${id}/mark-minted?contract_batch_id=${contractBatchId}`,
        {},
        { timeout: 10000 }
      );

      log("INFO", `Backend notified — batch #${id} marked as minted`);
    } catch (backendErr) {
      log("WARN", `Backend notification failed: ${backendErr.message}`);
    }

    totalMinted++;
    totalTonnes  += tonnes;
    lastMintedAt  = new Date().toISOString();

    log("MINT", `SUCCESS — batch #${id} minted`, {
      contractTx:   mintTx.hash,
      totalMinted,
      totalTonnes:  totalTonnes.toFixed(6),
    });

    return true;

  } catch (err) {
    log("ERROR", `Mint failed for batch #${id}: ${err.message}`);
    return false;
  }
}

// ── Listen to contract events ───────────────────────────────────
function setupEventListeners() {
  contract.on("CarbonMinted", (batchId, gpsLat, gpsLon, tonnes, arweaveHash, vintage, timestamp) => {
    log("MINT", `CarbonMinted event received`, {
      batchId:    batchId.toString(),
      gpsLat,
      gpsLon,
      tonnes:     tonnes.toString(),
      vintage,
      timestamp:  new Date(Number(timestamp) * 1000).toISOString(),
    });
  });

  contract.on("CarbonRetired", (batchId, retiredBy, tonnes, reason, timestamp) => {
    log("INFO", `CarbonRetired event received`, {
      batchId:   batchId.toString(),
      retiredBy,
      tonnes:    tonnes.toString(),
      reason,
      timestamp: new Date(Number(timestamp) * 1000).toISOString(),
    });
  });

  contract.on("MerkleRootStored", (batchId, merkleRoot, timestamp) => {
    log("MERKLE", `MerkleRootStored event received`, {
      batchId:   batchId.toString(),
      merkleRoot,
      timestamp: new Date(Number(timestamp) * 1000).toISOString(),
    });
  });

  log("INFO", "Event listeners registered for CarbonMinted, CarbonRetired, MerkleRootStored");
}

// ── Print stats banner ──────────────────────────────────────────
function printStats() {
  console.log("\n" + "=".repeat(65));
  console.log("  VERDCHAIN ORACLE RELAY — SESSION STATS");
  console.log("=".repeat(65));
  console.log(`  Cycles completed:  ${cycleCount}`);
  console.log(`  Batches minted:    ${totalMinted}`);
  console.log(`  Tonnes verified:   ${totalTonnes.toFixed(6)} tCO₂e`);
  console.log(`  Last mint:         ${lastMintedAt || "none yet"}`);
  console.log(`  Oracle address:    ${signer?.address || "not connected"}`);
  console.log(`  Contract:          ${CONTRACT_ADDRESS}`);
  console.log("=".repeat(65) + "\n");
}

// ── Main polling loop ───────────────────────────────────────────
async function runCycle() {
  if (isRunning) {
    log("WARN", "Previous cycle still running — skipping");
    return;
  }

  isRunning  = true;
  cycleCount++;

  log("ORACLE", `Starting oracle cycle #${cycleCount}`);

  try {
    // Check backend health
    const backendHealthy = await checkBackendHealth();
    if (!backendHealthy) {
      log("WARN", "Backend unhealthy — skipping cycle");
      return;
    }

    // Fetch pending batches
    const pendingBatches = await fetchPendingBatches();

    if (pendingBatches.length === 0) {
      log("INFO", `Cycle #${cycleCount} — no pending batches`);
      return;
    }

    log("INFO", `Found ${pendingBatches.length} pending batch(es)`);

    // Process each batch
    let mintedThisCycle = 0;
    for (const batch of pendingBatches) {
      const success = await mintBatch(batch);
      if (success) mintedThisCycle++;
      // Small delay between mints to avoid nonce conflicts
      if (pendingBatches.indexOf(batch) < pendingBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    log("ORACLE", `Cycle #${cycleCount} complete — minted ${mintedThisCycle}/${pendingBatches.length} batches`);

    if (cycleCount % 10 === 0) printStats();

  } catch (err) {
    log("ERROR", `Cycle #${cycleCount} failed: ${err.message}`);
  } finally {
    isRunning = false;
  }
}

// ── Startup banner ──────────────────────────────────────────────
function printBanner() {
  console.log("\n" + "=".repeat(65));
  console.log("  VERDCHAIN — Decentralized Oracle Relay");
  console.log("  Bhitarkanika Mangrove Reserve, Odisha, India");
  console.log("=".repeat(65));
  console.log(`  Backend:    ${BACKEND_URL}`);
  console.log(`  Blockchain: ${HARDHAT_RPC}`);
  console.log(`  Contract:   ${CONTRACT_ADDRESS}`);
  console.log(`  Poll:       every ${POLL_INTERVAL_MS / 1000}s`);
  console.log(`  Threshold:  ${MINT_THRESHOLD_TONNES} tCO₂e`);
  console.log("  Note:       In production, replaced by Chainlink DON");
  console.log("=".repeat(65) + "\n");
}

// ── Graceful shutdown ───────────────────────────────────────────
process.on("SIGINT", () => {
  log("INFO", "Shutting down oracle relay...");
  printStats();
  if (contract) {
    contract.removeAllListeners();
  }
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  log("ERROR", `Unhandled rejection: ${reason}`);
});

// ── Entry point ─────────────────────────────────────────────────
async function main() {
  printBanner();

  const connected = await connect();
  if (!connected) {
    log("ERROR", "Cannot connect — make sure Hardhat node is running on port 8545");
    process.exit(1);
  }

  setupEventListeners();

  // Run first cycle immediately
  await runCycle();

  // Then poll on interval
  setInterval(runCycle, POLL_INTERVAL_MS);

  log("INFO", `Oracle relay running — polling every ${POLL_INTERVAL_MS / 1000}s`);
}

main();