from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from studybar.flashcard_maker.flashcard_maker import (
    file_hash,
    load_cache,
)
from studybar.api.job_store import create_job, get_job
from studybar.api.processor import process_pdf_job
import os, tempfile, json, uuid

router = APIRouter()


def _make_job_id():
    return uuid.uuid4().hex


def _process_and_cache(tmp_path: str, job_id: str):
    # small wrapper to call the processor (keeps backward compatibility for BackgroundTasks)
    process_pdf_job(job_id)


@router.post("/generate")
async def generate_flashcards(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    """
    Accept a PDF and start background processing immediately. Returns a job id which can be
    polled via `/status/{job_id}` and the final result retrieved via `/job/{job_id}`.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # If cached, return immediately
    cached = load_cache(tmp_path)
    if cached:
        return {"status": "cached", "flashcards": cached}

    job_id = _make_job_id()
    create_job(job_id, tmp_path)

    # schedule background work
    if background_tasks is not None:
        background_tasks.add_task(_process_and_cache, tmp_path, job_id)
    else:
        # fallback: spawn a thread-like immediate call (not ideal for production)
        _process_and_cache(tmp_path, job_id)

    return {"status": "accepted", "job_id": job_id}


@router.get("/status/{job_id}")
def get_job_status(job_id: str):
    j = get_job(job_id)
    if not j:
        return {"status": "not_found"}
    response = {"status": j.get("status")}
    if j.get("status") == "error":
        response["error"] = j.get("error")
    return response


@router.get("/job/{job_id}")
def get_job_result(job_id: str):
    j = get_job(job_id)
    if not j:
        return {"status": "not_found"}
    if j.get("status") != "done":
        return {"status": j.get("status")}
    return {"status": "ok", "flashcards": j.get("result")}


@router.get("/{pdf_hash}")
def get_cached_flashcards(pdf_hash: str):
    cache_file = f"/workspaces/studybar/studybar/flashcard_maker/cache/pdfs/{pdf_hash}.json"
    if not os.path.exists(cache_file):
        return {"status": "not_found"}
    with open(cache_file, "r", encoding="utf-8") as f:
        return {"status": "ok", "flashcards": json.load(f)}
