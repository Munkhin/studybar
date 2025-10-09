import os
import sqlite3
import json
from typing import List, Dict, Any

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(BASE_DIR, "data", "studybar_users.sqlite")


def ensure_db_dir():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


def get_conn():
    ensure_db_dir()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    cur = conn.cursor()
    # users table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            data JSON
        )
        """
    )

    # chapters table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS chapters (
            key TEXT PRIMARY KEY,
            title TEXT
        )
        """
    )

    # progress table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS progress (
            user_id TEXT,
            chapter_key TEXT,
            progress REAL,
            PRIMARY KEY (user_id, chapter_key),
            FOREIGN KEY(chapter_key) REFERENCES chapters(key)
        )
        """
    )

    conn.commit()
    conn.close()


def migrate_profiles_json(json_path: str):
    # If JSON file exists, migrate its proficiencies into users table (as data)
    if not os.path.exists(json_path):
        return
    init_db()
    with open(json_path, "r", encoding="utf-8") as f:
        profiles = json.load(f)

    conn = get_conn()
    cur = conn.cursor()
    for student_id, pdata in profiles.items():
        cur.execute(
            "INSERT OR REPLACE INTO users (id, data) VALUES (?, ?)",
            (student_id, json.dumps(pdata)),
        )
        # Optionally migrate proficiencies to progress rows: map topic -> chapter_key
        profs = pdata.get("proficiencies", {})
        for topic, level in profs.items():
            # treat topic as chapter_key
            cur.execute(
                "INSERT OR REPLACE INTO progress (user_id, chapter_key, progress) VALUES (?, ?, ?)",
                (student_id, topic, float(level) * 100.0),
            )

    conn.commit()
    conn.close()


def get_user(student_id: str) -> Dict[str, Any] | None:
    init_db()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT data FROM users WHERE id = ?", (student_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return json.loads(row["data"]) if isinstance(row["data"], str) else row["data"]


def upsert_user(student_id: str, data: Dict[str, Any]):
    init_db()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT OR REPLACE INTO users (id, data) VALUES (?, ?)",
        (student_id, json.dumps(data)),
    )
    conn.commit()
    conn.close()


def list_chapters() -> List[Dict[str, str]]:
    # seed chapters from test_pdfs if empty
    init_db()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT key, title FROM chapters")
    rows = cur.fetchall()
    if not rows:
        # try to seed from ../data/test_pdfs
        seed_dir = os.path.join(BASE_DIR, "data", "test_pdfs")
        if os.path.exists(seed_dir):
            for fname in os.listdir(seed_dir):
                key = os.path.splitext(fname)[0]
                title = key.replace("_", " ").title()
                cur.execute("INSERT OR IGNORE INTO chapters (key, title) VALUES (?, ?)", (key, title))
        # default fallback
        cur.execute("INSERT OR IGNORE INTO chapters (key, title) VALUES (?, ?)", ("atomic_structure", "Atomic Structure"))
        cur.execute("INSERT OR IGNORE INTO chapters (key, title) VALUES (?, ?)", ("energetics", "Energetics"))
        conn.commit()
        cur.execute("SELECT key, title FROM chapters")
        rows = cur.fetchall()

    chapters = [{"key": r["key"], "title": r["title"]} for r in rows]
    conn.close()
    return chapters


def get_progress_for_user(student_id: str) -> List[Dict[str, Any]]:
    init_db()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT c.key, c.title, IFNULL(p.progress, 0) as progress FROM chapters c LEFT JOIN progress p ON c.key = p.chapter_key AND p.user_id = ?",
        (student_id,)
    )
    rows = cur.fetchall()
    conn.close()
    return [{"key": r["key"], "title": r["title"], "progress": float(r["progress"])} for r in rows]


def set_progress(student_id: str, chapter_key: str, progress: float):
    init_db()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT OR REPLACE INTO progress (user_id, chapter_key, progress) VALUES (?, ?, ?)", (student_id, chapter_key, float(progress)))
    conn.commit()
    conn.close()
