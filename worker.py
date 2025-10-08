"""Simple worker to process pending flashcard jobs.
Run with: python worker.py
"""
import time
from studybar.api.job_store import _ensure_db, get_job
from studybar.api.processor import process_pdf_job
import sqlite3


def scan_pending():
    _ensure_db()
    conn = sqlite3.connect('/workspaces/studybar/studybar/data/job_store.sqlite')
    c = conn.cursor()
    c.execute("SELECT job_id FROM jobs WHERE status IN ('pending','processing')")
    rows = c.fetchall()
    conn.close()
    return [r[0] for r in rows]


def main():
    print('[worker] starting')
    while True:
        jobs = scan_pending()
        if not jobs:
            time.sleep(2)
            continue
        for job_id in jobs:
            print('[worker] processing', job_id)
            process_pdf_job(job_id)


if __name__ == '__main__':
    main()
