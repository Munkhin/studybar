# tutor gpt orchestrator
# supports multimodal messages, persistent chat history

import os, json
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

from studybar.tutor_gpt.question_generator import ProblemGenerator
from studybar.document_embedding import BucketedIndex
from studybar.tutor_gpt.feedback import get_feedback
from studybar.tutor_gpt.proficiency_adjuster import adjust_proficiency
from studybar.student_profile import StudentProfile

load_dotenv()
client = OpenAI()


# ---------- absolute base data path ----------
BASE_DATA_DIR = "/workspaces/studybar/studybar/data"


class TutorGPT:
    def __init__(self, student_id, subject,
                 data_dir=BASE_DATA_DIR,
                 embeddings_dir=os.path.join(BASE_DATA_DIR, "embeddings")):
        self.student_id = student_id
        self.subject = subject
        self.data_dir = data_dir

        # profile handling
        profile_path = os.path.join(BASE_DATA_DIR, "student_profiles.json")
        self.profile = StudentProfile(student_id, db_path=profile_path)

        # topic embeddings and generator
        self.index = BucketedIndex(embeddings_dir)
        self.generator = ProblemGenerator(self.index)

        # set up per-student conversation memory
        student_dir = os.path.join(data_dir, "students", student_id)
        os.makedirs(student_dir, exist_ok=True)
        self.convo_path = os.path.join(student_dir, f"{subject}_conversation.jsonl")

        self.conversation_history = self._load_conversation()
        self.last_response_id = None

    # ---------- conversation persistence ----------
    def _load_conversation(self):
        if os.path.exists(self.convo_path):
            with open(self.convo_path, "r", encoding="utf-8") as f:
                return [json.loads(line) for line in f]
        return [{"role": "system", "content": f"You are a {self.subject} tutor helping a student learn interactively."}]

    def _save_conversation(self):
        with open(self.convo_path, "w", encoding="utf-8") as f:
            for m in self.conversation_history:
                f.write(json.dumps(m, ensure_ascii=False) + "\n")

    # ---------- cheap intent classifier ----------
    def classify_intent(self, user_prompt):
        prompt = f"""
        Classify this student message into one of the intents:
        ["generate_questions", "get_feedback", "rag_query", "general_chat"].
        Message: "{user_prompt}"
        Respond with just the label.
        """
        try:
            resp = client.responses.create(
                model="gpt-4o-nano",
                input=prompt
            )
            intent = getattr(resp, "output_text", "").strip().lower().split()[0]
            print(f"[DEBUG intent response]: {intent}")
            return intent
        except Exception as e:
            print("[Error in classify_intent]", e)
            return "general_chat"

    # ---------- LLM helper ----------
    def call_llm(self, messages):
        try:
            params = {"model": "gpt-5-mini", "input": messages}
            if self.last_response_id:
                params["previous_response_id"] = self.last_response_id
            resp = client.responses.create(**params)
            self.last_response_id = resp.id
            return getattr(resp, "output_text", "").strip()
        except Exception as e:
            import traceback; traceback.print_exc()
            print(f"[LLM Error] {e}")
            return "[Error] Something went wrong calling the tutor model."

    # ---------- main handler ----------
    def handle_prompt(self, user_prompt):
        self.conversation_history.append({"role": "user", "content": user_prompt})
        intent = self.classify_intent(user_prompt)
        print(f"[Intent: {intent}]")

        if intent == "generate_questions":
            reply = self._handle_question_generation()
        elif intent == "get_feedback":
            reply = self._handle_feedback()
        elif intent == "rag_query":
            reply = self._handle_rag_query(user_prompt)
        else:
            reply = self.call_llm(self.conversation_history)

        self.conversation_history.append({"role": "assistant", "content": reply})
        self._save_conversation()
        return reply

    # ---------- specific handlers ----------
    def _handle_question_generation(self):
        topic = self.profile.data["last_activity"] or "atomic_structure"
        prof = self.profile.get_level(topic)
        result = self.generator.generate_problems(topic, n=3, difficulty=prof)
        problems = result["problems"]
        reply = "\n\n".join([f"Q{i+1}: {p['question']}" for i, p in enumerate(problems)])
        return reply

    def _handle_feedback(self):
        topic = self.profile.data["last_activity"] or "atomic_structure"
        context = "Relevant notes or retrieved context"  # to be replaced with RAG context
        answer_path = "/path/to/student/answer.pdf"

        try:
            result = get_feedback(answer_path, "previous question", context, topic)
        except Exception as e:
            import traceback; traceback.print_exc()
            return f"[Error] Feedback failed: {e}"

        score = result.get("score", 0)
        q_type = "structured"
        old_level = self.profile.get_level(topic)
        new_level = adjust_proficiency(old_level, score, q_type)
        self.profile.update_level(topic, new_level)

        return f"Score: {score:.2f}\nFeedback: {result.get('feedback')}\nNew proficiency: {new_level:.2f}"


# ---------- absolute log path ----------
LOG_FILE = os.path.join(BASE_DATA_DIR, "tutor_debug.log")

def debug_log(*args):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now().isoformat()}] " + " ".join(map(str, args)) + "\n")

    def _handle_rag_query(self, query):
        topic = self.profile.data["last_activity"] or "atomic_structure"
        contexts = self.index.get_contexts(topic, student_level=self.profile.get_level(topic), k=6)
        ctext = "\n\n".join([c["text"] for c in contexts[:5]])
        prompt = f"Answer this based only on the following:\n\n{ctext}\n\nQuestion: {query}"
        return self.call_llm([{"role": "user", "content": prompt}])


if __name__ == "__main__":
    import traceback
    tutor = TutorGPT(student_id="alice", subject="chemistry")
    print("TutorGPT ready. Type something:")
    while True:
        try:
            user_in = input("You: ")
            if user_in.lower() in ["quit", "exit"]:
                break
            print("Tutor:", tutor.handle_prompt(user_in))
        except Exception as e:
            traceback.print_exc()
            print(f"[Error] {e}")
