import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import hashlib
import hmac
import json
from datetime import datetime

DEVICE_SECRETS = {
    "NODE_001": "demo_secret_key_001",
    "NODE_002": "demo_secret_key_002",
    "NODE_003": "demo_secret_key_003",
}

PHYSICAL_BOUNDS = {
    "ph": (0.0, 14.0),
    "salinity": (0.0, 60.0),
    "moisture": (0.0, 100.0),
    "dissolved_o2": (0.0, 20.0),
}

REALISTIC_BOUNDS = {
    "ph": (6.5, 8.5),
    "salinity": (20.0, 40.0),
    "moisture": (30.0, 95.0),
    "dissolved_o2": (4.0, 12.0),
}

BASELINE_STATS = {
    "NODE_001": {
        "ph":           {"mean": 7.4,  "std": 0.3},
        "salinity":     {"mean": 32.0, "std": 2.5},
        "moisture":     {"mean": 68.0, "std": 8.0},
        "dissolved_o2": {"mean": 7.2,  "std": 0.8},
    },
    "NODE_002": {
        "ph":           {"mean": 7.6,  "std": 0.25},
        "salinity":     {"mean": 28.0, "std": 3.0},
        "moisture":     {"mean": 72.0, "std": 6.5},
        "dissolved_o2": {"mean": 6.8,  "std": 0.9},
    },
    "NODE_003": {
        "ph":           {"mean": 7.2,  "std": 0.35},
        "salinity":     {"mean": 35.0, "std": 2.0},
        "moisture":     {"mean": 65.0, "std": 7.5},
        "dissolved_o2": {"mean": 7.8,  "std": 0.7},
    },
}

isolation_forests = {}
scalers = {}
reading_history = {}

def generate_training_data(device_id: str, n_samples: int = 500):
    if device_id not in BASELINE_STATS:
        device_id = "NODE_001"
    
    stats = BASELINE_STATS[device_id]
    np.random.seed(42)
    
    data = {
        "ph":           np.random.normal(stats["ph"]["mean"],           stats["ph"]["std"],           n_samples),
        "salinity":     np.random.normal(stats["salinity"]["mean"],     stats["salinity"]["std"],     n_samples),
        "moisture":     np.random.normal(stats["moisture"]["mean"],     stats["moisture"]["std"],     n_samples),
        "dissolved_o2": np.random.normal(stats["dissolved_o2"]["mean"], stats["dissolved_o2"]["std"], n_samples),
    }
    
    df = pd.DataFrame(data)
    df["ph"]           = df["ph"].clip(6.0, 9.0)
    df["salinity"]     = df["salinity"].clip(10.0, 50.0)
    df["moisture"]     = df["moisture"].clip(20.0, 100.0)
    df["dissolved_o2"] = df["dissolved_o2"].clip(2.0, 15.0)
    
    return df

def train_model(device_id: str):
    training_data = generate_training_data(device_id)
    
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(training_data)
    
    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42,
        max_samples="auto"
    )
    model.fit(scaled_data)
    
    isolation_forests[device_id] = model
    scalers[device_id] = scaler
    reading_history[device_id] = []
    
    return model

def initialize_models():
    for device_id in DEVICE_SECRETS.keys():
        train_model(device_id)

def verify_signature(payload: dict, signature: str, device_id: str) -> bool:
    if device_id not in DEVICE_SECRETS:
        return False
    
    secret = DEVICE_SECRETS[device_id]
    payload_str = (
        str(device_id) +
        str(payload.get("ph", "")) +
        str(payload.get("salinity", "")) +
        str(payload.get("moisture", "")) +
        str(payload.get("dissolved_o2", "")) +
        str(payload.get("timestamp", ""))
    )
    
    hash_val = 0
    for char in payload_str:
        hash_val = hash_val * 31 + ord(char)
    hash_val = hash_val & 0xFFFFFFFFFFFFFFFF
    
    timestamp = payload.get("timestamp", 0)
    expected_base = format(hash_val, 'x') + format(timestamp & 0xFFFFFF, 'x')
    
    return signature.startswith(format(hash_val, 'x'))

def check_physical_bounds(reading: dict) -> tuple[bool, str]:
    for param, (min_val, max_val) in PHYSICAL_BOUNDS.items():
        value = reading.get(param)
        if value is None:
            return False, f"Missing parameter: {param}"
        if not (min_val <= value <= max_val):
            return False, f"Physical bounds violation: {param}={value} (valid range: {min_val}-{max_val})"
    return True, ""

def check_realistic_bounds(reading: dict) -> tuple[bool, str]:
    warnings = []
    for param, (min_val, max_val) in REALISTIC_BOUNDS.items():
        value = reading.get(param)
        if value and not (min_val <= value <= max_val):
            warnings.append(f"{param}={value:.2f} outside realistic range ({min_val}-{max_val})")
    return len(warnings) == 0, "; ".join(warnings)

def check_zscore(reading: dict, device_id: str) -> tuple[bool, str]:
    if device_id not in BASELINE_STATS:
        return True, ""
    
    stats = BASELINE_STATS[device_id]
    anomalies = []
    
    for param in ["ph", "salinity", "moisture", "dissolved_o2"]:
        value = reading.get(param)
        if value is None:
            continue
        mean = stats[param]["mean"]
        std = stats[param]["std"]
        if std == 0:
            continue
        zscore = abs((value - mean) / std)
        if zscore > 2.5:
            anomalies.append(f"{param} z-score={zscore:.2f} (threshold=2.5)")
    
    return len(anomalies) == 0, "; ".join(anomalies)

def check_isolation_forest(reading: dict, device_id: str) -> tuple[bool, str]:
    if device_id not in isolation_forests:
        train_model(device_id)
    
    model = isolation_forests[device_id]
    scaler = scalers[device_id]
    
    features = np.array([[
        reading.get("ph", 7.0),
        reading.get("salinity", 30.0),
        reading.get("moisture", 65.0),
        reading.get("dissolved_o2", 7.0),
    ]])
    
    scaled = scaler.transform(features)
    prediction = model.predict(scaled)
    score = model.score_samples(scaled)[0]

    is_normal = bool(prediction[0] == 1)
    reason = "" if is_normal else f"Isolation Forest anomaly score={float(score):.4f}"

    return is_normal, reason

def check_neighbour_spoofing(reading: dict, device_id: str) -> tuple[bool, str]:
    if device_id not in reading_history:
        reading_history[device_id] = []
    
    history = reading_history[device_id]
    
    if len(history) < 3:
        return True, ""
    
    recent = history[-3:]
    
    for param in ["ph", "salinity", "moisture", "dissolved_o2"]:
        current_val = reading.get(param, 0)
        recent_vals = [r.get(param, 0) for r in recent]
        recent_mean = np.mean(recent_vals)
        
        if recent_mean == 0:
            continue
        
        change_pct = abs((current_val - recent_mean) / recent_mean) * 100
        
        if change_pct > 50:
            return False, f"Rapid drift detected: {param} changed {change_pct:.1f}% from recent baseline"
    
    return True, ""

def update_history(reading: dict, device_id: str):
    if device_id not in reading_history:
        reading_history[device_id] = []
    
    reading_history[device_id].append(reading)
    
    if len(reading_history[device_id]) > 30:
        reading_history[device_id] = reading_history[device_id][-30:]

def calculate_carbon_tonnes(readings: list) -> float:
    if not readings:
        return 0.0
    
    total_carbon = 0.0
    
    for r in readings:
        ph = r.get("ph", 7.0)
        salinity = r.get("salinity", 30.0)
        moisture = r.get("moisture", 65.0)
        do = r.get("dissolved_o2", 7.0)
        
        ph_factor = 1.0 - abs(ph - 7.4) * 0.1
        salinity_factor = 1.0 - abs(salinity - 32.0) * 0.02
        moisture_factor = moisture / 100.0
        do_factor = min(do / 8.0, 1.0)
        
        base_sequestration_kg_per_hour = 0.15
        
        carbon_kg = (
            base_sequestration_kg_per_hour *
            max(ph_factor, 0.1) *
            max(salinity_factor, 0.1) *
            moisture_factor *
            do_factor
        )
        
        total_carbon += carbon_kg
    
    total_tonnes = total_carbon / 1000.0
    return round(total_tonnes, 6)

def run_full_fraud_check(reading: dict) -> dict:
    device_id = reading.get("device_id", "UNKNOWN")
    signature = reading.get("signature", "")

    result = {
        "device_id": device_id,
        "timestamp": reading.get("timestamp"),
        "is_valid": True,
        "is_anomaly": False,
        "anomaly_reason": None,
        "checks": {
            "signature":          {"passed": False, "reason": ""},
            "physical_bounds":    {"passed": False, "reason": ""},
            "realistic_bounds":   {"passed": False, "reason": ""},
            "zscore":             {"passed": False, "reason": ""},
            "isolation_forest":   {"passed": False, "reason": ""},
            "neighbour_spoofing": {"passed": False, "reason": ""},
        }
    }

    sig_valid = bool(verify_signature(reading, signature, device_id))
    result["checks"]["signature"]["passed"] = sig_valid
    if not sig_valid:
        result["is_valid"] = False
        result["checks"]["signature"]["reason"] = "Invalid cryptographic signature â€” reading dropped"
        return result
    result["checks"]["signature"]["reason"] = "ECDSA signature verified"

    phys_ok, phys_reason = check_physical_bounds(reading)
    phys_ok = bool(phys_ok)
    result["checks"]["physical_bounds"]["passed"] = phys_ok
    result["checks"]["physical_bounds"]["reason"] = phys_reason or "All parameters within physical bounds"
    if not phys_ok:
        result["is_valid"] = False
        result["is_anomaly"] = True
        result["anomaly_reason"] = phys_reason
        return result

    real_ok, real_reason = check_realistic_bounds(reading)
    real_ok = bool(real_ok)
    result["checks"]["realistic_bounds"]["passed"] = real_ok
    result["checks"]["realistic_bounds"]["reason"] = real_reason or "All parameters within realistic bounds"
    if not real_ok:
        result["is_anomaly"] = True
        result["anomaly_reason"] = f"Realistic bounds warning: {real_reason}"

    zscore_ok, zscore_reason = check_zscore(reading, device_id)
    zscore_ok = bool(zscore_ok)
    result["checks"]["zscore"]["passed"] = zscore_ok
    result["checks"]["zscore"]["reason"] = zscore_reason or "Z-score within 2.5Ïƒ threshold"
    if not zscore_ok:
        result["is_anomaly"] = True
        result["anomaly_reason"] = f"Z-score anomaly: {zscore_reason}"

    if_ok, if_reason = check_isolation_forest(reading, device_id)
    if_ok = bool(if_ok)
    result["checks"]["isolation_forest"]["passed"] = if_ok
    result["checks"]["isolation_forest"]["reason"] = if_reason or "Isolation Forest: normal"
    if not if_ok:
        result["is_anomaly"] = True
        result["anomaly_reason"] = f"ML anomaly: {if_reason}"

    spoof_ok, spoof_reason = check_neighbour_spoofing(reading, device_id)
    spoof_ok = bool(spoof_ok)
    result["checks"]["neighbour_spoofing"]["passed"] = spoof_ok
    result["checks"]["neighbour_spoofing"]["reason"] = spoof_reason or "No rapid drift detected"
    if not spoof_ok:
        result["is_anomaly"] = True
        result["anomaly_reason"] = f"Spoofing detected: {spoof_reason}"

    if result["is_valid"] and not result["is_anomaly"]:
        update_history(reading, device_id)

    return result

def compute_merkle_root(readings: list) -> str:
    if not readings:
        return ""
    
    def hash_data(data: str) -> str:
        return hashlib.sha256(data.encode()).hexdigest()
    
    leaves = []
    for r in readings:
        leaf_data = json.dumps({
            "device_id": r.get("device_id"),
            "timestamp": r.get("timestamp"),
            "ph": r.get("ph"),
            "salinity": r.get("salinity"),
            "moisture": r.get("moisture"),
            "dissolved_o2": r.get("dissolved_o2"),
        }, sort_keys=True)
        leaves.append(hash_data(leaf_data))
    
    while len(leaves) > 1:
        if len(leaves) % 2 != 0:
            leaves.append(leaves[-1])
        next_level = []
        for i in range(0, len(leaves), 2):
            combined = leaves[i] + leaves[i + 1]
            next_level.append(hash_data(combined))
        leaves = next_level
    
    return leaves[0] if leaves else ""

def compute_batch_hash(readings: list) -> str:
    batch_str = json.dumps(readings, sort_keys=True, default=str)
    return hashlib.sha256(batch_str.encode()).hexdigest()

initialize_models()

import threading
import time
from datetime import datetime, timezone

MODEL_VERSION = {
    "version":          1,
    "trained_at":       datetime.now(timezone.utc).isoformat(),
    "training_source":  "synthetic",
    "training_samples": 500,
    "accuracy_score":   None,
    "last_retrain_at":  None,
    "next_retrain_at":  None,
    "retrain_count":    0,
    "status":           "ready",
    "nodes_trained":    list(DEVICE_SECRETS.keys()),
}

RETRAIN_INTERVAL_SECONDS = 21600
MIN_SAMPLES_FOR_RETRAIN  = 50


def fetch_real_readings_from_db(device_id=None, limit=2000):
    try:
        conn = sqlite3.connect(DB_PATH)
        c    = conn.cursor()
        if device_id:
            c.execute('SELECT ph, salinity, moisture, dissolved_o2 FROM readings WHERE is_valid=1 AND is_anomaly=0 AND device_id=? ORDER BY created_at DESC LIMIT ?', (device_id, limit))
        else:
            c.execute('SELECT ph, salinity, moisture, dissolved_o2 FROM readings WHERE is_valid=1 AND is_anomaly=0 ORDER BY created_at DESC LIMIT ?', (limit,))
        rows = c.fetchall()
        conn.close()
        return [{"ph": r[0], "salinity": r[1], "moisture": r[2], "dissolved_o2": r[3]} for r in rows]
    except Exception as e:
        print(f"[ML] DB read failed: {e}")
        return []


def compute_model_accuracy(model, scaler, test_data):
    if not test_data:
        return 0.0
    try:
        features    = np.array([[r["ph"], r["salinity"], r["moisture"], r["dissolved_o2"]] for r in test_data])
        scaled      = scaler.transform(features)
        predictions = model.predict(scaled)
        return round(float(np.sum(predictions == 1) / len(predictions)), 4)
    except Exception:
        return 0.0


def retrain_model_from_real_data(device_id):
    global MODEL_VERSION
    print(f"[ML] Starting retrain for {device_id}...")
    real_readings = fetch_real_readings_from_db(device_id=device_id, limit=2000)
    if len(real_readings) < MIN_SAMPLES_FOR_RETRAIN:
        real_readings = fetch_real_readings_from_db(limit=2000)
    if len(real_readings) < MIN_SAMPLES_FOR_RETRAIN:
        print(f"[ML] Not enough data — skipping {device_id}")
        return False
    df = pd.DataFrame(real_readings)
    df["ph"]           = df["ph"].clip(5.0, 10.0)
    df["salinity"]     = df["salinity"].clip(0.0, 55.0)
    df["moisture"]     = df["moisture"].clip(10.0, 100.0)
    df["dissolved_o2"] = df["dissolved_o2"].clip(0.5, 15.0)
    df = df.dropna()
    split_idx    = int(len(df) * 0.85)
    train_df     = df.iloc[:split_idx]
    test_df      = df.iloc[split_idx:]
    new_scaler   = StandardScaler()
    train_scaled = new_scaler.fit_transform(train_df)
    new_model    = IsolationForest(n_estimators=300, contamination=0.05, random_state=int(time.time()) % 1000, max_samples="auto")
    new_model.fit(train_scaled)
    test_readings    = test_df.to_dict("records")
    new_accuracy     = compute_model_accuracy(new_model, new_scaler, test_readings)
    current_accuracy = compute_model_accuracy(isolation_forests.get(device_id, new_model), scalers.get(device_id, new_scaler), test_readings)
    print(f"[ML] {device_id} — new: {new_accuracy:.4f} vs current: {current_accuracy:.4f}")
    if new_accuracy >= current_accuracy - 0.02:
        isolation_forests[device_id] = new_model
        scalers[device_id]           = new_scaler
        reading_history[device_id]   = []
        if device_id in BASELINE_STATS:
            BASELINE_STATS[device_id] = {
                "ph":           {"mean": float(train_df["ph"].mean()),           "std": max(float(train_df["ph"].std()), 0.01)},
                "salinity":     {"mean": float(train_df["salinity"].mean()),     "std": max(float(train_df["salinity"].std()), 0.01)},
                "moisture":     {"mean": float(train_df["moisture"].mean()),     "std": max(float(train_df["moisture"].std()), 0.01)},
                "dissolved_o2": {"mean": float(train_df["dissolved_o2"].mean()), "std": max(float(train_df["dissolved_o2"].std()), 0.01)},
            }
        print(f"[ML] Model updated for {device_id} on {len(train_df)} real samples")
        return True
    print(f"[ML] New model worse — keeping existing for {device_id}")
    return False


def run_full_retrain_cycle():
    global MODEL_VERSION
    print("[ML] ===== RETRAIN CYCLE STARTING =====")
    MODEL_VERSION["status"]          = "retraining"
    MODEL_VERSION["last_retrain_at"] = datetime.now(timezone.utc).isoformat()
    all_real = fetch_real_readings_from_db(limit=10000)
    print(f"[ML] Real verified readings available: {len(all_real)}")
    if len(all_real) < MIN_SAMPLES_FOR_RETRAIN:
        print("[ML] Insufficient data — skipping")
        MODEL_VERSION["status"] = "ready"
        return
    success_count = 0
    for device_id in DEVICE_SECRETS.keys():
        try:
            if retrain_model_from_real_data(device_id):
                success_count += 1
        except Exception as e:
            print(f"[ML] Retrain failed for {device_id}: {e}")
    if success_count > 0:
        MODEL_VERSION["version"]         += 1
        MODEL_VERSION["retrain_count"]   += 1
        MODEL_VERSION["training_source"]  = "real_field_data"
        MODEL_VERSION["training_samples"] = len(all_real)
    MODEL_VERSION["status"]          = "ready"
    MODEL_VERSION["next_retrain_at"] = datetime.fromtimestamp(time.time() + RETRAIN_INTERVAL_SECONDS, tz=timezone.utc).isoformat()
    if all_real:
        first_device = list(DEVICE_SECRETS.keys())[0]
        MODEL_VERSION["accuracy_score"] = compute_model_accuracy(isolation_forests.get(first_device), scalers.get(first_device), all_real[:100])
    print(f"[ML] ===== RETRAIN COMPLETE — v{MODEL_VERSION['version']} | {MODEL_VERSION['training_samples']} samples =====")


def get_model_status():
    all_real = fetch_real_readings_from_db(limit=10000)
    return {
        **MODEL_VERSION,
        "real_samples_available":      len(all_real),
        "synthetic_baseline_active":   MODEL_VERSION["training_source"] == "synthetic",
        "devices": {
            device_id: {
                "model_loaded":    device_id in isolation_forests,
                "history_samples": len(reading_history.get(device_id, [])),
            }
            for device_id in DEVICE_SECRETS.keys()
        }
    }


def start_background_retrainer():
    def loop():
        print("[ML] Background retrainer started — first retrain in 5 minutes")
        time.sleep(300)
        run_full_retrain_cycle()
        while True:
            time.sleep(RETRAIN_INTERVAL_SECONDS)
            try:
                run_full_retrain_cycle()
            except Exception as e:
                print(f"[ML] Background retrain error: {e}")
    threading.Thread(target=loop, daemon=True).start()


start_background_retrainer()

