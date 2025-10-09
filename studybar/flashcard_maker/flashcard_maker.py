# pdf text chunks -> flashcards
import sys
import os

# --- PATH MODIFICATION TO IMPORT FROM PARENT DIRECTORY ---
# 1. Get the absolute path of the current file's directory (flashcard_maker/)
current_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Get the parent directory (studybar/)
parent_dir = os.path.dirname(current_dir)

# 3. Add the parent directory to sys.path
sys.path.append(parent_dir)

from document_embedding import extract_text_chunks, get_openai_client

import re, json, os, hashlib, time
from dotenv import load_dotenv

load_dotenv()

# Use OpenAI client lazily via document_embedding.get_openai_client to avoid
# creating the client at import time (which can crash if SDK versions mismatch).

# ----------- Directory Setup -----------
BASE_DIR = "/workspaces/studybar/studybar/flashcard_maker"
CACHE_DIR = os.path.join(BASE_DIR, "cache", "pdfs")
os.makedirs(CACHE_DIR, exist_ok=True)


# caching helpers
def file_hash(pdf_path):
    """Compute a stable hash based on PDF content."""
    with open(pdf_path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()


def chunk_hash(text):
    """Stable hash for a chunk of text."""
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


def load_cache(pdf_path):
    """Load cached LLM results for a given PDF."""
    h = file_hash(pdf_path)
    cache_file = os.path.join(CACHE_DIR, f"{h}.json")
    if os.path.exists(cache_file):
        with open(cache_file, "r", encoding="utf-8") as f:
            try:
                print(f"[CACHE] Loaded results for {os.path.basename(pdf_path)}")
                return json.load(f)
            except json.JSONDecodeError:
                print(f"[WARN] Cache file corrupt for {pdf_path}. Ignoring.")
    return None


def save_cache(pdf_path, data):
    """Save extracted definitions for this PDF."""
    h = file_hash(pdf_path)
    cache_file = os.path.join(CACHE_DIR, f"{h}.json")
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[CACHE] Saved LLM output to {cache_file}")


def filter_definition_like(chunks):
    """Keep chunks that might contain definitions."""
    def looks_definitionish(text):
        return bool(re.search(r'\b(is|are|refers to|defined as|means)\b', text, re.I)) or ":" in text
    return [c for c in chunks if looks_definitionish(c["text"])]


# ----------- LLM Filter + Cache Integration -----------
def llm_filter(candidates, pdf_path):
    """LLM filter for definitions with per-PDF caching."""
    cached = load_cache(pdf_path)
    if cached:
        return cached

    system_prompt = """
You are a precise academic extractor.
Given raw text chunks from a study PDF, extract only *definitions* of terms or concepts.
Rules:
- Each valid definition must clearly define a concept (e.g. “Ionisation energy is the energy required…”)
- Ignore trends, explanations, trivia, graphs, and examples.
- If there are multiple related definitions (e.g. “first ionisation energy”, “second ionisation energy”), extract them separately.
- After completion, remove the low level terms (defined as contributing factors/building blocks to other definitions).
- Return output as a JSON array:
  [{"term": "...", "definition": "...", "page": <int>, "source_id": "<chunk_id>"}]
No text outside the JSON.
"""

    user_prompt = "\n\n".join(
        f"[{c['id']} | page {c['page']}]\n{c['text']}"
        for c in candidates
    )

    print(f"[LLM] Sending {len(candidates)} candidate chunks to GPT...")
    client = get_openai_client()
    if client is None:
        raise RuntimeError("OpenAI client not available. Configure OpenAI SDK to enable LLM-powered flashcard extraction.")

    response = client.responses.create(
        model="gpt-5-mini",
        reasoning={"effort": "medium"},
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )

    raw_output = getattr(response, "output_text", "").strip()
    match = re.search(r'(\[.*\])', raw_output, re.S)
    data = json.loads(match.group(1)) if match else []

    save_cache(pdf_path, data)
    return data


# ----------- Flashcard Generation -----------
def make_flashcards(chunks, pdf_path=None):
    # limit on length
    filtered_chunks = []
    for chunk in chunks:
        if len(chunk["text"]) <= 500:
            filtered_chunks.append(chunk)
    print(f"[INFO] Extracted {len(filtered_chunks)} text chunks from PDF")

    candidates = filter_definition_like(filtered_chunks)
    print(f"[INFO] {len(candidates)} candidate chunks likely contain definitions")
    definitions = llm_filter(candidates, pdf_path)
    print(f"[INFO] {len(definitions)} definitions extracted")
    print(json.dumps(definitions, indent=2, ensure_ascii=False))
    return definitions


# ----------- Main -----------
if __name__ == "__main__":
    # 1. Record the start time
    start_time = time.time()

    pdf_path = "/workspaces/studybar/studybar/data/test_pdfs/atomic_structure.pdf"
    chunks = extract_text_chunks(pdf_path)
    make_flashcards(chunks)

    # 2. Record the end time
    end_time = time.time()

    # 3. Calculate the elapsed time
    elapsed_time = end_time - start_time

    # 4. Print the result
    print("\n--- Timing Results ---")
    print(f"Total execution time: {elapsed_time:.4f} seconds")
    print("----------------------")
