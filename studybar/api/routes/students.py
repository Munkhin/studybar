from fastapi import APIRouter, HTTPException
from studybar.student_profile import StudentProfile

router = APIRouter()


@router.get("/{student_id}")
def get_profile(student_id: str):
    try:
        sp = StudentProfile(student_id)
        return {"status": "ok", "profile": sp.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{student_id}")
def update_profile(student_id: str, body: dict):
    try:
        sp = StudentProfile(student_id)
        # only allow updating proficiencies and last_activity for now
        if "proficiencies" in body:
            sp.data["proficiencies"].update(body["proficiencies"])
        if "last_activity" in body:
            sp.data["last_activity"] = body["last_activity"]
        sp._save_profiles()
        return {"status": "ok", "profile": sp.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
