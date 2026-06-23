import sqlite3
import json
from datetime import datetime

DB_PATH = "verdchain.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            gps_lat TEXT NOT NULL,
            gps_lon TEXT NOT NULL,
            ph REAL NOT NULL,
            salinity REAL NOT NULL,
            moisture REAL NOT NULL,
            dissolved_o2 REAL NOT NULL,
            signature TEXT NOT NULL,
            is_valid INTEGER DEFAULT 1,
            is_anomaly INTEGER DEFAULT 0,
            anomaly_reason TEXT DEFAULT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS batches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_hash TEXT NOT NULL,
            merkle_root TEXT NOT NULL,
            reading_ids TEXT NOT NULL,
            tonnes REAL NOT NULL,
            minted INTEGER DEFAULT 0,
            contract_batch_id INTEGER DEFAULT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS guardian_patrols (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guardian_address TEXT NOT NULL,
            gps_lat TEXT NOT NULL,
            gps_lon TEXT NOT NULL,
            photo_hash TEXT,
            confirmations INTEGER DEFAULT 0,
            paid INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS insurance_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wind_speed REAL NOT NULL,
            threshold REAL NOT NULL,
            triggered INTEGER DEFAULT 0,
            payout_amount REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def insert_reading(data: dict):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO readings 
        (device_id, timestamp, gps_lat, gps_lon, ph, salinity, moisture, dissolved_o2, signature, is_valid, is_anomaly, anomaly_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data["device_id"], data["timestamp"], data["gps_lat"], data["gps_lon"],
        data["ph"], data["salinity"], data["moisture"], data["dissolved_o2"],
        data["signature"], data["is_valid"], data["is_anomaly"], data.get("anomaly_reason")
    ))
    conn.commit()
    reading_id = c.lastrowid
    conn.close()
    return reading_id

def get_recent_readings(limit=50):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM readings ORDER BY created_at DESC LIMIT ?', (limit,))
    rows = c.fetchall()
    conn.close()
    columns = ["id", "device_id", "timestamp", "gps_lat", "gps_lon", "ph", 
               "salinity", "moisture", "dissolved_o2", "signature", 
               "is_valid", "is_anomaly", "anomaly_reason", "created_at"]
    return [dict(zip(columns, row)) for row in rows]

def get_readings_for_batch(limit=6):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM readings WHERE is_valid=1 AND is_anomaly=0 ORDER BY created_at DESC LIMIT ?', (limit,))
    rows = c.fetchall()
    conn.close()
    columns = ["id", "device_id", "timestamp", "gps_lat", "gps_lon", "ph",
               "salinity", "moisture", "dissolved_o2", "signature",
               "is_valid", "is_anomaly", "anomaly_reason", "created_at"]
    return [dict(zip(columns, row)) for row in rows]

def insert_batch(batch_hash, merkle_root, reading_ids, tonnes):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO batches (batch_hash, merkle_root, reading_ids, tonnes)
        VALUES (?, ?, ?, ?)
    ''', (batch_hash, merkle_root, json.dumps(reading_ids), tonnes))
    conn.commit()
    batch_id = c.lastrowid
    conn.close()
    return batch_id

def get_batches():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM batches ORDER BY created_at DESC')
    rows = c.fetchall()
    conn.close()
    columns = ["id", "batch_hash", "merkle_root", "reading_ids", "tonnes", "minted", "contract_batch_id", "created_at"]
    return [dict(zip(columns, row)) for row in rows]

def mark_batch_minted(batch_id, contract_batch_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('UPDATE batches SET minted=1, contract_batch_id=? WHERE id=?', (contract_batch_id, batch_id))
    conn.commit()
    conn.close()

def insert_patrol(guardian_address, gps_lat, gps_lon, photo_hash):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO guardian_patrols (guardian_address, gps_lat, gps_lon, photo_hash)
        VALUES (?, ?, ?, ?)
    ''', (guardian_address, gps_lat, gps_lon, photo_hash))
    conn.commit()
    patrol_id = c.lastrowid
    conn.close()
    return patrol_id

def confirm_patrol(patrol_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('UPDATE guardian_patrols SET confirmations = confirmations + 1 WHERE id=?', (patrol_id,))
    conn.commit()
    conn.close()

def get_patrols():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM guardian_patrols ORDER BY created_at DESC')
    rows = c.fetchall()
    conn.close()
    columns = ["id", "guardian_address", "gps_lat", "gps_lon", "photo_hash", "confirmations", "paid", "created_at"]
    return [dict(zip(columns, row)) for row in rows]

def insert_insurance_event(wind_speed, threshold, triggered, payout_amount):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO insurance_events (wind_speed, threshold, triggered, payout_amount)
        VALUES (?, ?, ?, ?)
    ''', (wind_speed, threshold, triggered, payout_amount))
    conn.commit()
    conn.close()

def get_insurance_events():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM insurance_events ORDER BY created_at DESC LIMIT 20')
    rows = c.fetchall()
    conn.close()
    columns = ["id", "wind_speed", "threshold", "triggered", "payout_amount", "created_at"]
    return [dict(zip(columns, row)) for row in rows]