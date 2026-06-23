from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import hashlib
import json
import time
import random
import math
from datetime import datetime, timezone

from database import (
    init_db, insert_reading, get_recent_readings,
    get_readings_for_batch, insert_batch, get_batches,
    mark_batch_minted, insert_patrol, confirm_patrol,
    get_patrols, insert_insurance_event, get_insurance_events
)
from ml_model import (
    run_full_fraud_check, calculate_carbon_tonnes,
    compute_merkle_root, compute_batch_hash
)

app = FastAPI(
    title="VerdChain MRV Backend",
    description="Blue Carbon Measurement, Reporting and Verification API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
GUARDIAN_POOL    = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
ECOSYSTEM_FUND   = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
INSURANCE_POOL   = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
DEPLOYER         = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

MINT_THRESHOLD_TONNES = 0.000010
INSURANCE_WIND_THRESHOLD_MPH = 130.0
INSURANCE_POOL_BALANCE = 50000.0
GUARDIAN_PAYOUT_USDC = 25.0

pipeline_stats = {
    "total_readings": 0,
    "valid_readings": 0,
    "anomalies_detected": 0,
    "batches_created": 0,
    "tonnes_verified": 0.0,
    "guardian_payouts": 0,
    "insurance_triggers": 0,
}

class SensorReading(BaseModel):
    device_id: str = Field(..., description="Unique sensor node identifier")
    timestamp: int = Field(..., description="Unix timestamp of reading")
    gps_lat: str = Field(..., description="GPS latitude of sensor")
    gps_lon: str = Field(..., description="GPS longitude of sensor")
    ph: float = Field(..., ge=0.0, le=14.0, description="pH level of water")
    salinity: float = Field(..., ge=0.0, le=60.0, description="Salinity in ppt")
    moisture: float = Field(..., ge=0.0, le=100.0, description="Soil moisture percentage")
    dissolved_o2: float = Field(..., ge=0.0, le=20.0, description="Dissolved oxygen mg/L")
    signature: str = Field(..., description="ECDSA signature of payload")

class PatrolSubmission(BaseModel):
    guardian_address: str = Field(..., description="Wallet address of guardian")
    gps_lat: str = Field(..., description="GPS latitude of patrol location")
    gps_lon: str = Field(..., description="GPS longitude of patrol location")
    photo_hash: Optional[str] = Field(None, description="SHA256 hash of patrol photo")

class PatrolConfirmation(BaseModel):
    patrol_id: int = Field(..., description="ID of patrol to confirm")
    confirmer_address: str = Field(..., description="Wallet address of confirming guardian")

class WindReading(BaseModel):
    wind_speed_mph: float = Field(..., description="Wind speed in MPH from weather oracle")
    location: str = Field(..., description="GPS coordinates of measurement")
    source: str = Field(..., description="Data source - NOAA/local station/sensor")

class AuditVerifyRequest(BaseModel):
    merkle_root: str = Field(..., description="Merkle root to verify")
    reading_ids: List[int] = Field(..., description="List of reading IDs in batch")

@app.get("/")
def root():
    return {
        "project": "VerdChain",
        "description": "Blockchain-Based Blue Carbon MRV Registry",
        "version": "1.0.0",
        "contract": CONTRACT_ADDRESS,
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "backend": "online",
        "database": "connected",
        "ml_models": "loaded",
        "blockchain": "hardhat-local",
        "contract_address": CONTRACT_ADDRESS,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/ingest")
async def ingest_reading(reading: SensorReading, background_tasks: BackgroundTasks):
    pipeline_stats["total_readings"] += 1

    reading_dict = {
        "device_id":   reading.device_id,
        "timestamp":   reading.timestamp,
        "gps_lat":     reading.gps_lat,
        "gps_lon":     reading.gps_lon,
        "ph":          reading.ph,
        "salinity":    reading.salinity,
        "moisture":    reading.moisture,
        "dissolved_o2": reading.dissolved_o2,
        "signature":   reading.signature,
    }

    fraud_result = run_full_fraud_check(reading_dict)

    db_entry = {
        **reading_dict,
        "is_valid":       1 if fraud_result["is_valid"] else 0,
        "is_anomaly":     1 if fraud_result["is_anomaly"] else 0,
        "anomaly_reason": fraud_result.get("anomaly_reason"),
    }

    reading_id = insert_reading(db_entry)

    if fraud_result["is_valid"] and not fraud_result["is_anomaly"]:
        pipeline_stats["valid_readings"] += 1
    else:
        pipeline_stats["anomalies_detected"] += 1

    background_tasks.add_task(check_and_create_batch)

    return {
        "reading_id":   reading_id,
        "status":       "accepted" if (fraud_result["is_valid"] and not fraud_result["is_anomaly"]) else "flagged",
        "fraud_result": fraud_result,
        "pipeline_stats": pipeline_stats,
        "timestamp":    datetime.now(timezone.utc).isoformat()
    }

async def check_and_create_batch():
    readings = get_readings_for_batch(limit=6)
    if len(readings) < 6:
        return

    tonnes = calculate_carbon_tonnes(readings)
    if tonnes < MINT_THRESHOLD_TONNES:
        return

    merkle_root = compute_merkle_root(readings)
    batch_hash  = compute_batch_hash(readings)
    reading_ids = [r["id"] for r in readings]

    batch_id = insert_batch(batch_hash, merkle_root, reading_ids, tonnes)
    pipeline_stats["batches_created"] += 1
    pipeline_stats["tonnes_verified"] += tonnes

@app.get("/readings")
def get_readings(limit: int = 50):
    readings = get_recent_readings(limit=limit)
    total    = len(readings)
    valid    = sum(1 for r in readings if r["is_valid"] and not r["is_anomaly"])
    anomalies = sum(1 for r in readings if r["is_anomaly"])

    return {
        "readings":  readings,
        "total":     total,
        "valid":     valid,
        "anomalies": anomalies,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/readings/latest-verified")
def get_latest_verified():
    readings = get_recent_readings(limit=100)
    verified = [r for r in readings if r["is_valid"] and not r["is_anomaly"]]
    return {
        "verified_readings": verified[:10],
        "count":             len(verified),
        "timestamp":         datetime.now(timezone.utc).isoformat()
    }

@app.get("/batches")
def get_all_batches():
    batches = get_batches()
    return {
        "batches":   batches,
        "total":     len(batches),
        "minted":    sum(1 for b in batches if b["minted"]),
        "pending":   sum(1 for b in batches if not b["minted"]),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/batches/pending")
def get_pending_batches():
    batches  = get_batches()
    pending  = [b for b in batches if not b["minted"]]
    return {
        "pending_batches": pending,
        "count":           len(pending),
        "mint_threshold":  MINT_THRESHOLD_TONNES,
        "timestamp":       datetime.now(timezone.utc).isoformat()
    }

@app.post("/batches/{batch_id}/mark-minted")
def mark_minted(batch_id: int, contract_batch_id: int):
    mark_batch_minted(batch_id, contract_batch_id)
    return {
        "status":            "success",
        "batch_id":          batch_id,
        "contract_batch_id": contract_batch_id,
        "timestamp":         datetime.now(timezone.utc).isoformat()
    }

@app.post("/guardian/patrol")
def submit_patrol(patrol: PatrolSubmission):
    photo_hash = patrol.photo_hash or hashlib.sha256(
        f"{patrol.guardian_address}{patrol.gps_lat}{patrol.gps_lon}{time.time()}".encode()
    ).hexdigest()

    patrol_id = insert_patrol(
        patrol.guardian_address,
        patrol.gps_lat,
        patrol.gps_lon,
        photo_hash
    )

    return {
        "patrol_id":          patrol_id,
        "status":             "submitted",
        "confirmations_needed": 3,
        "confirmations_received": 0,
        "payout_on_completion": f"{GUARDIAN_PAYOUT_USDC} USDC",
        "guardian_pool":      GUARDIAN_POOL,
        "timestamp":          datetime.now(timezone.utc).isoformat()
    }

@app.post("/guardian/confirm")
def confirm_patrol_endpoint(confirmation: PatrolConfirmation):
    confirm_patrol(confirmation.patrol_id)
    patrols = get_patrols()
    patrol  = next((p for p in patrols if p["id"] == confirmation.patrol_id), None)

    if not patrol:
        raise HTTPException(status_code=404, detail="Patrol not found")

    confirmations = patrol["confirmations"]
    paid = False
    payout_tx = None

    if confirmations >= 3 and not patrol["paid"]:
        paid = True
        pipeline_stats["guardian_payouts"] += 1
        payout_tx = hashlib.sha256(
            f"payout_{confirmation.patrol_id}_{time.time()}".encode()
        ).hexdigest()

    return {
        "patrol_id":      confirmation.patrol_id,
        "confirmations":  confirmations,
        "threshold":      3,
        "payout_triggered": paid,
        "payout_amount":  f"{GUARDIAN_PAYOUT_USDC} USDC" if paid else None,
        "payout_tx_hash": payout_tx,
        "guardian_pool":  GUARDIAN_POOL,
        "timestamp":      datetime.now(timezone.utc).isoformat()
    }

@app.get("/guardian/patrols")
def get_all_patrols():
    patrols = get_patrols()
    return {
        "patrols":   patrols,
        "total":     len(patrols),
        "confirmed": sum(1 for p in patrols if p["confirmations"] >= 3),
        "pending":   sum(1 for p in patrols if p["confirmations"] < 3),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/insurance/wind-reading")
def process_wind_reading(wind: WindReading):
    triggered     = wind.wind_speed_mph >= INSURANCE_WIND_THRESHOLD_MPH
    payout_amount = 0.0
    payout_details = None

    if triggered:
        pipeline_stats["insurance_triggers"] += 1
        payout_amount = INSURANCE_POOL_BALANCE * 0.8

        guardian_share   = payout_amount * 0.5
        replanting_share = payout_amount * 0.5

        payout_details = {
            "total_payout":       payout_amount,
            "guardian_share":     guardian_share,
            "replanting_share":   replanting_share,
            "guardian_pool":      GUARDIAN_POOL,
            "payout_tx_hash":     hashlib.sha256(f"insurance_{time.time()}".encode()).hexdigest(),
            "trigger_condition":  f"Wind speed {wind.wind_speed_mph:.1f} mph >= threshold {INSURANCE_WIND_THRESHOLD_MPH} mph",
            "payout_time_seconds": 8,
        }

    insert_insurance_event(
        wind.wind_speed_mph,
        INSURANCE_WIND_THRESHOLD_MPH,
        1 if triggered else 0,
        payout_amount
    )

    return {
        "wind_speed_mph":  wind.wind_speed_mph,
        "threshold_mph":   INSURANCE_WIND_THRESHOLD_MPH,
        "source":          wind.source,
        "location":        wind.location,
        "triggered":       triggered,
        "payout_details":  payout_details,
        "pool_balance":    INSURANCE_POOL_BALANCE,
        "timestamp":       datetime.now(timezone.utc).isoformat()
    }

@app.get("/insurance/events")
def get_all_insurance_events():
    events = get_insurance_events()
    return {
        "events":    events,
        "total":     len(events),
        "triggered": sum(1 for e in events if e["triggered"]),
        "pool_balance": INSURANCE_POOL_BALANCE,
        "threshold_mph": INSURANCE_WIND_THRESHOLD_MPH,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/treasury")
def get_treasury():
    batches      = get_batches()
    minted       = [b for b in batches if b["minted"]]
    total_tonnes = sum(b["tonnes"] for b in minted)
    total_revenue_usdc = total_tonnes * 35000

    guardian_share   = total_revenue_usdc * 0.60
    ecosystem_share  = total_revenue_usdc * 0.30
    insurance_share  = total_revenue_usdc * 0.10

    return {
        "total_tonnes_minted":     total_tonnes,
        "total_revenue_usdc":      round(total_revenue_usdc, 2),
        "splits": {
            "guardian_payroll":    {"percentage": 60, "amount_usdc": round(guardian_share, 2),  "address": GUARDIAN_POOL},
            "ecosystem_fund":      {"percentage": 30, "amount_usdc": round(ecosystem_share, 2), "address": ECOSYSTEM_FUND},
            "insurance_pool":      {"percentage": 10, "amount_usdc": round(insurance_share, 2), "address": INSURANCE_POOL},
        },
        "contract_address":        CONTRACT_ADDRESS,
        "timestamp":               datetime.now(timezone.utc).isoformat()
    }

@app.post("/audit/verify")
def verify_audit(request: AuditVerifyRequest):
    readings = get_recent_readings(limit=1000)
    matching = [r for r in readings if r["id"] in request.reading_ids]

    if not matching:
        raise HTTPException(status_code=404, detail="No readings found for given IDs")

    computed_root = compute_merkle_root(matching)
    match         = computed_root == request.merkle_root

    return {
        "provided_merkle_root": request.merkle_root,
        "computed_merkle_root": computed_root,
        "integrity_verified":   match,
        "readings_checked":     len(matching),
        "result":               "PASS — Data integrity confirmed" if match else "FAIL — Merkle root mismatch, data may have been tampered",
        "timestamp":            datetime.now(timezone.utc).isoformat()
    }

@app.get("/pipeline/stats")
def get_pipeline_stats():
    return {
        "stats":     pipeline_stats,
        "contract":  CONTRACT_ADDRESS,
        "network":   "Hardhat Local",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/simulate/reading/{device_id}")
def simulate_reading(device_id: str, anomaly: bool = False):
    import math
    t = time.time()

    if anomaly:
        ph           = round(random.uniform(11.0, 13.5), 2)
        salinity     = round(random.uniform(55.0, 60.0), 2)
        moisture     = round(random.uniform(5.0, 15.0), 2)
        dissolved_o2 = round(random.uniform(0.5, 2.0), 2)
    else:
        ph           = round(7.4 + 0.3 * math.sin(t / 3600) + random.gauss(0, 0.05), 2)
        salinity     = round(32.0 + 2.5 * math.cos(t / 7200) + random.gauss(0, 0.3), 2)
        moisture     = round(68.0 + 8.0 * math.sin(t / 1800) + random.gauss(0, 1.0), 2)
        dissolved_o2 = round(7.2 + 0.8 * math.sin(t / 5400) + random.gauss(0, 0.1), 2)

    payload_str = (
        str(device_id) +
        str(ph) + str(salinity) +
        str(moisture) + str(dissolved_o2) +
        str(int(t))
    )
    hash_val = 0
    for char in payload_str:
        hash_val = hash_val * 31 + ord(char)
    hash_val &= 0xFFFFFFFFFFFFFFFF
    signature = format(hash_val, 'x') + format(int(t) & 0xFFFFFF, 'x')

    return {
        "device_id":   device_id,
        "timestamp":   int(t),
        "gps_lat":     "20.3974",
        "gps_lon":     "86.7443",
        "ph":          ph,
        "salinity":    salinity,
        "moisture":    moisture,
        "dissolved_o2": dissolved_o2,
        "signature":   signature,
        "is_anomaly_injection": anomaly
    }

@app.get("/simulate/wind")
def simulate_wind(extreme: bool = False):
    if extreme:
        wind_speed = round(random.uniform(130.0, 165.0), 1)
    else:
        wind_speed = round(random.uniform(15.0, 85.0), 1)

    return {
        "wind_speed_mph": wind_speed,
        "location":       "20.3974,86.7443",
        "source":         "NOAA-simulated",
        "would_trigger":  wind_speed >= INSURANCE_WIND_THRESHOLD_MPH
    }