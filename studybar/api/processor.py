from studybar.flashcard_maker.flashcard_maker import extract_text_chunks, make_flashcards, save_cache, load_cache
from studybar.api.job_store import update_status, get_job
import os


def process_pdf_job(job_id: str):
    job = get_job(job_id)
    if not job:
        return
    pdf_path = job.get("pdf_path")
    if not pdf_path or not os.path.exists(pdf_path):
        update_status(job_id, "error", error="pdf not found")
        return

    try:
        update_status(job_id, "processing")
        cached = load_cache(pdf_path)
        if cached:
            update_status(job_id, "done", result=cached)
            return

        chunks = extract_text_chunks(pdf_path)
        data = make_flashcards(chunks, pdf_path=pdf_path)
        save_cache(pdf_path, data)
        update_status(job_id, "done", result=data)
    except Exception as e:
        update_status(job_id, "error", error=str(e))
