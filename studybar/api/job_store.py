import sqlite3
import os
import json
from typing import Optional

DB_PATH = "/workspaces/studybar/studybar/data/job_store.sqlite"

def _ensure_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
    CREATE TABLE IF NOT EXISTS jobs (
        job_id TEXT PRIMARY KEY,
        status TEXT,
        pdf_path TEXT,
        result_json TEXT,
        error TEXT
    )
    """
    )
    conn.commit()
    conn.close()


def create_job(job_id: str, pdf_path: str):
    _ensure_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO jobs (job_id, status, pdf_path) VALUES (?, ?, ?)", (job_id, "pending", pdf_path))
    conn.commit()
    conn.close()


def update_status(job_id: str, status: str, result: Optional[list] = None, error: Optional[str] = None):
    _ensure_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    result_json = json.dumps(result, ensure_ascii=False) if result is not None else None
    c.execute("UPDATE jobs SET status = ?, result_json = ?, error = ? WHERE job_id = ?", (status, result_json, error, job_id))
    conn.commit()
    conn.close()


def get_job(job_id: str):
    _ensure_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT job_id, status, pdf_path, result_json, error FROM jobs WHERE job_id = ?", (job_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    job_id, status, pdf_path, result_json, error = row
    result = json.loads(result_json) if result_json else None
    return {"job_id": job_id, "status": status, "pdf_path": pdf_path, "result": result, "error": error}
