# question, answer, context -> correctness score, guiding questions

import json
import re
import sqlite3
import os
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

class AnswerMarker:
    def __init__(self, log_dir="data/error_logs", db_path="data/error_logs.db"):
        # convert to absolute paths
        base_dir = os.path.abspath(os.path.dirname(__file__))
        log_dir = os.path.abspath(os.path.join(base_dir, "..", "..", log_dir))
        db_path = os.path.abspath(os.path.join(base_dir, "..", "..", db_path))

        os.makedirs(log_dir, exist_ok=True)
        self.log_path = os.path.join(log_dir, f"errors_{datetime.now().strftime('%Y%m%d')}.jsonl")
        self.db_path = db_path

        # Setup SQLite DB
        self._init_db()

    def _init_db(self):
        """
        Initialize SQLite table if it doesn't exist.
        """
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("""
        CREATE TABLE IF NOT EXISTS error_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            topic TEXT,
            question TEXT,
            answer TEXT,
            score REAL,
            feedback TEXT,
            guiding_questions TEXT
        )
        """)
        conn.commit()
        conn.close()

    def mark(self, student_answer, question_text, reference_context, topic=None):
        """
        Assess correctness and provide feedback.
        Optionally include topic for structured logging.
        """
        prompt = f"""
        You are a professional tutor assessing a student's written answer.
        Question: {question_text}
        Reference Material: {reference_context}
        Student Answer: {student_answer}

        1. Rate correctness on a scale of 0.0 to 1.0.
        2. If incorrect or incomplete, provide concise *guiding questions*
           that nudge the student to recall the correct idea
           without directly giving the answer.
        3. Return JSON like:
        {{
          "score": float,
          "feedback": str,
          "guiding_questions": [str]/null
        }}
        """

        resp = client.responses.create(
            model="gpt-5-mini",
            reasoning={"effort": "low"},
            input=prompt,
        )
        raw = getattr(resp, "output_text", "").strip()

        try:
            result = json.loads(raw)
        except Exception:
            m = re.search(r"(\{.*\})", raw, re.S)
            result = json.loads(m.group(1)) if m else {"score": 0.0, "feedback": raw, "guiding_questions": []}

        # Append to error logs if below threshold
        if result.get("score", 0) < 0.7:
            self._log_error(question_text, student_answer, result, topic)

        return result

    def _log_error(self, question, answer, result, topic=None):
        """
        Append errors to both daily JSONL and persistent SQLite DB.
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "topic": topic or "unknown",
            "question": question,
            "answer": answer,
            "score": result.get("score", 0),
            "feedback": result.get("feedback", ""),
            "guiding_questions": result.get("guiding_questions", []),
        }

        # Write to JSONL
        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

        # Write to SQLite
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("""
            INSERT INTO error_logs (timestamp, topic, question, answer, score, feedback, guiding_questions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            entry["timestamp"],
            entry["topic"],
            entry["question"],
            entry["answer"],
            entry["score"],
            entry["feedback"],
            json.dumps(entry["guiding_questions"], ensure_ascii=False),
        ))
        conn.commit()
        conn.close()

    def get_errors_by_topic(self, topic):
        """
        Retrieve all errors for a given topic.
        """
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT timestamp, question, score, feedback FROM error_logs WHERE topic = ? ORDER BY timestamp DESC", (topic,))
        rows = c.fetchall()
        conn.close()
        return rows
