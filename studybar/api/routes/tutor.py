from fastapi import APIRouter, Form
from studybar.tutor_gpt.tutor_gpt import TutorGPT
import os, json

router = APIRouter()
TUTOR_INSTANCES = {}  # cache tutors per student+subject

def get_tutor(student_id: str, subject: str):
    key = f"{student_id}_{subject}"
    if key not in TUTOR_INSTANCES:
        TUTOR_INSTANCES[key] = TutorGPT(student_id=student_id, subject=subject)
    return TUTOR_INSTANCES[key]

@router.post("/chat")
def chat_with_tutor(student_id: str = Form(...), subject: str = Form(...), message: str = Form(...)):
    tutor = get_tutor(student_id, subject)
    reply = tutor.handle_prompt(message)
    return {"reply": reply}

@router.get("/{student_id}/{subject}/history")
def get_conversation(student_id: str, subject: str):
    convo_path = f"/workspaces/studybar/studybar/data/students/{student_id}/{subject}_conversation.jsonl"
    if not os.path.exists(convo_path):
        return {"status": "empty"}
    with open(convo_path, "r", encoding="utf-8") as f:
        return {"status": "ok", "messages": [json.loads(line) for line in f]}
