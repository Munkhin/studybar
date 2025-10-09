from fastapi import APIRouter
import os, json

router = APIRouter()

@router.get("/")
def list_errors():
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
    # normalize path
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
    logs_dir = os.path.join(base, "error_logs")
    results = []
    if not os.path.exists(logs_dir):
        return {"status": "ok", "errors": []}

    for fname in sorted(os.listdir(logs_dir), reverse=True):
        if not fname.lower().endswith(".json"):
            continue
        path = os.path.join(logs_dir, fname)
        try:
            with open(path, "r", encoding="utf-8") as f:
                entry = json.load(f)
                results.append(entry)
        except Exception:
            # skip malformed
            continue

    return {"status": "ok", "errors": results}
from fastapi import APIRouter, Query
import sqlite3
import os, json
from typing import List

router = APIRouter()

# Path to error DB used by marker.py (relative to studybar base)
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "error_logs.db")


def _connect_db():
    if not os.path.exists(DB_PATH):
        return None
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@router.get("/")
def list_errors(topic: str = Query(None), limit: int = 100):
    """Return recent error log entries. Optional topic filter."""
    conn = _connect_db()
    if not conn:
        return {"status": "no_db", "errors": []}

    cur = conn.cursor()
    if topic:
        cur.execute("SELECT timestamp as date, topic, question, answer, score, feedback FROM error_logs WHERE topic = ? ORDER BY timestamp DESC LIMIT ?", (topic, limit))
    else:
        cur.execute("SELECT timestamp as date, topic, question, answer, score, feedback FROM error_logs ORDER BY timestamp DESC LIMIT ?", (limit,))

    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"status": "ok", "errors": rows}
