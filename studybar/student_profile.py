# student data handling

import os
import json
from datetime import datetime
from . import db


class StudentProfile:
    def __init__(self, student_id, db_path=None):
        self.student_id = student_id
        # migrate existing JSON if present
        profiles_json = os.path.join(os.path.dirname(__file__), "data", "student_profiles.json")
        if os.path.exists(profiles_json):
            try:
                db.migrate_profiles_json(profiles_json)
            except Exception:
                pass

        self.data = db.get_user(student_id) or {"proficiencies": {}, "last_activity": None}

    def get_level(self, topic):
        # stored proficiency in data may be 0..1 or 0..100; normalize to 0..1
        val = self.data.get("proficiencies", {}).get(topic, 0.0)
        try:
            f = float(val)
            if f > 1:
                return f / 100.0
            return f
        except Exception:
            return 0.0

    def update_level(self, topic, new_level):
        if "proficiencies" not in self.data:
            self.data["proficiencies"] = {}
        self.data["proficiencies"][topic] = float(new_level)
        self.data["last_activity"] = datetime.now().isoformat()
        db.upsert_user(self.student_id, self.data)
