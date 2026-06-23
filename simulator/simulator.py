import requests
import time
import random
import math
import json
import hashlib
from datetime import datetime

BACKEND_URL = "http://127.0.0.1:8000"

DEVICES = {
    "NODE_001": {
        "secret":  "demo_secret_key_001",
        "gps_lat": "20.3974",
        "gps_lon": "86.7443",
        "name":    "Bhitarkanika North Plot",
        "baseline": {
            "ph":           7.4,
            "salinity":     32.0,
            "moisture":     68.0,
            "dissolved_o2": 7.2,
        }
    },
    "NODE_002": {
        "secret":  "demo_secret_key_002",
        "gps_lat": "20.4125",
        "gps_lon": "86.7891",
        "name":    "Bhitarkanika South Plot",
        "baseline": {
            "ph":           7.6,
            "salinity":     28.0,
            "moisture":     72.0,
            "dissolved_o2": 6.8,
        }
    },
    "NODE_003": {
        "secret":  "demo_secret_key_003",
        "gps_lat": "20.3856",
        "gps_lon": "86.7612",
        "name":    "Bhitarkanika East Plot",
        "baseline": {
            "ph":           7.2,
            "salinity":     35.0,
            "moisture":     65.0,
            "dissolved_o2": 7.8,
        }
    },
}

anomaly_injection_counter = 0
ANOMALY_EVERY_N_READINGS  = 7

def generate_signature(device_id, ph, salinity, moisture, dissolved_o2, timestamp, secret):
    payload_str = (
        str(device_id) +
        str(ph) +
        str(salinity) +
        str(moisture) +
        str(dissolved_o2) +
        str(timestamp)
    )
    hash_val = 0
    for char in payload_str:
        hash_val = hash_val * 31 + ord(char)
    hash_val &= 0xFFFFFFFFFFFFFFFF
    signature = format(hash_val, 'x') + format(timestamp & 0xFFFFFF, 'x')
    return signature

def generate_normal_reading(device_id, t):
    device   = DEVICES[device_id]
    baseline = device["baseline"]

    ph = round(
        baseline["ph"] +
        0.3 * math.sin(t / 3600) +
        random.gauss(0, 0.05),
        2
    )
    salinity = round(
        baseline["salinity"] +
        2.5 * math.cos(t / 7200) +
        random.gauss(0, 0.3),
        2
    )
    moisture = round(
        baseline["moisture"] +
        8.0 * math.sin(t / 1800) +
        random.gauss(0, 1.0),
        2
    )
    dissolved_o2 = round(
        baseline["dissolved_o2"] +
        0.8 * math.sin(t / 5400) +
        random.gauss(0, 0.1),
        2
    )

    ph           = max(6.5, min(8.5, ph))
    salinity     = max(20.0, min(40.0, salinity))
    moisture     = max(30.0, min(95.0, moisture))
    dissolved_o2 = max(4.0, min(12.0, dissolved_o2))

    return ph, salinity, moisture, dissolved_o2

def generate_anomaly_reading(anomaly_type):
    if anomaly_type == "spike":
        ph           = round(random.uniform(11.5, 13.5), 2)
        salinity     = round(random.uniform(55.0, 60.0), 2)
        moisture     = round(random.uniform(5.0,  10.0), 2)
        dissolved_o2 = round(random.uniform(0.5,  1.5),  2)
        reason       = "SUDDEN SPIKE — physically impossible values"

    elif anomaly_type == "drift":
        ph           = round(random.uniform(9.5, 11.0), 2)
        salinity     = round(random.uniform(48.0, 54.0), 2)
        moisture     = round(random.uniform(10.0, 20.0), 2)
        dissolved_o2 = round(random.uniform(1.5,  3.0),  2)
        reason       = "SLOW DRIFT — gradual movement beyond realistic bounds"

    else:
        ph           = round(random.uniform(10.0, 12.0), 2)
        salinity     = round(random.uniform(50.0, 58.0), 2)
        moisture     = round(random.uniform(8.0,  18.0), 2)
        dissolved_o2 = round(random.uniform(1.0,  2.5),  2)
        reason       = "NEIGHBOUR SPOOFING — values copied from adjacent node"

    return ph, salinity, moisture, dissolved_o2, reason

def send_reading(device_id, ph, salinity, moisture, dissolved_o2, is_anomaly=False, anomaly_reason=""):
    device    = DEVICES[device_id]
    timestamp = int(time.time())
    signature = generate_signature(
        device_id, ph, salinity,
        moisture, dissolved_o2,
        timestamp, device["secret"]
    )

    payload = {
        "device_id":    device_id,
        "timestamp":    timestamp,
        "gps_lat":      device["gps_lat"],
        "gps_lon":      device["gps_lon"],
        "ph":           ph,
        "salinity":     salinity,
        "moisture":     moisture,
        "dissolved_o2": dissolved_o2,
        "signature":    signature,
    }

    try:
        response = requests.post(
            f"{BACKEND_URL}/ingest",
            json=payload,
            timeout=10
        )
        result = response.json()

        status      = result.get("status", "unknown")
        fraud_result = result.get("fraud_result", {})
        checks_passed = sum(
            1 for c in fraud_result.get("checks", {}).values()
            if c.get("passed")
        )
        total_checks = len(fraud_result.get("checks", {}))

        print(f"\n{'='*65}")
        print(f"  DEVICE   : {device_id} — {device['name']}")
        print(f"  GPS      : {device['gps_lat']}, {device['gps_lon']}")
        print(f"  TIME     : {datetime.now().strftime('%H:%M:%S')}")
        print(f"  pH       : {ph}")
        print(f"  Salinity : {salinity} ppt")
        print(f"  Moisture : {moisture}%")
        print(f"  DO       : {dissolved_o2} mg/L")
        print(f"  STATUS   : {status.upper()}")
        print(f"  CHECKS   : {checks_passed}/{total_checks} passed")

        if is_anomaly:
            print(f"  [INJECTED ANOMALY] {anomaly_reason}")

        if status == "flagged":
            print(f"  FLAGGED  : {fraud_result.get('anomaly_reason', 'Unknown reason')}")
            print(f"  ACTION   : Node quarantined — DePIN guardian dispatched")
        else:
            print(f"  VERIFIED : Reading accepted into pipeline")

        pipeline = result.get("pipeline_stats", {})
        print(f"  PIPELINE : {pipeline.get('valid_readings',0)} valid | "
              f"{pipeline.get('anomalies_detected',0)} anomalies | "
              f"{pipeline.get('batches_created',0)} batches")

        return result

    except requests.exceptions.ConnectionError:
        print(f"[ERROR] Cannot connect to backend at {BACKEND_URL}")
        print(f"        Make sure uvicorn is running.")
        return None
    except Exception as e:
        print(f"[ERROR] {e}")
        return None

def send_wind_reading(extreme=False):
    if extreme:
        wind_speed = round(random.uniform(132.0, 165.0), 1)
    else:
        wind_speed = round(random.uniform(15.0, 85.0), 1)

    payload = {
        "wind_speed_mph": wind_speed,
        "location":       "20.3974,86.7443",
        "source":         "NOAA-simulated"
    }

    try:
        response = requests.post(
            f"{BACKEND_URL}/insurance/wind-reading",
            json=payload,
            timeout=10
        )
        result = response.json()

        print(f"\n{'='*65}")
        print(f"  WEATHER ORACLE UPDATE")
        print(f"  Wind Speed : {wind_speed} mph")
        print(f"  Threshold  : 130.0 mph")
        print(f"  Triggered  : {result.get('triggered', False)}")

        if result.get("triggered"):
            details = result.get("payout_details", {})
            print(f"  *** PARAMETRIC INSURANCE TRIGGERED ***")
            print(f"  Payout     : ${details.get('total_payout', 0):,.2f} USDC")
            print(f"  Guardian   : ${details.get('guardian_share', 0):,.2f} USDC")
            print(f"  Replanting : ${details.get('replanting_share', 0):,.2f} USDC")
            print(f"  Time       : {details.get('payout_time_seconds', 0)} seconds")
            print(f"  TX Hash    : {details.get('payout_tx_hash', '')[:20]}...")

        return result

    except Exception as e:
        print(f"[ERROR] Wind reading failed: {e}")
        return None

def print_banner():
    print("\n" + "="*65)
    print("  VERDCHAIN — Blue Carbon MRV Sensor Simulator")
    print("  Bhitarkanika Mangrove Reserve, Odisha, India")
    print("  Nodes: NODE_001, NODE_002, NODE_003")
    print("  Backend: http://127.0.0.1:8000")
    print("="*65)
    print("  Sending readings every 5 seconds")
    print("  Anomaly injection every 7 readings")
    print("  Wind oracle check every 10 readings")
    print("="*65 + "\n")

def run():
    global anomaly_injection_counter
    print_banner()

    reading_count = 0
    anomaly_types = ["spike", "drift", "spoofing"]

    while True:
        for device_id in DEVICES.keys():
            t = time.time()
            anomaly_injection_counter += 1
            reading_count += 1

            if anomaly_injection_counter >= ANOMALY_EVERY_N_READINGS:
                anomaly_type = random.choice(anomaly_types)
                ph, salinity, moisture, dissolved_o2, reason = generate_anomaly_reading(anomaly_type)
                send_reading(device_id, ph, salinity, moisture, dissolved_o2,
                             is_anomaly=True, anomaly_reason=reason)
                anomaly_injection_counter = 0
            else:
                ph, salinity, moisture, dissolved_o2 = generate_normal_reading(device_id, t)
                send_reading(device_id, ph, salinity, moisture, dissolved_o2)

            time.sleep(2)

        if reading_count % 10 == 0:
            extreme = random.random() < 0.15
            send_wind_reading(extreme=extreme)

        time.sleep(3)

if __name__ == "__main__":
    run()