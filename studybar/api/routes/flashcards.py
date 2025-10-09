from fastapi import APIRouter, UploadFile, File
from studybar.flashcard_maker.flashcard_maker import extract_text_chunks, make_flashcards, save_cache, load_cache, file_hash
import os, tempfile, json

router = APIRouter()

@router.post("/generate")
async def generate_flashcards(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    cached = load_cache(tmp_path)
    if cached:
        return {"status": "cached", "data": cached}

    chunks = extract_text_chunks(tmp_path)
    data = make_flashcards(chunks, pdf_path=tmp_path)
    save_cache(tmp_path, data)

    return {"status": "ok", "flashcards": data}

@router.get("/{pdf_hash}")
def get_cached_flashcards(pdf_hash: str):
    cache_file = f"/workspaces/studybar/studybar/flashcard_maker/cache/pdfs/{pdf_hash}.json"
    if not os.path.exists(cache_file):
        return {"status": "not_found"}
    with open(cache_file, "r", encoding="utf-8") as f:
        return {"status": "ok", "flashcards": json.load(f)}
