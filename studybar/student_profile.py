# student data handling

import os
import json
from datetime import datetime

class StudentProfile:
    def __init__(self, student_id, db_path="data/student_profiles.json"):
        self.student_id = student_id
        self.db_path = db_path
        self.data = self._load_profile()

    def _load_profile(self):
        if os.path.exists(self.db_path):
            with open(self.db_path, "r", encoding="utf-8") as f:
                profiles = json.load(f)
        else:
            profiles = {}

        if self.student_id not in profiles:
            profiles[self.student_id] = {
                "proficiencies": {},  # topic -> level
                "last_activity": None
            }
            self.data = profiles[self.student_id]  # Set self.data before saving
            self._save_profiles(profiles)
        else:
            self.data = profiles[self.student_id]
        return self.data

    def _save_profiles(self, all_profiles=None):
        # Ensure the directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        if all_profiles is None:
            if os.path.exists(self.db_path):
                with open(self.db_path, "r", encoding="utf-8") as f:
                    all_profiles = json.load(f)
            else:
                all_profiles = {}
        all_profiles[self.student_id] = self.data
        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump(all_profiles, f, indent=2)

    def get_level(self, topic):
        return self.data["proficiencies"].get(topic, 0.0)

    def update_level(self, topic, new_level):
        self.data["proficiencies"][topic] = new_level
        self.data["last_activity"] = datetime.now().isoformat()
        self._save_profiles()
