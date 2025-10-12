from fastapi import APIRouter
from studybar import db

router = APIRouter()


@router.get("/{student_id}")
def get_user(student_id: str):
    user = db.get_user(student_id)
    if not user:
        return {"status": "error", "message": "User not found"}
    return {"status": "ok", "user": user}

@router.get("/{student_id}/progress")
def get_progress(student_id: str):
    chapters = db.list_chapters()
    progress = db.get_progress_for_user(student_id)
    # Merge chapter titles with progress rows
    prog_map = {p["key"]: p["progress"] for p in progress}
    result = []
    for c in chapters:
        result.append({"key": c["key"], "title": c["title"], "progress": prog_map.get(c["key"], 0)})
    return {"status": "ok", "chapters": result}


@router.get("/chapters")
def list_chapters():
    return {"status": "ok", "chapters": db.list_chapters()}
